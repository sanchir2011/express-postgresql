/* eslint-disable no-undef */
import { db } from '#db/connection.js'
import { tokenDB, userDB } from '#db/schema.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { eq } from 'drizzle-orm'
import { convertZodError, validEmail, validUuid } from '#lib/validation.js'
dotenv.config()

export async function getToken(token) {
  try {
    if(!token) return { error: 'Токен хоосон байна' }
    const [currentToken] = await db.select().from(tokenDB).where(eq(tokenDB.token, token)).limit(1)
    if (!currentToken) return { error: 'Токен олдсонгүй' }
    return currentToken
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function createToken({ id, email, type }) {
  try {
    id = validUuid.parse(id)
    email = validEmail.parse(email)
    const userData = { id, email, type }
    const accessToken = jwt.sign(userData, process.env.SECRET, { expiresIn: '48h' })
    const [accessTokenDB] = await db.insert(tokenDB).values({ token: accessToken }).returning()
    if(!accessTokenDB) return { error: 'Токен үүсгэхэд алдаа гарлаа' }
    await db.update(userDB).set({ lastLoginAt: new Date(Date.now()) }).where(eq(userDB.id, id))
    return accessToken
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function deleteToken(token){
  try {
    if(!token) return { error: 'Токен хоосон байна' }
    const [currentToken] = await db.select().from(tokenDB).where(eq(tokenDB.token, token)).limit(1)
    if (!currentToken) return { error: 'Токен олдсонгүй' }
    await db.delete(tokenDB).where(eq(tokenDB.token, token))
    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}