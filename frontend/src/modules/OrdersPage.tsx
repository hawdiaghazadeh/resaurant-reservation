import { useState, useEffect } from 'react'
import { apiGet, Order } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = user?.phone ? `?phone=${encodeURIComponent(user.phone)}` : ''
      const response = await apiGet<Order[]>(`/orders${params}`)
      setOrders((response.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      setError('خطا در بارگذاری سفارشات')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { text: 'پیش‌نویس', color: 'bg-gray-100 text-gray-800' },
      'placed': { text: 'ثبت شده', color: 'bg-blue-100 text-blue-800' },
      'paid': { text: 'پرداخت شده', color: 'bg-green-100 text-green-800' },
      'cancelled': { text: 'لغو شده', color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
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
          <p className="text-gray-600 text-lg">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="floating-bg"></div>
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="glass-card rounded-3xl p-8 text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">خطا در بارگذاری</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200"
            >
              تلاش مجدد
            </button>
          </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">سفارشات من</h1>
          <p className="text-gray-600 text-lg">پیگیری و مدیریت سفارشات شما</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">سفارشی یافت نشد</h3>
            <p className="text-gray-600 mb-4">
              {!user?.phone 
                ? 'برای مشاهده سفارشات، لطفاً شماره تلفن خود را در پروفایل تکمیل کنید'
                : 'هنوز هیچ سفارشی ثبت نکرده‌اید'
              }
            </p>
            {!user?.phone && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">
                  برای پیگیری سفارشات، شماره تلفن شما باید در سیستم ثبت شده باشد
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {orders.map((order, index) => (
              <div 
                key={order._id} 
                className="glass-card rounded-3xl p-6 card-hover animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">سفارش #{order._id.slice(-8)}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 sm:space-x-reverse text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {order.customerName}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {order.customerPhone}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:mr-6">
                    <div className="text-2xl font-bold text-primary-600">
                      {order.total.toLocaleString()} تومان
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 mb-3">آیتم‌های سفارش:</h4>
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors duration-200">
                      {/* Food Image */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md">
                          <img
                            src={item.item.image || '/images/default-food.jpg'}
                            alt={item.item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Food Details */}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 text-lg">{item.item.title}</h5>
                        <p className="text-sm text-gray-600 mb-1">{item.item.price.toLocaleString()} تومان</p>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm">
                          <span className="text-gray-600">دسته‌بندی:</span>
                          <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                            {item.item.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-600">تعداد:</span>
                          <span className="font-bold text-gray-800 text-lg">{item.qty}</span>
                        </div>
                        <div className="text-right mt-2">
                          <span className="text-sm text-gray-500">مجموع:</span>
                          <div className="font-bold text-primary-600">
                            {(item.item.price * item.qty).toLocaleString()} تومان
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                    <h5 className="font-medium text-blue-800 mb-1">یادداشت:</h5>
                    <p className="text-blue-700 text-sm">{order.notes}</p>
                  </div>
                )}

                {/* Reservation Info */}
                {order.reservation && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl">
                    <h5 className="font-medium text-green-800 mb-1">اطلاعات رزرو:</h5>
                    <p className="text-green-700 text-sm">
                      میز: {order.reservation.table?.name} - 
                      تاریخ: {formatDate(order.reservation.time)}
                    </p>
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
