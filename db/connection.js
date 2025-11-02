/* eslint-disable no-undef */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL utga onoogdoogui baina.')
}

const client = postgres(process.env.POSTGRES_URL)
export const db = drizzle(client)
