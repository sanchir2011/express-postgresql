import { Router } from 'express'
const router = Router()

import { authUser } from '#middlewares/auth.middleware.js'
import { getUsers } from '#services/user.service.js'

router.get('/user', authUser, async (req, res) => {
  try {
    let user = req.user
    delete user.password
    res.json({ status: 200, data: user })
  } catch (error) {
    console.error(error)
    return res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' })
  }
})

router.get('/users', authUser, async (req, res) => {
  try {
    const result = await getUsers()
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, data: result })
  } catch (error) {
    console.error(error)
    return res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' })
  }
})

export default router