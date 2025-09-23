import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { router } from './routes/index'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

const app = express()

app.use(helmet())
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use('/api', router)

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Reservation API',
      version: '1.0.0',
      description: 'API documentation for Reservation system',
    },
    servers: [
      { url: 'http://localhost:' + (process.env.PORT || 4000) }
    ],
  },
  apis: ['src/routes/**/*.ts'],
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reservation'
const PORT = Number(process.env.PORT || 4000)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()


