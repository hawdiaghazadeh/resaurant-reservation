import { Schema, model } from 'mongoose'

const tableSchema = new Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 },
  location: { type: String, enum: ['hall', 'vip', 'outdoor'], default: 'hall' },
}, { timestamps: true })

export const TableModel = model('Table', tableSchema)


