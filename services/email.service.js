/* eslint-disable no-undef */
import { Resend } from 'resend'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import hbs from 'handlebars'
import dotenv from 'dotenv'
import { convertZodError, validEmail, validFullName } from '#lib/validation.js'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ email, subject = 'Subject', templateName = 'register', context = {} }) {
  try {
    email = validEmail.parse(email)

    let from = process.env.SENDER_EMAIL_FROM

    const template = readFileSync(resolve(process.cwd(), `lib/templates/${templateName}.hbs`), 'utf8')
    const compiledTemplate = hbs.compile(template)
    const html = compiledTemplate(context)
    const result = await resend.emails.send({
      from: from,
      to: email,
      subject,
      html
    })
    return result
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}

export async function subscribeEmail({ email, firstName, lastName }) {
  try {
    const audienceId = 'id'

    email = validEmail.parse(email)
    firstName = validFullName.parse(firstName)
    lastName = validFullName.parse(lastName)

    const result = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId
    })
    return result
  } catch (error) {
    if(convertZodError(error)) return convertZodError(error)
    console.error('Error occurred: ', error)
    return { error: 'Ямар нэгэн алдаа гарлаа' }
  }
}