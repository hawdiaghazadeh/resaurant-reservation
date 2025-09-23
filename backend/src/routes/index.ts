import { Router, Request, Response } from 'express'
import { TableModel } from '../models/Table'
import { MenuItemModel } from '../models/MenuItem'
import { ReservationModel } from '../models/Reservation'
import { OrderModel } from '../models/Order'
import { User } from '../models/User'
import authRoutes from './auth'

export const router = Router()

// Auth routes
router.use('/auth', authRoutes)

// Helper function for error handling
const handleError = (res: Response, error: any, message: string = 'خطا در سرور') => {
  console.error(error)
  res.status(500).json({ error: message, details: error.message })
}

/**
 * @openapi
 * tags:
 *   - name: Tables
 *     description: مدیریت میزها
 *   - name: Menu
 *     description: مدیریت منو
 *   - name: Reservations
 *     description: مدیریت رزروها
 *   - name: Orders
 *     description: مدیریت سفارش‌ها
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         capacity:
 *           type: integer
 *         location:
 *           type: string
 *     MenuItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         image:
 *           type: string
 *     Reservation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         table:
 *           $ref: '#/components/schemas/Table'
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         guests:
 *           type: integer
 *         time:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *     OrderItem:
 *       type: object
 *       properties:
 *         item:
 *           $ref: '#/components/schemas/MenuItem'
 *         qty:
 *           type: integer
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         reservation:
 *           $ref: '#/components/schemas/Reservation'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 */

// Tables
/**
 * @openapi
 * /api/tables:
 *   get:
 *     tags: [Tables]
 *     summary: دریافت لیست میزها
 *     responses:
 *       200:
 *         description: لیست میزها
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Table'
 *   post:
 *     tags: [Tables]
 *     summary: ایجاد میز جدید
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, capacity]
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: میز ایجاد شد
 */
router.get('/tables', async (req: Request, res: Response) => {
  try {
    const tables = await TableModel.find().lean()
    res.json({ success: true, data: tables })
  } catch (error) {
    handleError(res, error, 'خطا در دریافت لیست میزها')
  }
})

router.post('/tables', async (req: Request, res: Response) => {
  try {
    const { name, capacity, location } = req.body
    if (!name || !capacity) {
      return res.status(400).json({ error: 'نام و ظرفیت میز الزامی است' })
    }
    const created = await TableModel.create({ name, capacity, location })
    res.status(201).json({ success: true, data: created })
  } catch (error) {
    handleError(res, error, 'خطا در ایجاد میز')
  }
})

router.put('/tables/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updated = await TableModel.findByIdAndUpdate(id, req.body, { new: true })
    if (!updated) {
      return res.status(404).json({ error: 'میز یافت نشد' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    handleError(res, error, 'خطا در بروزرسانی میز')
  }
})

router.delete('/tables/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await TableModel.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'میز یافت نشد' })
    }
    res.json({ success: true, message: 'میز حذف شد' })
  } catch (error) {
    handleError(res, error, 'خطا در حذف میز')
  }
})

// Menu
/**
 * @openapi
 * /api/menu:
 *   get:
 *     tags: [Menu]
 *     summary: دریافت منو
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لیست آیتم‌های منو
 *   post:
 *     tags: [Menu]
 *     summary: ایجاد آیتم منو
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price, category]
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: آیتم ایجاد شد
 */
router.get('/menu', async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const items = await MenuItemModel.find(filter).lean()
    res.json({ success: true, data: items })
  } catch (error) {
    handleError(res, error, 'خطا در دریافت منو')
  }
})

router.post('/menu', async (req: Request, res: Response) => {
  try {
    const { title, price, category, image } = req.body
    if (!title || !price || !category) {
      return res.status(400).json({ error: 'عنوان، قیمت و دسته‌بندی الزامی است' })
    }
    const created = await MenuItemModel.create({ title, price, category, image })
    res.status(201).json({ success: true, data: created })
  } catch (error) {
    handleError(res, error, 'خطا در اضافه کردن آیتم منو')
  }
})

router.put('/menu/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updated = await MenuItemModel.findByIdAndUpdate(id, req.body, { new: true })
    if (!updated) {
      return res.status(404).json({ error: 'آیتم منو یافت نشد' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    handleError(res, error, 'خطا در بروزرسانی آیتم منو')
  }
})

router.delete('/menu/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await MenuItemModel.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'آیتم منو یافت نشد' })
    }
    res.json({ success: true, message: 'آیتم منو حذف شد' })
  } catch (error) {
    handleError(res, error, 'خطا در حذف آیتم منو')
  }
})

// Reservations
/**
 * @openapi
 * /api/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: دریافت رزروها
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لیست رزروها
 *   post:
 *     tags: [Reservations]
 *     summary: ایجاد رزرو
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [table, name, phone, guests, time]
 *             properties:
 *               table:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               guests:
 *                 type: integer
 *               time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: رزرو ایجاد شد
 */
router.get('/reservations', async (req: Request, res: Response) => {
  try {
    const { date, status, phone, name } = req.query
    const filter: any = {}
    if (date) {
      const startOfDay = new Date(date as string)
      const endOfDay = new Date(startOfDay)
      endOfDay.setDate(endOfDay.getDate() + 1)
      filter.time = { $gte: startOfDay, $lt: endOfDay }
    }
    if (status) {
      filter.status = status
    }
    if (phone) {
      filter.phone = { $regex: phone, $options: 'i' }
    }
    if (name) {
      filter.name = { $regex: name, $options: 'i' }
    }
    const reservations = await ReservationModel.find(filter).populate('table').lean()
    res.json({ success: true, data: reservations })
  } catch (error) {
    handleError(res, error, 'خطا در دریافت رزروها')
  }
})

