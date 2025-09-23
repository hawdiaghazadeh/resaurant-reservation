import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, Table, MenuItem, Reservation, Order, User } from '../lib/api'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'menu' | 'tables' | 'orders' | 'users'>('reservations')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search states
  const [userSearchName, setUserSearchName] = useState('')
  const [userSearchEmail, setUserSearchEmail] = useState('')
  const [userSearchPhone, setUserSearchPhone] = useState('')
  
  // Menu form state
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [menuForm, setMenuForm] = useState({
    title: '',
    price: '',
    category: 'کباب',
    image: '',
    available: true
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Table form state
  const [showTableForm, setShowTableForm] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: '',
    location: 'hall'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reservationsRes, menuRes, tablesRes, ordersRes, usersRes] = await Promise.all([
        apiGet<Reservation[]>('/reservations'),
        apiGet<MenuItem[]>('/menu'),
        apiGet<Table[]>('/tables'),
        apiGet<Order[]>('/orders'),
        apiGet<User[]>('/users')
      ])
      
      setReservations((reservationsRes.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setMenuItems((menuRes.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setTables((tablesRes.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setOrders((ordersRes.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setUsers((usersRes.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await apiPut(`/reservations/${id}`, { status })
      await loadData()
    } catch (err) {
      console.error('Error updating reservation:', err)
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await apiPut(`/orders/${id}`, { status })
      await loadData()
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const updateUserRole = async (id: string, role: string) => {
    try {
      await apiPut(`/users/${id}`, { role })
      await loadData()
    } catch (err) {
      console.error('Error updating user role:', err)
    }
  }

  const deleteUser = async (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
      try {
        await apiDelete(`/users/${id}`)
        await loadData()
      } catch (err) {
        console.error('Error deleting user:', err)
      }
    }
  }

  const searchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userSearchName) params.append('name', userSearchName)
      if (userSearchEmail) params.append('email', userSearchEmail)
      if (userSearchPhone) params.append('phone', userSearchPhone)
      
      const queryString = params.toString()
      const response = await apiGet<User[]>(`/users${queryString ? `?${queryString}` : ''}`)
      setUsers((response.data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      console.error('Error searching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearUserSearch = () => {
    setUserSearchName('')
    setUserSearchEmail('')
    setUserSearchPhone('')
    loadData()
  }

  // Image handling functions
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        setMenuForm({ ...menuForm, image: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setMenuForm({ ...menuForm, image: '' })
  }

  // Menu CRUD functions
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const menuData = {
        title: menuForm.title,
        price: parseFloat(menuForm.price),
        category: menuForm.category,
        image: menuForm.image,
        available: menuForm.available
      }

      if (editingMenuItem) {
        await apiPut(`/menu/${editingMenuItem._id}`, menuData)
      } else {
        await apiPost('/menu', menuData)
      }

      setShowMenuForm(false)
      setEditingMenuItem(null)
      setMenuForm({ title: '', price: '', category: 'کباب', image: '', available: true })
      setImagePreview('')
      setImageFile(null)
      await loadData()
    } catch (err) {
      console.error('Error saving menu item:', err)
    }
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item)
    setMenuForm({
      title: item.title,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      available: item.available
    })
    setImagePreview(item.image || '')
    setImageFile(null)
    setShowMenuForm(true)
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این آیتم منو را حذف کنید؟')) {
      try {
        await apiDelete(`/menu/${id}`)
        await loadData()
      } catch (err) {
        console.error('Error deleting menu item:', err)
      }
    }
  }

  // Table CRUD functions
  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tableData = {
        name: tableForm.name,
        capacity: parseInt(tableForm.capacity),
        location: tableForm.location
      }

      if (editingTable) {
        await apiPut(`/tables/${editingTable._id}`, tableData)
      } else {
        await apiPost('/tables', tableData)
      }

      setShowTableForm(false)
      setEditingTable(null)
      setTableForm({ name: '', capacity: '', location: 'hall' })
      await loadData()
    } catch (err) {
      console.error('Error saving table:', err)
    }
  }

  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setTableForm({
      name: table.name,
      capacity: table.capacity.toString(),
      location: table.location
    })
    setShowTableForm(true)
  }

  const handleDeleteTable = async (id: string) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این میز را حذف کنید؟')) {
      try {
        await apiDelete(`/tables/${id}`)
        await loadData()
      } catch (err) {
        console.error('Error deleting table:', err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-gray-600 text-lg">در حال بارگذاری...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">پنل مدیریت</h1>
          <p className="text-gray-600 text-lg">مدیریت رزروها، منو، میزها، سفارشات و کاربران</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 animate-slide-up">
          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">کل رزروها</p>
                <p className="text-3xl font-bold text-primary">{reservations.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">در انتظار</p>
                <p className="text-3xl font-bold text-warning-600">
                  {reservations.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">آیتم‌های منو</p>
                <p className="text-3xl font-bold text-info-600">{menuItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">تعداد میزها</p>
                <p className="text-3xl font-bold text-success-600">{tables.length}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">کل سفارشات</p>
                <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">کل کاربران</p>
                <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card rounded-2xl p-2">
            <div className="flex space-x-2 space-x-reverse">
              {[
                { key: 'reservations', label: 'رزروها', icon: '📅' },
                { key: 'menu', label: 'منو', icon: '🍽️' },
                { key: 'tables', label: 'میزها', icon: '🪑' },
                { key: 'orders', label: 'سفارشات', icon: '📋' },
                { key: 'users', label: 'کاربران', icon: '👥' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/50 hover:text-primary-600'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  <span className="ml-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">مدیریت رزروها</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">نام</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">تلفن</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">میز</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">نفرات</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">زمان</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">وضعیت</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation, index) => (
                      <tr key={reservation._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}`}>
                        <td className="py-4 px-4 font-medium">{reservation.name}</td>
                        <td className="py-4 px-4 text-gray-600">{reservation.phone}</td>
                        <td className="py-4 px-4">{reservation.table.name}</td>
                        <td className="py-4 px-4 text-center">{reservation.guests}</td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(reservation.time)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status === 'confirmed' ? 'تأیید شده' :
                             reservation.status === 'pending' ? 'در انتظار' :
                             'لغو شده'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {reservation.status === 'pending' && (
                              <>
                                <button
                                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors duration-200"
                                  onClick={() => updateReservationStatus(reservation._id, 'confirmed')}
                                >
                                  تأیید
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                                  onClick={() => updateReservationStatus(reservation._id, 'cancelled')}
                                >
                                  لغو
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">مدیریت منو</h2>
                <button
                  onClick={() => {
                    setEditingMenuItem(null)
                    setMenuForm({ title: '', price: '', category: 'کباب', image: '', available: true })
                    setImagePreview('')
                    setImageFile(null)
                    setShowMenuForm(true)
                  }}
                  className="glass-button"
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  افزودن آیتم جدید
                </button>
              </div>

              {/* Menu Form Modal */}
              {showMenuForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="glass-card rounded-3xl p-0 max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {editingMenuItem ? 'ویرایش آیتم منو' : 'افزودن آیتم جدید'}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {editingMenuItem ? 'اطلاعات آیتم منو را ویرایش کنید' : 'آیتم جدیدی به منو اضافه کنید'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowMenuForm(false)}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
                      <form onSubmit={handleMenuSubmit} className="space-y-6">
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                          <label className="block text-sm font-semibold text-gray-700">تصویر آیتم</label>
                          <div className="flex flex-col items-center space-y-4">
                            {imagePreview ? (
                              <div className="relative group">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-48 h-48 object-cover rounded-2xl shadow-lg border-4 border-white"
                                />
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500 text-sm text-center">تصویر را اینجا بکشید یا کلیک کنید</p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 cursor-pointer font-medium"
                            >
                              {imagePreview ? 'تغییر تصویر' : 'انتخاب تصویر'}
                            </label>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان آیتم</label>
                            <input
                              type="text"
                              value={menuForm.title}
                              onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              placeholder="نام آیتم منو"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">قیمت (تومان)</label>
                            <input
                              type="number"
                              value={menuForm.price}
                              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              placeholder="قیمت به تومان"
                              required
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">دسته‌بندی</label>
                          <select
                            value={menuForm.category}
                            onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="کباب">🍖 کباب</option>
                            <option value="خورش">🍲 خورش</option>
                            <option value="پیش‌غذا">🥗 پیش‌غذا</option>
                            <option value="نوشیدنی">🥤 نوشیدنی</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="available"
                              checked={menuForm.available}
                              onChange={(e) => setMenuForm({ ...menuForm, available: e.target.checked })}
                              className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="available" className="mr-3 text-sm font-medium text-gray-700">
                              این آیتم در منو موجود است
                            </label>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            menuForm.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {menuForm.available ? 'موجود' : 'ناموجود'}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            className="flex-1 glass-button text-lg py-4 font-semibold"
                          >
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {editingMenuItem ? 'بروزرسانی آیتم' : 'افزودن آیتم'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowMenuForm(false)}
                            className="flex-1 px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-semibold flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            انصراف
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-white/50 rounded-2xl overflow-hidden card-hover shadow-lg">
                    {/* Image Section */}
                    {item.image ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={'/images/default-food.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                      
                      <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        {item.price.toLocaleString()} تومان
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'موجود' : 'ناموجود'}
                      </span>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center group"
                          title="ویرایش آیتم"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center group"
                          title="حذف آیتم"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">مدیریت میزها</h2>
                <button
                  onClick={() => {
                    setEditingTable(null)
                    setTableForm({ name: '', capacity: '', location: 'hall' })
                    setShowTableForm(true)
                  }}
                  className="glass-button"
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  افزودن میز جدید
                </button>
              </div>

              {/* Table Form Modal */}
              {showTableForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="glass-card rounded-3xl p-0 max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-secondary-500 to-accent-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {editingTable ? 'ویرایش میز' : 'افزودن میز جدید'}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {editingTable ? 'اطلاعات میز را ویرایش کنید' : 'میز جدیدی اضافه کنید'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowTableForm(false)}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                      <form onSubmit={handleTableSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">نام میز</label>
                          <input
                            type="text"
                            value={tableForm.name}
                            onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200"
                            placeholder="نام میز (مثل: میز 1، میز VIP)"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">ظرفیت (تعداد نفرات)</label>
                          <input
                            type="number"
                            value={tableForm.capacity}
                            onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200"
                            placeholder="تعداد نفرات"
                            required
                            min="1"
                            max="20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">مکان میز</label>
                          <select
                            value={tableForm.location}
                            onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="hall">🏢 سالن اصلی</option>
                            <option value="vip">👑 ویژه</option>
                            <option value="outdoor">🌳 فضای باز</option>
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            className="flex-1 glass-button text-lg py-4 font-semibold"
                          >
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {editingTable ? 'بروزرسانی میز' : 'افزودن میز'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowTableForm(false)}
                            className="flex-1 px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-semibold flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            انصراف
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => (
                  <div key={table._id} className="bg-white/50 rounded-2xl p-6 card-hover shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{table.name}</h3>
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-gray-600 font-medium">ظرفیت</span>
                        </div>
                        <span className="font-bold text-gray-800">{table.capacity} نفر</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600 font-medium">مکان</span>
                        </div>
                        <span className="font-bold text-gray-800">{getLocationName(table.location)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditTable(table)}
                        className="w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center group"
                        title="ویرایش میز"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table._id)}
                        className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center group"
                        title="حذف میز"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">مدیریت سفارشات</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">شماره سفارش</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">نام مشتری</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">تلفن</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">آیتم‌ها</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">مبلغ کل</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">وضعیت</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">تاریخ</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}`}>
                        <td className="py-4 px-4 font-medium">#{order._id.slice(-8)}</td>
                        <td className="py-4 px-4">{order.customerName}</td>
                        <td className="py-4 px-4 text-gray-600">{order.customerPhone}</td>
                        <td className="py-4 px-4">
                          <div className="max-w-xs space-y-2">
                            {order.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center space-x-2 space-x-reverse bg-gray-50 rounded-lg p-2">
                                {/* Food Image */}
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.item.image || '/images/default-food.jpg'}
                                    alt={item.item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {/* Food Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-800 truncate">
                                    {item.item.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    × {item.qty} | {item.item.price.toLocaleString()} تومان
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-primary-600">
                          {order.total.toLocaleString()} تومان
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'placed' ? 'ثبت شده' :
                             order.status === 'paid' ? 'پرداخت شده' :
                             order.status === 'cancelled' ? 'لغو شده' :
                             'پیش‌نویس'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {order.status === 'placed' && (
                              <>
                                <button
                                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors duration-200"
                                  onClick={() => updateOrderStatus(order._id, 'paid')}
                                >
                                  پرداخت
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                                  onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                >
                                  لغو
                                </button>
                              </>
                            )}
                            {order.status === 'paid' && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                                تکمیل شده
                              </span>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm">
                                لغو شده
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">سفارشی یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ سفارشی ثبت نشده است</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">مدیریت کاربران</h2>
              
              {/* Search Section */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">جستجو در کاربران</h3>
                  <p className="text-gray-600 text-sm">بر اساس نام، ایمیل یا شماره تماس جستجو کنید</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={userSearchName}
                      onChange={(e) => setUserSearchName(e.target.value)}
                      placeholder="نام یا نام خانوادگی"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={userSearchEmail}
                      onChange={(e) => setUserSearchEmail(e.target.value)}
                      placeholder="آدرس ایمیل"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تلفن</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={userSearchPhone}
                      onChange={(e) => setUserSearchPhone(e.target.value)}
                      placeholder="شماره تماس"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={searchUsers}
                    className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    جستجو
                  </button>
                  <button
                    onClick={clearUserSearch}
                    className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    پاک کردن
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">نام و نام خانوادگی</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">ایمیل</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">تلفن</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">نقش</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">تاریخ عضویت</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}`}>
                        <td className="py-4 px-4 font-medium">{user.firstName} {user.lastName}</td>
                        <td className="py-4 px-4 text-gray-600">{user.email}</td>
                        <td className="py-4 px-4 text-gray-600">{user.phone || 'ثبت نشده'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(user.createdAt)}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="user">کاربر</option>
                              <option value="admin">مدیر</option>
                            </select>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                              onClick={() => deleteUser(user._id)}
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">کاربری یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ کاربری ثبت‌نام نکرده است</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
