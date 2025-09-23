import { useState, useEffect } from 'react'
import { apiGet, apiPost, Table, Reservation } from '../lib/api'
import moment from 'moment-jalaali'
import { validatePhoneNumber, getPhoneValidationError } from '../utils/validation'

export function ReservationForm() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guests: 2,
    date: moment().format('jYYYY-jMM-jDD'), // Persian date format
    time: '12:00', // Default time
    table: ''
  })

  useEffect(() => {
    loadTables()
  }, [])

  // Clear error when step changes
  useEffect(() => {
    setError('')
  }, [currentStep])

  // Update time when date changes to prevent past time selection
  useEffect(() => {
    if (formData.date) {
      const formattedDate = formatPersianDate(formData.date)
      const persianDate = moment(formattedDate, 'jYYYY/jMM/jDD')
      const today = moment()
      
      if (persianDate.isSame(today, 'day')) {
        const currentTime = moment().format('HH:mm')
        if (formData.time && formData.time <= currentTime) {
          // Reset to next available time
          const nextHour = moment().add(1, 'hour').format('HH:00')
          setFormData(prev => ({ ...prev, time: nextHour }))
        }
      }
    }
  }, [formData.date])

  // Helper function to format Persian date
  const formatPersianDate = (date: string) => {
    // Convert from jYYYY-jMM-jDD to jYYYY/jMM/jDD format
    return date.replace(/-/g, '/')
  }

  // Helper function to validate date and time
  const validateDateTime = (date: string, time: string) => {
    const formattedDate = formatPersianDate(date)
    const persianDate = moment(formattedDate, 'jYYYY/jMM/jDD')
    
    if (!persianDate.isValid()) {
      return { valid: false, message: 'فرمت تاریخ نامعتبر است. مثال: 1403/01/15' }
    }

    const today = moment()
    if (persianDate.isBefore(today, 'day')) {
      return { valid: false, message: 'تاریخ نمی‌تواند در گذشته باشد' }
    }

    if (persianDate.isSame(today, 'day')) {
      const currentTime = moment().format('HH:mm')
      if (time <= currentTime) {
        return { valid: false, message: 'ساعت انتخاب شده نمی‌تواند در گذشته باشد' }
      }
    }

    return { valid: true, message: '' }
  }

  const loadTables = async () => {
    try {
      const response = await apiGet<Table[]>('/tables')
      setTables(response.data || [])
    } catch (err) {
      setError('خطا در بارگذاری لیست میزها')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate date and time
      const dateTimeValidation = validateDateTime(formData.date, formData.time)
      if (!dateTimeValidation.valid) {
        setError(dateTimeValidation.message)
        setLoading(false)
        return
      }

      // Convert Persian date to Gregorian
      const formattedDate = formatPersianDate(formData.date)
      const persianDate = moment(formattedDate, 'jYYYY/jMM/jDD')
      const gregorianDate = persianDate.format('YYYY-MM-DD')
      const reservationData = {
        ...formData,
        time: new Date(`${gregorianDate}T${formData.time}`).toISOString(),
        table: formData.table
      }

      const response = await apiPost<Reservation>('/reservations', reservationData)
      
      if (response.success) {
        setSuccess(true)
        setFormData({
          name: '',
          phone: '',
          guests: 2,
          date: moment().format('jYYYY-jMM-jDD'),
          time: '12:00',
          table: ''
        })
      } else {
        setError(response.error || 'خطا در ایجاد رزرو')
      }
    } catch (err) {
      console.error('Reservation error:', err)
      setError('خطا در ایجاد رزرو')
    } finally {
      setLoading(false)
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.phone.trim() !== '' && validatePhoneNumber(formData.phone)
      case 2:
        if (formData.guests <= 0 || formData.time === '') return false
        if (!formData.date) return false
        
        const dateTimeValidation = validateDateTime(formData.date, formData.time)
        return dateTimeValidation.valid
      case 3:
        return formData.table !== ''
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setError('')
    } else {
      let errorMessage = 'لطفاً تمام فیلدهای اجباری را پر کنید'
      
      if (currentStep === 1) {
        if (!formData.name.trim()) errorMessage = 'لطفاً نام خود را وارد کنید'
        else if (!formData.phone.trim()) errorMessage = 'لطفاً شماره تماس خود را وارد کنید'
        else if (!validatePhoneNumber(formData.phone)) errorMessage = getPhoneValidationError(formData.phone)
      } else if (currentStep === 2) {
        if (!formData.guests || formData.guests <= 0) errorMessage = 'لطفاً تعداد نفرات را انتخاب کنید'
        else if (!formData.date) errorMessage = 'لطفاً تاریخ را وارد کنید'
        else if (!formData.time) errorMessage = 'لطفاً ساعت را انتخاب کنید'
        else {
          const dateTimeValidation = validateDateTime(formData.date, formData.time)
          if (!dateTimeValidation.valid) errorMessage = dateTimeValidation.message
        }
      }
      
      setError(errorMessage)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const filteredTables = tables.filter(table => table.capacity >= formData.guests)

  const steps = [
    { number: 1, title: 'اطلاعات تماس', icon: '👤' },
    { number: 2, title: 'تاریخ و زمان', icon: '📅' },
    { number: 3, title: 'انتخاب میز', icon: '🪑' }
  ]

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="floating-bg"></div>
        
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="glass-card rounded-3xl p-8 animate-scale-in text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">رزرو با موفقیت انجام شد!</h2>
            <p className="text-gray-600 mb-8 text-lg">رزرو شما ثبت شده و به زودی با شما تماس گرفته خواهد شد.</p>
            <button 
              className="glass-button"
              onClick={() => {
                setSuccess(false)
                setCurrentStep(1)
              }}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                رزرو جدید
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      {/* Animated Background */}
      <div className="floating-bg"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-primary-200/30 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-16 h-16 bg-secondary-200/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-32 w-24 h-24 bg-accent-200/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-20 w-12 h-12 bg-primary-300/30 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>

      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="glass-card rounded-3xl p-8 animate-scale-in card-hover">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">رزرو میز</h1>
            <p className="text-gray-600">میز مورد نظر خود را رزرو کنید</p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`step-indicator ${currentStep === step.number ? 'active' : currentStep > step.number ? 'completed' : ''}`}>
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  <div className="mr-3 text-right">
                    <p className="text-sm font-medium text-gray-600">{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-down">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-slide-up">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">اطلاعات تماس</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        نام و نام خانوادگی
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="نام کامل خود را وارد کنید"
                      className="form-input input-focus-ring"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        شماره تماس
                      </div>
                    </label>
                    <input
                      type="tel"
                      placeholder="09123456789"
                      className={`form-input input-focus-ring ${
                        formData.phone && !validatePhoneNumber(formData.phone) 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : ''
                      }`}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    {formData.phone && !validatePhoneNumber(formData.phone) && (
                      <p className="text-red-500 text-xs mt-1">
                        {getPhoneValidationError(formData.phone)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date and Time */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-slide-up">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">تاریخ و زمان</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        تعداد نفرات
                      </div>
                    </label>
                    <select
                      className="form-select input-focus-ring"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} نفر</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        تاریخ (شمسی)
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 1403/01/15"
                      className="form-input input-focus-ring"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز (مثال: 1403/01/15)</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ساعت
                      </div>
                    </label>
                    <select
                      className="form-select input-focus-ring"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = i + 12
                        const timeValue = `${hour.toString().padStart(2, '0')}:00`
                        
                        // Check if this time is in the past (only for today)
                        const formattedDate = formatPersianDate(formData.date)
                        const persianDate = moment(formattedDate, 'jYYYY/jMM/jDD')
                        const today = moment()
                        const isToday = persianDate.isSame(today, 'day')
                        const currentTime = moment().format('HH:mm')
                        const isPastTime = isToday && timeValue <= currentTime
                        
                        return (
                          <option 
                            key={hour} 
                            value={timeValue}
                            disabled={isPastTime}
                          >
                            {hour}:00 {isPastTime ? '(گذشته)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Table Selection */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-slide-up">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">انتخاب میز</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      انتخاب میز
                    </div>
                  </label>
                  
                  {filteredTables.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTables.map(table => (
                        <div
                          key={table._id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            formData.table === table._id
                              ? 'border-primary-500 bg-primary-50 shadow-lg'
                              : 'border-gray-200 bg-white/50 hover:border-primary-300'
                          }`}
                          onClick={() => setFormData({ ...formData, table: table._id })}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{table.name}</h4>
                            {formData.table === table._id && (
                              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {table.capacity} نفر
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {getLocationName(table.location)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-lg">میز مناسب برای {formData.guests} نفر یافت نشد</p>
                      <p className="text-gray-400 text-sm mt-2">لطفاً تعداد نفرات یا تاریخ را تغییر دهید</p>
                      <button
                        type="button"
                        onClick={prevStep}
                        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                      >
                        بازگشت به مرحله قبل
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    مرحله قبل
                  </div>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="glass-button"
                >
                  <div className="flex items-center">
                    مرحله بعد
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ) : (
                <button
                  type="submit"
                  className={`glass-button ${loading ? 'button-loading' : ''} ${loading || filteredTables.length === 0 ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={loading || filteredTables.length === 0}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      در حال ثبت...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      ثبت رزرو
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function getLocationName(location: string): string {
  const locations = {
    'hall': 'سالن اصلی',
    'vip': 'ویژه',
    'outdoor': 'فضای باز'
  }
  return locations[location as keyof typeof locations] || location
}
