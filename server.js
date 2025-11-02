/* eslint-disable no-undef */
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import chalk from 'chalk'
import dotenv from 'dotenv'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()
const app = express()

const TITLE = 'Express Backend'

const corsOptions = {
  origin: function (origin, callback) {
    const allowedDomains = [ 'https://sanchir.dev' ]
    const allowedDevDomains = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

    if (allowedDomains.includes(origin) || allowedDevDomains.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS алдаа гарлаа'));
    }
  },
  credentials: true
}

import api from './routes/api.js'
import auth from './routes/auth.js'

const server = http.createServer(app)
const sessionOptions = session({ secret: process.env.SECRET, resave: true, saveUninitialized: true, cookie: { maxAge: 24 * 60 * 60 * 1000, domain: '.sanchir.dev' } })

app.use(sessionOptions)
app.use(cors(corsOptions))
app.use(cookieParser())
console.info(`===================================================\n\n${chalk.yellowBright.bold.underline(`${TITLE} API Service`)}\n`)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', api)
app.use('/auth', auth)

server.listen(process.env.PORT, () => console.info(`${chalk.green.bold('READY:')} ${TITLE} API running on port: ${chalk.yellowBright.bold(process.env.PORT)}`))