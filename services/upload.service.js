import dotenv from 'dotenv'
import { db } from '#db/connection.js'
import { uploadDB } from '#db/schema.js'
dotenv.config()


export async function sendFiles({ fileNames, userId }) {
  try {
    let uploadedFiles = []
    for(let i = 0; i < fileNames.length; i++) {
      const uploadData = {
        fileName: fileNames[i],
        createdAt: new Date(Date.now())
      }
      if(userId) uploadData.userId = userId
      const [result] = await db.insert(uploadDB).values(uploadData).returning()
      if(!result) continue
      uploadedFiles.push(fileNames[i])
    }
    return uploadedFiles
  } catch(error) {
    console.error(error)
    return { error: 'Файл хуулахад алдаа гарлаа' }
  }
}