import { Schema, model, Types } from 'mongoose'

const orderSchema = new Schema({
  reservation: { type: Types.ObjectId, ref: 'Reservation' },
  items: [{
    item: { type: Types.ObjectId, ref: 'MenuItem', required: true },
    qty: { type: Number, required: true, min: 1 },
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['draft', 'placed', 'paid', 'cancelled'], default: 'draft' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true })

export const OrderModel = model('Order', orderSchema)


