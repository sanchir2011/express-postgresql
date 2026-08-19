/* eslint-disable no-undef */
import { db } from '#db/connection.js'
import { verificationDB } from '#db/schema.js'

import { convertZodError, validEmail, validPhoneNumber, validUuid, validVerificationType } from '#lib/validation.js';
import { and, eq } from 'drizzle-orm';
import moment from 'moment';
import { sendEmail } from './email.service.js';

export async function createVerification({ email, phone, type = 'register', skipEmail = false }) {
  try {
    const EXPIRE_HOURS = 24
    let newData = {}
    if(email) {
      newData.email = validEmail.parse(email)
      const [existingVerification] = await db.select().from(verificationDB).where(and(eq(verificationDB.email, email), eq(verificationDB.type, type))).limit(1)
      if(existingVerification) {
        if(moment().isBefore(moment(existingVerification.createdAt).add(1, 'minutes'))) return { error: 'Хэсэг хугацааны дараа дахин илгээнэ үү' }
      }
      await db.delete(verificationDB).where(and(eq(verificationDB.email, email), eq(verificationDB.type, type)))
    }
    if(phone) {
      newData.phone = validPhoneNumber.parse(phone)
      const [existingVerification] = await db.select().from(verificationDB).where(and(eq(verificationDB.phone, phone), eq(verificationDB.type, type))).limit(1)
      if(existingVerification) {
        if(moment().isBefore(moment(existingVerification.createdAt).add(1, 'minutes'))) return { error: 'Хэсэг хугацааны дараа дахин илгээнэ үү' }
      }
      await db.delete(verificationDB).where(and(eq(verificationDB.phone, phone), eq(verificationDB.type, type)))
    }
    newData.type = validVerificationType.parse(type)
    if(!email && !phone) return { error: 'Имэйл эсвэл утасны дугаар хоосон байна' }

    newData.code = Math.floor(100000 + Math.random() * 899999).toString()
    newData.expiresAt = moment().add(EXPIRE_HOURS, 'hours').toDate()
    newData.createdAt = moment().toDate()
    
    const [createVerificationData] = await db.insert(verificationDB).values(newData).returning()
    if(!createVerificationData) return { error: 'Баталгаажуулалт үүсгэхэд алдаа гарлаа' }

    if(!skipEmail) {
      if(email && type == 'register') sendEmail({ email: email, subject: 'Бүртгэл баталгаажуулах ✉️', templateName: 'verify', context: { link: `${process.env.APP_URL}/verify?email=${createVerificationData.email}&id=${createVerificationData.id}`, code: newData.code } })
      if(email && type == 'password') sendEmail({ email: email, subject: 'Нууц үг сэргээх 🔑', templateName: 'forgot', context: { link: `${process.env.APP_URL}/reset?email=${createVerificationData.email}&id=${createVerificationData.id}`, code: newData.code } })
    }
    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function checkVerificationById({ email, id, type }){ 
  try {
    id = validUuid.parse(id)
    email = validEmail.parse(email)
    type = validVerificationType.parse(type)
    const [verification] = await db.select().from(verificationDB).where(and(eq(verificationDB.email, email), eq(verificationDB.id, id), eq(verificationDB.type, type))).limit(1)
    if(!verification) return { error: 'Имэйл эсвэл баталгаажуулалтын код буруу байна' }
    if(moment().isAfter(moment(verification.expiresAt))) return { error: 'Баталгаажуулалтын кодын хугацаа дууссан байна' }

    return verification
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function checkVerificationEmail({ email, code, type }){ 
  try {
    email = validEmail.parse(email)
    type = validVerificationType.parse(type)
    if(!code) return { error: 'Баталгаажуулалтын код хоосон байна' }
    const [verification] = await db.select().from(verificationDB).where(and(eq(verificationDB.email, email), eq(verificationDB.code, code), eq(verificationDB.type, type))).limit(1)
    if(!verification) return { error: 'Баталгаажуулах код буруу байна' }
    if(moment().isAfter(moment(verification.expiresAt))) return { error: 'Баталгаажуулалтын кодын хугацаа дууссан байна' }

    return verification
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function checkVerificationPhone({ phone, code, type }){
  try {
    phone = validPhoneNumber.parse(phone)
    type = validVerificationType.parse(type)
    if(!code) return { error: 'Баталгаажуулалтын код хоосон байна' }
    const [verification] = await db.select().from(verificationDB).where(and(eq(verificationDB.phone, phone), eq(verificationDB.code, code), eq(verificationDB.type, type))).limit(1)
    if(!verification) return { error: 'Утасны дугаар эсвэл баталгаажуулалтын код буруу байна' }
    if(moment().isAfter(moment(verification.expiresAt))) return { error: 'Баталгаажуулалтын кодын хугацаа дууссан байна' }

    await db.delete(verificationDB).where(eq(verificationDB.id, verification.id))

    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function deleteVerificationEmail({ email, type }) {
  try {
    email = validEmail.parse(email)
    type = validVerificationType.parse(type)
    await db.delete(verificationDB).where(and(eq(verificationDB.email, email), eq(verificationDB.type, type)))
    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}