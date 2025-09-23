import { useState, useEffect } from 'react'
import { apiGet, Reservation, cancelReservation } from '../lib/api'

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [searchName, setSearchName] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const loadReservations = async (searchParams?: { phone?: string; name?: string }) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchParams?.phone) params.append('phone', searchParams.phone)
      if (searchParams?.name) params.append('name', searchParams.name)
      
      const queryString = params.toString()
      const response = await apiGet<Reservation[]>(`/reservations${queryString ? `?${queryString}` : ''}`)
      setReservations((response.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      setError('خطا در بارگذاری رزروها')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadReservations({ phone: searchPhone, name: searchName })
  }

  const handleClearSearch = () => {
    setSearchPhone('')
    setSearchName('')
    loadReservations()
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('آیا از لغو این رزرو اطمینان دارید؟')) {
      return
    }

    try {
      setCancellingId(reservationId)
      await cancelReservation(reservationId)
      // Refresh reservations after successful cancellation
      await loadReservations()
    } catch (err) {
      setError('خطا در لغو رزرو')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'در انتظار',
        icon: '⏳'
      },
      'confirmed': { 
        class: 'bg-green-100 text-green-800 border-green-200', 
        text: 'تأیید شده',
        icon: '✅'
      },
      'cancelled': { 
        class: 'bg-red-100 text-red-800 border-red-200', 
        text: 'لغو شده',
        icon: '❌'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        <span className="ml-1">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="floating-bg"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">در حال بارگذاری رزروها...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      {/* Animated Background */}
      <div className="floating-bg"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-primary-200/30 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-16 h-16 bg-secondary-200/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-32 w-24 h-24 bg-accent-200/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-20 w-12 h-12 bg-primary-300/30 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>

      <div className="relative z-10 container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">رزروهای من</h1>
          <p className="text-gray-600 text-lg">مشاهده و مدیریت رزروهای شما</p>
        </div>

        {/* Search Filter */}
        <div className="glass-card rounded-3xl p-6 mb-8 animate-slide-up">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">جستجو در رزروها</h3>
            <p className="text-gray-600">بر اساس نام یا شماره تماس جستجو کنید</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    نام
                  </div>
                </label>
                <input
                  type="text"
                  className="form-input input-focus-ring"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="نام کامل"
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
                  className="form-input input-focus-ring"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="09123456789"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button 
                className="glass-button"
                onClick={handleSearch}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  جستجو
                </div>
              </button>
              <button 
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
                onClick={handleClearSearch}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  پاک کردن
                </div>
              </button>
            </div>
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

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">رزروی یافت نشد</h3>
            <p className="text-gray-600">
              {phone ? 'رزروی با این شماره تماس یافت نشد' : 'هنوز رزروی ثبت نکرده‌اید'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {reservations.map((reservation, index) => (
              <div 
                key={reservation._id} 
                className="glass-card rounded-2xl p-6 card-hover animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{reservation.name}</h3>
                  {getStatusBadge(reservation.status)}
                </div>
                
                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      شماره تماس
                    </span>
                    <span className="font-semibold">{reservation.phone}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      تعداد نفرات
                    </span>
                    <span className="font-semibold">{reservation.guests} نفر</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      میز
                    </span>
                    <span className="font-semibold">{reservation.table.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      مکان
                    </span>
                    <span className="font-semibold">{getLocationName(reservation.table.location)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      زمان رزرو
                    </span>
                    <span className="font-semibold text-sm">{formatDate(reservation.time)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      تاریخ ثبت
                    </span>
                    <span className="font-semibold text-sm">{formatDate(reservation.createdAt)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                {reservation.status === 'pending' && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button 
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      onClick={() => handleCancelReservation(reservation._id)}
                      disabled={cancellingId === reservation._id}
                    >
                      {cancellingId === reservation._id ? (
                        <>
                          <svg className="w-4 h-4 ml-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          در حال لغو...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          لغو رزرو
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
