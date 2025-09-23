import { useState } from 'react'
import { useOrder } from '../contexts/OrderContext'
import { createOrder } from '../lib/api'
import { validatePhoneNumber, getPhoneValidationError } from '../utils/validation'

export function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useOrder()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      setError('سبد خرید شما خالی است')
      return
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('لطفاً نام و شماره تماس خود را وارد کنید')
      return
    }

    if (!validatePhoneNumber(customerPhone)) {
      setError(getPhoneValidationError(customerPhone))
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const orderData = {
        items: cart.map(cartItem => ({
          item: cartItem.item._id,
          qty: cartItem.quantity
        })),
        customerName,
        customerPhone,
        notes: notes || undefined
      }

      const response = await createOrder(orderData)
      
      if (response.success) {
        setSuccess(true)
        clearCart()
        setCustomerName('')
        setCustomerPhone('')
        setNotes('')
        setTimeout(() => {
          setSuccess(false)
          setIsOpen(false)
        }, 3000)
      } else {
        setError(response.error || 'خطا در ثبت سفارش')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      setError('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="glass-card rounded-3xl p-8 max-w-md mx-4 animate-scale-in text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">سفارش با موفقیت ثبت شد!</h2>
          <p className="text-gray-600">سفارش شما ثبت شده و به زودی آماده خواهد شد.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => {
          setIsOpen(true)
          setError('')
        }}
        className="fixed bottom-6 left-6 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 z-40"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-4 0a2 2 0 104 0m-4 0h4" />
          </svg>
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </div>
      </button>

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">سبد خرید</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-4 0a2 2 0 104 0m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600">سبد خرید شما خالی است</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.map((cartItem) => (
                  <div key={cartItem.item._id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{cartItem.item.title}</h3>
                      <p className="text-sm text-gray-600">{cartItem.item.price.toLocaleString()} تومان</p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFromCart(cartItem.item._id)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-800">مجموع:</span>
                    <span className="text-xl font-bold text-primary-600">
                      {getTotalPrice().toLocaleString()} تومان
                    </span>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                      <input
                        type="tel"
                        placeholder="09123456789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          customerPhone && !validatePhoneNumber(customerPhone) 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300'
                        }`}
                        required
                      />
                      {customerPhone && !validatePhoneNumber(customerPhone) && (
                        <p className="text-red-500 text-xs mt-1">
                          {getPhoneValidationError(customerPhone)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت (اختیاری)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        placeholder="درخواست‌های خاص خود را بنویسید..."
                      />
                    </div>
                    <div className="flex space-x-3 space-x-reverse">
                      <button
                        type="button"
                        onClick={clearCart}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                      >
                        پاک کردن سبد
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'در حال ثبت...' : 'ثبت سفارش'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
