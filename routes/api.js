import { Router } from 'express'
import dotenv from 'dotenv'
dotenv.config()

import UserController from '#controllers/user.controller.js'
import UploadController from '#controllers/upload.controller.js'

const router = Router()
  .use(UserController)
  .use(UploadController)

router.get('/', (req, res) => {
  res.json({ status: 200, message: 'Amjilttai backend server aslaa!' })
})

export default router