import { config } from 'dotenv'
config()

import { genSaltSync, hashSync, compare } from 'bcryptjs'

import { db } from '#db/connection.js'
import { userDB, verificationDB } from '#db/schema.js'

import { convertZodError, validEmail, validFullName, validPassword, validPhoneNumber, validUuid } from '#lib/validation.js'
import { and, desc, eq } from 'drizzle-orm'
import { checkVerificationById, createVerification } from './verification.service.js'

export async function getUsers() {
  try {
    const users = await db.select().from(userDB).orderBy(desc(userDB.createdAt))
    return users
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function getUserById(id) {
  try {
    id = validUuid.parse(id)
    const [user] = await db.select().from(userDB).where(eq(userDB.id, id))
    if(!user) return { error: 'Хэрэглэгч олдсонгүй' }
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function getUserByEmail(email) {
  try {
    email = validEmail.parse(email)
    const [user] = await db.select().from(userDB).where(and(eq(userDB.email, email), eq(userDB.isVerified, true)))
    if(!user) return { error: 'Хэрэглэгч олдсонгүй' }
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function getUserByPhone(phone) {
  try {
    phone = validPhoneNumber.parse(phone)
    const [user] = await db.select().from(userDB).where(and(eq(userDB.phone, phone), eq(userDB.isVerified, true)))
    if(!user) return { error: 'Хэрэглэгч олдсонгүй' }
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function getUserByGoogleEmail(email) {
  try {
    email = validEmail.parse(email)
    const [user] = await db.select().from(userDB).where(eq(userDB.email, email))
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function createUser({ email, password, firstName, lastName, phone, avatar = null, isThirdParty = false }) {
  try {
    email = validEmail.parse(email)
    firstName = validFullName.parse(firstName)
    lastName = validFullName.parse(lastName)
    if(phone) phone = validPhoneNumber.parse(phone)

    const [existingUserEmail] = await db.select().from(userDB).where(eq(userDB.email, email))

    if(existingUserEmail && existingUserEmail.isVerified) {
      return { error: 'Имэйл хаяг бүртгэлтэй байна' }
    }

    if(existingUserEmail && !existingUserEmail.isVerified) {
      await db.delete(userDB).where(eq(userDB.id, existingUserEmail.id))
      await db.delete(verificationDB).where(eq(verificationDB.email, email))
    }

    let userData = { email, firstName, lastName, isVerified: isThirdParty }
    if(phone) userData.phone = phone
    if(avatar) userData.avatar = avatar
    if(!isThirdParty) {
      password = validPassword.parse(password)
      const salt = genSaltSync(10)
      const hash = hashSync(password, salt)
      userData.password = hash
    }

    const [user] = await db.insert(userDB).values(userData).returning()
    if(!user) return { error: 'Хэрэглэгч үүсгэхэд алдаа гарлаа' }

    if(!isThirdParty) await createVerification({ email, type: 'register' })

    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function updateUser({ id, email, firstName, lastName, phone, googleId, avatar }) {
  try {
    id = validUuid.parse(id)
    const [existingUser] = await db.select().from(userDB).where(eq(userDB.id, id))
    if(!existingUser) return { error: 'Хэрэглэгч олдсонгүй' }

    let updateData = { updatedAt: new Date(Date.now()) }

    if(email && email.toLowerCase() != existingUser.email) updateData.email = validEmail.parse(email)
    if(firstName) updateData.firstName = validFullName.parse(firstName)
    if(lastName) updateData.lastName = validFullName.parse(lastName)
    if(phone && phone != existingUser.phone) updateData.phone = validPhoneNumber.parse(phone)
    if(googleId && googleId != existingUser.googleId) updateData.googleId = googleId
    if(avatar && avatar != existingUser.avatar) updateData.avatar = avatar

    const [user] = await db.update(userDB).set(updateData).where(eq(userDB.id, id)).returning()
    if(!user) return { error: 'Мэдээлэл шинэчлэхэд алдаа гарлаа' }
    delete user.password
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function updateUserPassword({ id, oldPassword, newPassword }) {
  try {
    id = validUuid.parse(id)
    oldPassword = validPassword.parse(oldPassword)
    newPassword = validPassword.parse(newPassword)

    const [existingUser] = await db.select().from(userDB).where(eq(userDB.id, id))
    if(!existingUser) return { error: 'Хэрэглэгч олдсонгүй' }

    const isMatch = await compare(oldPassword, existingUser.password)
    if(!isMatch) return { error: 'Хуучин нууц үг буруу байна' }

    const salt = genSaltSync(10)
    const hash = hashSync(newPassword, salt)

    const [user] = await db.update(userDB).set({ password: hash, updatedAt: new Date(Date.now()) }).where(eq(userDB.id, id)).returning()
    if(!user) return { error: 'Нууц үг шинэчлэхэд алдаа гарлаа' }
    delete user.password
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function deleteUser(id) {
  try {
    id = validUuid.parse(id)
    const [user] = await db.select().from(userDB).where(eq(userDB.id, id))
    if(!user) return { error: 'Хэрэглэгч олдсонгүй' }
    await db.delete(userDB).where(eq(userDB.id, id))
    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function checkUserLogin({ email, password }) {
  try {
    email = validEmail.parse(email)
    password = validPassword.parse(password)

    const [user] = await db.select().from(userDB).where(eq(userDB.email, email))
    if(!user) return { error: 'Имэйл эсвэл нууц үг буруу байна' }

    if(!user.password) return { error: 'Google хаягаар нэвтрэнэ үү' }

    const isMatch = await compare(password, user.password)
    if(!isMatch) return { error: 'Имэйл эсвэл нууц үг буруу байна' }

    delete user.password
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function sendUserForgotPassword(email) {
  try {
    email = validEmail.parse(email)
    const [user] = await db.select().from(userDB).where(eq(userDB.email, email))
    if(!user) return { error: 'Бүртгэлтэй имэйл хаяг олдсонгүй' }
    const verificationDB = await createVerification({ email, type: 'password' })
    if(verificationDB?.error) return verificationDB
    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function resetPasswordVerification({ email, verificationId, password }) {
  try {
    email = validEmail.parse(email)
    verificationId = validUuid.parse(verificationId)
    password = validPassword.parse(password)
    const verificationData = await checkVerificationById({ email, id: verificationId, type: 'password' })
    if(verificationData?.error) return verificationData
    const [existingUser] = await db.select().from(userDB).where(eq(userDB.email, email))
    if(!existingUser) return { error: 'Бүртгэлтэй имэйл хаяг олдсонгүй' }
    const salt = genSaltSync(10)
    const hash = hashSync(password, salt)
    const [user] = await db.update(userDB).set({ password: hash, updatedAt: new Date(Date.now()) }).where(eq(userDB.id, existingUser.id)).returning()
    if(!user) return { error: 'Нууц үг шинэчлэхэд алдаа гарлаа' }
    await db.delete(verificationDB).where(eq(verificationDB.id, verificationId))
    return true
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function verifyUserEmail(email) {
  try {
    email = validEmail.parse(email)
    const [user] = await db.select().from(userDB).where(eq(userDB.email, email))
    if(!user) return { error: 'Бүртгэлтэй имэйл хаяг олдсонгүй' }
    await db.update(userDB).set({ isVerified: true }).where(eq(userDB.id, user.id))
    return user
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}