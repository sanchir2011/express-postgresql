/* eslint-disable no-undef */
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

import { checkUserLogin, createUser, getUserByEmail, getUserByGoogleEmail, getUserByPhone, resetPasswordVerification, sendUserForgotPassword, updateUser, verifyUserEmail } from '#services/user.service.js'
import { createToken } from '#services/token.service.js'
import { checkVerificationById, checkVerificationEmail, createVerification, deleteVerificationEmail } from '#services/verification.service.js'
import { sendEmail } from '#services/email.service.js'
import { authKey } from '#middlewares/auth.middleware.js'


/*  User Auth Section  */

router.post('/register', authKey, async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body
    const createdUser = await createUser({ email, firstName, lastName, password })
    if(createdUser?.error) return res.json({ status: 400, error: createdUser?.error })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/login', authKey, async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await checkUserLogin({ email, password })
    if(user?.error) return res.json({ status: 400, error: user?.error })
    const accessToken = await createToken({ id: user.id, email: user.email, type: 'user' })
    if(accessToken?.error) return res.json({ status: 400, error: accessToken?.error })
    res.json({ status: 200, data: { ...user, accessToken } })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' })
  }
})

router.post('/google', authKey, async (req, res) => {
  try {
    if(!req.body) return res.json({ status: 400, error: 'Хүсэлт хоосон байна' })
    const { email, given_name, family_name, picture, azp, iss, sub } = req.body
    if(!email || !given_name || !azp || !iss || !sub) return res.json({ status: 400, error: 'Хүсэлт дутуу байна' })
    if(iss !== 'https://accounts.google.com' && azp !== process.env.GOOGLE_CLIENT) return res.json({ status: 401, error: 'Google хаяг буруу байна' })
    let user = await getUserByGoogleEmail(email)
    if(!user) {
      const createdUser = await createUser({ email, firstName: given_name, lastName: family_name, avatar: picture, isThirdParty: true })
      if(createdUser?.error) return res.json({ status: 400, error: createdUser?.error })
      await updateUser({ id: createdUser.id, googleId: sub })
      const accessToken = await createToken({ id: createdUser.id, email: createdUser.email, type: 'user' })
      if(accessToken?.error) return res.json({ status: 400, error: accessToken?.error })
      res.json({ status: 200, data: { ...user, accessToken } })
    }
    else {
      if(user.isActive === false) return res.json({ status: 403, error: 'Таны бүртгэл идэвхгүй болсон байна' })
      if(!user.googleId) await updateUser({ id: user.id, googleId: sub })
      const accessToken = await createToken({ id: user.id, email: user.email, type: 'user' })
      if(accessToken?.error) return res.json({ status: 400, error: accessToken?.error })
      delete user.password
      res.json({ status: 200, data: { ...user, accessToken } })
    }
  } catch (error) {
    console.error('Error google login: ', error)
    res.json({ status: 500, error: 'Google хаягаар нэвтрэхэд алдаа гарлаа' })
  }
})

router.post('/forgot', authKey, async (req, res) => {
  try {
    const { email } = req.body
    const result = await sendUserForgotPassword(email)
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/verify', authKey, async (req, res) => {
  try {
    const { email, code } = req.body
    const result = await checkVerificationEmail({ email, code, type: 'register' })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    const verify = await verifyUserEmail(email)
    if(verify?.error) return res.json({ status: 400, error: verify?.error })
    await deleteVerificationEmail({ email, type: 'register' })
    sendEmail({ email: email, subject: 'Бүртгэл амжилттай идэвхжилээ', templateName: 'register' })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/verify/resend', authKey, async (req, res) => {
  try {
    const { email } = req.body
    const result = await createVerification({ email, type: 'register' })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/verifyById', authKey, async (req, res) => {
  try {
    const { email, id } = req.body
    const result = await checkVerificationById({ email, id, type: 'register' })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    const verify = await verifyUserEmail(email)
    if(verify?.error) return res.json({ status: 400, error: verify?.error })
    await deleteVerificationEmail({ email, type: 'register' })
    sendEmail({ email: email, subject: 'Бүртгэл амжилттай идэвхжилээ', templateName: 'register' })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/forgot/check', authKey, async (req, res) => {
  try {
    const { email, code } = req.body
    const result = await checkVerificationEmail({ email, code, type: 'password' })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, data: result })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/forgot/checkById', authKey, async (req, res) => {
  try {
    const { email, id } = req.body
    const result = await checkVerificationById({ email, id, type: 'password' })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, data: result })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/forgot/resend', authKey, async (req, res) => {
  try {
    const { email } = req.body
    const result = await createVerification({ email, type: 'password' })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/reset', authKey, async (req, res) => {
  try {
    const { email, id, password } = req.body
    const result = await resetPasswordVerification({ email, verificationId: id, password })
    if(result?.error) return res.json({ status: 400, error: result?.error })
    res.json({ status: 200, ok: 1 })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})

router.post('/check/email', authKey, async (req, res) => {
  try {
    const { email } = req.body
    const result = await getUserByEmail(email)
    if(result?.error) return res.json({ status: 200, ok: 1 })
    else return res.json({ status: 400, error: 'Энэ хаяг бүртгэлтэй байна' })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' })
  }
})

router.post('/check/phone', authKey, async (req, res) => {
  try {
    const { phone } = req.body
    const result = await getUserByPhone(phone)
    if(result?.error) return res.json({ status: 200, ok: 1 })
    else return res.json({ status: 400, error: 'Энэ хаяг бүртгэлтэй байна' })
  } catch (error) {
    console.error(error)
    res.json({ status: 500, error: 'Ямар нэгэн алдаа гарлаа' }) 
  }
})


export default router