import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { OrderProvider } from '../contexts/OrderContext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { ReservationForm } from './ReservationForm'
import { MenuPage } from './MenuPage'
import { ReservationsPage } from './ReservationsPage'
import { OrdersPage } from './OrdersPage'
import { Dashboard } from './Dashboard'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'

function Navigation() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/login'
    }
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin'
  
  const navItems = isAdmin ? [
    // Admin-only navigation - no user operations
    { path: '/', label: 'خانه', icon: '🏠' },
    { path: '/admin', label: 'مدیریت', icon: '⚙️' }
  ] : [
    // Regular user navigation
    { path: '/', label: 'خانه', icon: '🏠' },
    ...(isAuthenticated ? [
      { path: '/reserve', label: 'رزرو میز', icon: '📅' },
      { path: '/menu', label: 'منو', icon: '🍽️' },
      { path: '/reservations', label: 'رزروهای من', icon: '📋' },
      { path: '/orders', label: 'سفارشات من', icon: '🛒' }
    ] : [])
  ]

  return (
    <nav className="glass-card rounded-none border-b border-white/20 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 px-3 md:px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text leading-tight">
                {isAdmin ? 'پنل مدیریت' : 'رستوران طلایی'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {isAdmin ? 'مدیریت سیستم' : 'طعم اصیل ایرانی'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 lg:px-4 rounded-xl font-medium transition-all duration-300 text-sm lg:text-base ${
                  location.pathname === item.path
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/50 hover:text-primary-600'
                }`}
              >
                <span className="ml-1 lg:ml-2">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 space-x-reverse md:space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 space-x-reverse md:space-x-3">
                {/* User Info */}
                <div className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm md:px-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="hidden lg:block font-medium text-gray-700 text-sm md:text-base">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 space-x-reverse md:space-x-2 px-3 py-2 md:px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden md:block">خروج از حساب</span>
                  <span className="md:hidden">خروج</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-1 md:gap-2">
                <Link to="/login" className="px-3 py-2 md:px-4 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 text-sm md:text-base">
                  ورود
                </Link>
                <Link to="/register" className="glass-button text-sm md:text-base px-3 py-2 md:px-4">
                  ثبت‌نام
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-slide-down">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="ml-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Logout Button */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 bg-red-500 hover:bg-red-600 text-white w-full text-right"
                >
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  خروج از حساب
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  
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
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-gentle">
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-4">رستوران طلایی</h1>
          <p className="text-2xl text-gray-600 mb-2 font-medium">طعم اصیل ایرانی</p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            تجربه‌ای بی‌نظیر از طعم‌های اصیل ایرانی در محیطی گرم و دوستانه
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Admin Panel - فقط برای admin */}
          {isAdmin ? (
            <div className="glass-card rounded-3xl p-8 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">پنل مدیریت</h2>
              <p className="text-gray-600 text-center mb-6">مدیریت رزروها، منو و میزها</p>
              <div className="text-center">
                <Link to="/admin" className="glass-button w-full">
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ورود به پنل مدیریت
                </Link>
              </div>
            </div>
          ) : (
            /* رزرو میز - فقط برای کاربران عادی ورود شده */
            isAuthenticated ? (
              <div className="glass-card rounded-3xl p-8 card-hover">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">رزرو میز</h2>
                <p className="text-gray-600 text-center mb-6">زمان، تعداد نفرات و میز مورد نظر خود را انتخاب کنید</p>
                <div className="text-center">
                  <Link to="/reserve" className="glass-button w-full">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    شروع رزرو
                  </Link>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 card-hover opacity-60">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">رزرو میز</h2>
                <p className="text-gray-600 text-center mb-6">برای رزرو میز ابتدا وارد حساب کاربری خود شوید</p>
                <div className="text-center">
                  <Link to="/login" className="glass-button w-full">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    ورود به حساب
                  </Link>
                </div>
              </div>
            )
          )}

          {/* منوی غذا - فقط برای کاربران عادی ورود شده */}
          {!isAdmin && isAuthenticated ? (
            <div className="glass-card rounded-3xl p-8 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">منوی غذا</h2>
              <p className="text-gray-600 text-center mb-6">غذاهای محبوب ایرانی با طعم اصیل و کیفیت بالا</p>
              <div className="text-center">
                <Link to="/menu" className="w-full inline-flex items-center justify-center px-6 py-3 bg-white/50 text-gray-700 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg font-medium">
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  مشاهده منو
                </Link>
              </div>
            </div>
          ) : !isAdmin ? (
            <div className="glass-card rounded-3xl p-8 card-hover opacity-60">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">منوی غذا</h2>
              <p className="text-gray-600 text-center mb-6">برای مشاهده منو ابتدا وارد حساب کاربری خود شوید</p>
              <div className="text-center">
                <Link to="/login" className="w-full inline-flex items-center justify-center px-6 py-3 bg-white/50 text-gray-700 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg font-medium">
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  ورود به حساب
                </Link>
              </div>
            </div>
          ) : null}

          {/* خدمات ویژه - برای کاربران عادی یا کارت مدیریت سیستم برای admin */}
          {!isAdmin ? (
            <div className="glass-card rounded-3xl p-8 card-hover lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">خدمات ویژه</h2>
              <p className="text-gray-600 text-center mb-6">رزرو آسان، منوی متنوع و محیطی آرام</p>
              <div className="text-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm">رزرو آنلاین</span>
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm">منوی متنوع</span>
                  <span className="px-3 py-1 bg-accent-100 text-accent-600 rounded-full text-sm">محیط آرام</span>
                </div>
              </div>
            </div>
          ) : (
            /* کارت مدیریت سیستم برای admin */
            <div className="glass-card rounded-3xl p-8 card-hover lg:col-span-2">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">مدیریت سیستم</h2>
              <p className="text-gray-600 text-center mb-6">کنترل کامل بر رزروها، منو و میزها</p>
              <div className="text-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm">مدیریت رزروها</span>
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm">کنترل منو</span>
                  <span className="px-3 py-1 bg-accent-100 text-accent-600 rounded-full text-sm">مدیریت میزها</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <div data-theme="iran" className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Router>
        <Navigation />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reserve" element={
              <ProtectedRoute requireRegularUser>
                <ReservationForm />
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute requireRegularUser>
                <MenuPage />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute requireRegularUser>
                <ReservationsPage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute requireRegularUser>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </Router>
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </AuthProvider>
  )
}