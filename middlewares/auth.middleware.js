/* eslint-disable no-undef */
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { getToken } from '#services/token.service.js'
import { getUserById } from '#services/user.service.js'
dotenv.config()


export const authUser = async (req, res, next) => { // Authenticate Vendor Admin (User)
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.json({ status: 502, error: 'Танд хандах эрх байхгүй байна' })

  jwt.verify(token, process.env.SECRET, async (err, userData) => {
    if(err) return res.json({ status: 502, error: 'Token хүчингүй байна' })
    const checkToken = await getToken(token)
    if(checkToken?.error) return res.json({ status: 502, error: 'Token хүчингүй байна' })
    const user = await getUserById(userData.id)
    if(user?.error) return res.json({ status: 502, error: 'Хэрэглэгч олдсонгүй' })
    req.user = user
    next()
  })
}

export const authKey = async (req, res, next) => { // Validate auth key
  const key = req.headers['auth-key']
  if(!key) return res.json({ status: 400, error: 'Auth Key хоосон байна' })
  if(key != process.env.AUTH_KEY) return res.json({ status: 400, error: 'Auth Key буруу байна' })
  next()
}

export const permResError = { status: 403, error: 'Танд энэ үйлдлийг хийх эрх байхгүй байна' }