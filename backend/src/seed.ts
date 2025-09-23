import mongoose from 'mongoose'
import { TableModel } from './models/Table'
import { MenuItemModel } from './models/MenuItem'
import { User } from './models/User'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reservation'

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await TableModel.deleteMany({})
    await MenuItemModel.deleteMany({})
    await User.deleteMany({})

    // Seed tables
    const tables = await TableModel.create([
      { name: 'میز ۱', capacity: 2, location: 'hall' },
      { name: 'میز ۲', capacity: 4, location: 'hall' },
      { name: 'میز ۳', capacity: 6, location: 'hall' },
      { name: 'میز ۴', capacity: 2, location: 'vip' },
      { name: 'میز ۵', capacity: 4, location: 'vip' },
      { name: 'میز ۶', capacity: 8, location: 'outdoor' },
      { name: 'میز ۷', capacity: 4, location: 'outdoor' },
    ])

    // Seed menu items
    const menuItems = await MenuItemModel.create([
      // کباب
      { title: 'کباب کوبیده', price: 45000, category: 'کباب' },
      { title: 'کباب برگ', price: 55000, category: 'کباب' },
      { title: 'جوجه کباب', price: 40000, category: 'کباب' },
      { title: 'کباب چنجه', price: 60000, category: 'کباب' },
      
      // خورش
      { title: 'قرمه سبزی', price: 35000, category: 'خورش' },
      { title: 'قیمه', price: 38000, category: 'خورش' },
      { title: 'فسنجان', price: 42000, category: 'خورش' },
      { title: 'بادمجان', price: 30000, category: 'خورش' },
      
      // پیش غذا
      { title: 'سالاد شیرازی', price: 15000, category: 'پیش‌غذا' },
      { title: 'ماست و خیار', price: 12000, category: 'پیش‌غذا' },
      { title: 'کشک بادمجان', price: 18000, category: 'پیش‌غذا' },
      { title: 'میرزاقاسمی', price: 16000, category: 'پیش‌غذا' },
      
      // نوشیدنی
      { title: 'دوغ', price: 8000, category: 'نوشیدنی' },
      { title: 'شربت آلبالو', price: 10000, category: 'نوشیدنی' },
      { title: 'چای', price: 5000, category: 'نوشیدنی' },
      { title: 'قهوه ترک', price: 15000, category: 'نوشیدنی' },
    ])

    // Seed default admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'مدیر',
      lastName: 'سیستم',
      role: 'admin'
    })

    // Seed default test user
    const testUser = await User.create({
      email: 'user@example.com',
      password: 'user123',
      firstName: 'کاربر',
      lastName: 'تست',
      role: 'user'
    })

    console.log(`Seeded ${tables.length} tables, ${menuItems.length} menu items, and ${2} users`)
    console.log('Default admin user: admin@example.com / admin123')
    console.log('Default test user: user@example.com / user123')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
