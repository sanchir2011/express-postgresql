import { pgTable, pgEnum, varchar, timestamp, json, uuid, boolean } from 'drizzle-orm/pg-core';


// Verification

export const verificationTypeEnum = pgEnum('verificationType', ['register', 'password']);

export const verification = pgTable('Verification', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email'),
  phone: varchar('phone'),
  code: varchar('code'),
  type: verificationTypeEnum().notNull().default('register'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow(),
});


// Token

export const token = pgTable('Token', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  token: varchar('token'),
  createdAt: timestamp('createdAt').defaultNow(),
});


// User

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  firstName: varchar('firstName'),
  lastName: varchar('lastName'),
  email: varchar('email'),
  password: varchar('password'),
  phone: varchar('phone'),
  avatar: varchar('avatar'),
  isActive: boolean('isActive').default(true),
  isVerified: boolean('isVerified').notNull().default(false),
  googleId: varchar('googleId'),
  lastLoginAt: timestamp('lastLoginAt'),
  lastLoginIP: json('lastLoginIP'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
});