router.post('/reservations', async (req: Request, res: Response) => {
  try {
    const { table, name, phone, guests, time } = req.body
    if (!table || !name || !phone || !guests || !time) {
      return res.status(400).json({ error: 'تمام فیلدها الزامی است' })
    }
    
    // Check if table is available at the requested time
    const existingReservation = await ReservationModel.findOne({
      table,
      time: new Date(time),
      status: { $in: ['pending', 'confirmed'] }
    })
    
    if (existingReservation) {
      return res.status(400).json({ error: 'میز در این زمان رزرو شده است' })
    }
    
    const created = await ReservationModel.create(req.body)
    const populated = await ReservationModel.findById(created._id).populate('table')
    res.status(201).json({ success: true, data: populated })
  } catch (error) {
    handleError(res, error, 'خطا در ایجاد رزرو')
  }
})

router.put('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const updated = await ReservationModel.findByIdAndUpdate(id, { status }, { new: true }).populate('table')
    if (!updated) {
      return res.status(404).json({ error: 'رزرو یافت نشد' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    handleError(res, error, 'خطا در بروزرسانی رزرو')
  }
})

// Cancel reservation endpoint
router.put('/reservations/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const reservation = await ReservationModel.findByIdAndUpdate(
      id, 
      { status: 'cancelled' }, 
      { new: true }
    ).populate('table')
    
    if (!reservation) {
      return res.status(404).json({ error: 'رزرو یافت نشد' })
    }
    
    res.json({ success: true, data: reservation })
  } catch (error) {
    handleError(res, error, 'خطا در لغو رزرو')
  }
})

router.delete('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await ReservationModel.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'رزرو یافت نشد' })
    }
    res.json({ success: true, message: 'رزرو حذف شد' })
  } catch (error) {
    handleError(res, error, 'خطا در حذف رزرو')
  }
})

// Orders
/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: دریافت سفارش‌ها
 *     parameters:
 *       - in: query
 *         name: reservation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لیست سفارش‌ها
 *   post:
 *     tags: [Orders]
 *     summary: ایجاد سفارش
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               reservation:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [item, qty]
 *                   properties:
 *                     item:
 *                       type: string
 *                     qty:
 *                       type: integer
 *     responses:
 *       201:
 *         description: سفارش ایجاد شد
 */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { reservation, phone } = req.query
    const filter: any = {}
    
    if (reservation) {
      filter.reservation = reservation
    }
    
    if (phone) {
      filter.customerPhone = phone
    }
    
    const orders = await OrderModel.find(filter).populate('items.item').populate('reservation').lean()
    res.json({ success: true, data: orders })
  } catch (error) {
    handleError(res, error, 'خطا در دریافت سفارشات')
  }
})

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const { reservation, items, customerName, customerPhone, notes } = req.body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'لیست آیتم‌ها الزامی است' })
    }
    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'نام و شماره تماس مشتری الزامی است' })
    }
    
    // Calculate total
    let total = 0
    for (const item of items) {
      const menuItem = await MenuItemModel.findById(item.item)
      if (!menuItem) {
        return res.status(400).json({ error: `آیتم منو با شناسه ${item.item} یافت نشد` })
      }
      total += menuItem.price * item.qty
    }
    
    const created = await OrderModel.create({ 
      reservation, 
      items, 
      total, 
      customerName, 
      customerPhone, 
      notes,
      status: 'placed'
    })
    const populated = await OrderModel.findById(created._id).populate('items.item').populate('reservation')
    res.status(201).json({ success: true, data: populated })
  } catch (error) {
    handleError(res, error, 'خطا در ایجاد سفارش')
  }
})

router.put('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updated = await OrderModel.findByIdAndUpdate(id, req.body, { new: true }).populate('items.item').populate('reservation')
    if (!updated) {
      return res.status(404).json({ error: 'سفارش یافت نشد' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    handleError(res, error, 'خطا در بروزرسانی سفارش')
  }
})

router.delete('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await OrderModel.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'سفارش یافت نشد' })
    }
    res.json({ success: true, message: 'سفارش حذف شد' })
  } catch (error) {
    handleError(res, error, 'خطا در حذف سفارش')
  }
})

// Users
/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: دریافت لیست کاربران
 *     responses:
 *       200:
 *         description: لیست کاربران
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.query
    const filter: any = {}
    
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ]
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' }
    }
    if (phone) {
      filter.phone = { $regex: phone, $options: 'i' }
    }
    
    const users = await User.find(filter, { password: 0 }).lean()
    res.json({ success: true, data: users })
  } catch (error) {
    handleError(res, error, 'خطا در دریافت لیست کاربران')
  }
})

router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
    if (!updated) {
      return res.status(404).json({ error: 'کاربر یافت نشد' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    handleError(res, error, 'خطا در بروزرسانی کاربر')
  }
})

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'کاربر یافت نشد' })
    }
    res.json({ success: true, message: 'کاربر حذف شد' })
  } catch (error) {
    handleError(res, error, 'خطا در حذف کاربر')
  }
})


