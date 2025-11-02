import { Router } from 'express'
const router = Router()

import { authUser } from '#middlewares/auth.middleware.js'
import { uploadFiles } from '#middlewares/upload.middleware.js'
import { sendFiles } from '#services/upload.service.js'

router.post('/upload', [uploadFiles, authUser], async (req, res) => {
  try {
    const userId = req.user.id
    const result = await sendFiles({ fileNames: req.fileNames, userId })
    if (result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, data: result })
  } catch (error) {
    console.error('Error with uploading files: ', error)
    res.json({ status: 500, error: 'Файл хуулахад алдаа гарлаа' })
  }
})

export default router