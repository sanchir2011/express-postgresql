import { pgTable, pgEnum, varchar, timestamp, json, uuid, boolean, integer } from 'drizzle-orm/pg-core';


// User

export const userDB = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  firstName: varchar('firstName').notNull(),
  lastName: varchar('lastName'),
  email: varchar('email').notNull(),
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


// Verification

export const verificationTypeEnum = pgEnum('verificationType', ['register', 'password']);

export const verificationDB = pgTable('Verification', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email'),
  phone: varchar('phone'),
  code: varchar('code'),
  type: verificationTypeEnum().notNull().default('register'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow(),
});


// Token

export const tokenDB = pgTable('Token', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  token: varchar('token'),
  createdAt: timestamp('createdAt').defaultNow(),
});


// Upload

export const uploadDB = pgTable('Upload', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  fileName: varchar('fileName'),
  userId: uuid('userId'),
  mimeType: varchar('mimeType'),
  fileSize: integer('fileSize'),
  createdAt: timestamp('createdAt').defaultNow(),
});
