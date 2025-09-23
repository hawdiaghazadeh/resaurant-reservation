import { Schema, model, Types } from 'mongoose'

const reservationSchema = new Schema({
  table: { type: Types.ObjectId, ref: 'Table', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  guests: { type: Number, required: true, min: 1 },
  time: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true })

export const ReservationModel = model('Reservation', reservationSchema)


