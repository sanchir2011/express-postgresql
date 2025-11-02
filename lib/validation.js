import { z } from 'zod'

const domainNameRegex = new RegExp('^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?.)+[a-zA-Z]{2,}$')
const mongolianName = /^[А-ЯЁӨҮа-яёөү -]+$/u
const ibanRegex = /^\d{18}$/;

export const validUuid = z.string({ required_error: 'ID хоосон байна', invalid_type_error: 'ID буруу байна' }).uuid({ message: 'ID буруу байна' })
export const validEmail = z.string({ required_error: 'Имэйл хаяг хоосон байна', invalid_type_error: 'Имэйл хаяг буруу байна' }).email({ message: 'Имэйл буруу байна' }).toLowerCase()
export const validFullName = z.string({ required_error: 'Овог нэр хоосон байна', invalid_type_error: 'Овог нэр буруу байна' }).min(1, { message: 'Нэр 1-оос дээш тэмдэгттэй байна' })
export const validPhoneNumber = z.string({ required_error: 'Утасны дугаар хоосон байна', invalid_type_error: 'Утасны дугаар буруу байна' }).length(8, { message: 'Утасны дугаар 8 тэмдэгттэй байна' }).regex(/^[0-9]+$/, { message: 'Утасны дугаар буруу байна' })
export const validPassword = z.string({ required_error: 'Нууц үг хоосон байна', invalid_type_error: 'Нууц үг хоосон байна' }).min(8, { message: 'Нууц үг 8-оос дээш тэмдэгттэй байна' })
export const validBoolean = z.boolean({ required_error: 'Мэдээлэл буруу байна', invalid_type_error: 'Мэдээлэл буруу байна' })
export const validStringArray = z.string({ required_error: 'Мэдээлэл буруу байна', invalid_type_error: 'Мэдээлэл буруу байна' }).array({ required_error: 'Мэдээлэл буруу байна', invalid_type_error: 'Мэдээлэл буруу байна' }).optional()
export const validURL = z.string({ required_error: 'URL буруу байна', invalid_type_error: 'URL буруу байна' }).regex(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i, 'URL буруу байна' )
export const validNumber = z.number({ required_error: 'Мэдээлэл буруу байна', invalid_type_error: 'Мэдээлэл буруу байна' }).min(0, { message: 'Мэдээлэл буруу байна' })
export const validRegisterNumber = z.string({ required_error: 'Регистрийн дугаар хоосон байна', invalid_type_error: 'Регистрийн дугаар буруу байна' }).length(10, { message: 'Регистрийн дугаар 10 тэмдэгттэй байна' })
export const validBankAccountNumber = z.string({ required_error: 'Банкны дансны дугаар хоосон байна', invalid_type_error: 'Банкны дансны дугаар буруу байна' }).min(9, { message: 'Банкны дансны дугаар буруу байна' }).max(10, { message: 'Банкны дансны дугаар буруу байна' }).regex(/^[0-9]+$/, { message: 'Банкны дансны дугаар буруу байна' })
export const validDomainName = z.string({ required_error: 'Домэйн нэр хоосон байна', invalid_type_error: 'Домэйн нэр буруу байна' }).min(3, { message: 'Домэйн нэр 3-оос дээш тэмдэгттэй байна' }).regex(domainNameRegex, { message: 'Домэйн нэр буруу байна' }).toLowerCase().refine(domain => !domain.endsWith('.shop.mn') && !domain.endsWith('.shop.demo.mn'), { message: 'Домэйн нэр .shop.mn-ээр дуусч болохгүй' })
export const validMongolianName = z.string({ required_error: 'Нэр хоосон байна', invalid_type_error: 'Нэр буруу байна' }).regex(mongolianName, { message: 'Нэр кирилээр байх ёстой' }).min(2, { message: 'Нэр 2-оос дээш тэмдэгттэй байна' })
export const validIban = z.string({ required_error: 'IBAN хоосон байна', invalid_type_error: 'IBAN буруу байна. Бүтэн дугаараар оруулна уу.' }).regex(ibanRegex, { message: 'IBAN буруу байна Бүтэн дугаараар оруулна уу.' }).toUpperCase().transform(value => 'MN' + value)
export const validDate = z.string({ required_error: 'Огноо хоосон байна', invalid_type_error: 'Огноо буруу байна' }).refine(date => !isNaN(Date.parse(date)), { message: 'Огноо буруу байна' })

export const validUserRole = z.enum(['superadmin', 'manager', 'sales', 'courier', 'content', 'accountant'], { required_error: 'Хэрэглэгчийн эрх буруу байна', invalid_type_error: 'Хэрэглэгчийн эрх буруу байна' })
export const validVerificationType = z.enum(['register', 'password'], { required_error: 'Баталгаажуулалтын төрөл хоосон байна', invalid_type_error: 'Баталгаажуулалтын төрөл буруу байна' })

export const convertZodError = (error, defaultMessage = 'Бичиглэл буруу байна') => {
  if(error instanceof z.ZodError) return { error: error?.errors[0]?.message || defaultMessage }
  else return null
}