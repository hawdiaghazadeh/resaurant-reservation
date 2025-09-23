import { Schema, model } from 'mongoose'

const menuItemSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['کباب', 'خورش', 'پیش‌غذا', 'نوشیدنی'], required: true },
  image: { type: String },
  available: { type: Boolean, default: true },
}, { timestamps: true })

export const MenuItemModel = model('MenuItem', menuItemSchema)


