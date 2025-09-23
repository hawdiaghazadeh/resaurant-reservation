import { useState, useEffect } from 'react'
import { apiGet, MenuItem } from '../lib/api'
import { useOrder } from '../contexts/OrderContext'
import { Cart } from '../components/Cart'

export function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [error, setError] = useState('')
  const { addToCart } = useOrder()

  const categories = [
    { name: 'کباب', icon: '🥩', color: 'from-red-500 to-orange-500' },
    { name: 'خورش', icon: '🍲', color: 'from-green-500 to-emerald-500' },
    { name: 'پیش‌غذا', icon: '🥗', color: 'from-blue-500 to-cyan-500' },
    { name: 'نوشیدنی', icon: '🥤', color: 'from-purple-500 to-pink-500' }
  ]

  useEffect(() => {
    loadMenuItems()
  }, [selectedCategory])

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const params = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''
      const response = await apiGet<MenuItem[]>(`/menu${params}`)
      setMenuItems(response.data || [])
    } catch (err) {
      setError('خطا در بارگذاری منو')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

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
          <p className="text-gray-600 text-lg">در حال بارگذاری منو...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">منوی غذا</h1>
          <p className="text-gray-600 text-lg">غذاهای محبوب ایرانی با طعم اصیل</p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8 animate-slide-up">
          <div className="glass-card rounded-2xl p-2">
            <div className="flex flex-wrap gap-2 justify-center max-w-4xl">
              <button
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
                  selectedCategory === '' 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50 hover:text-primary-600'
                }`}
                onClick={() => setSelectedCategory('')}
              >
                <span className="ml-1 sm:ml-2">🍽️</span>
                همه
              </button>
              {categories.map(category => (
                <button
                  key={category.name}
                  className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
                    selectedCategory === category.name 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/50 hover:text-primary-600'
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="ml-1 sm:ml-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-12 animate-fade-in">
          {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
            <div key={category} className="animate-slide-up" style={{animationDelay: `${categoryIndex * 0.1}s`}}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-lg mb-4">
                  <span className="text-2xl">
                    {categories.find(c => c.name === category)?.icon || '🍽️'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold gradient-text">{category}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <div 
                    key={item._id} 
                    className="glass-card rounded-2xl overflow-hidden card-hover animate-scale-in shadow-lg"
                    style={{animationDelay: `${(categoryIndex * 0.1) + (index * 0.05)}s`}}
                  >
                    {/* Image Display */}
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={item.image || '/images/default-food.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">{item.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.available ? 'موجود' : 'ناموجود'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {item.price.toLocaleString()} تومان
                        </span>
                        <button 
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            item.available 
                              ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg transform hover:-translate-y-1' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!item.available}
                          onClick={() => item.available && addToCart(item)}
                        >
                          {item.available ? 'افزودن به سبد' : 'ناموجود'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">آیتمی یافت نشد</h3>
            <p className="text-gray-600">در این دسته‌بندی غذایی موجود نیست</p>
          </div>
        )}
      </div>
      
      {/* Cart Component */}
      <Cart />
    </div>
  )
}
