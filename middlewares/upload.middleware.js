/* eslint-disable no-undef */
import { Storage } from '@google-cloud/storage'
import busboy from 'busboy'
import CryptoJS from 'crypto-js'
import sharp from 'sharp'
import dotenv from 'dotenv'
import convert from 'heic-convert'
dotenv.config()

const storage = new Storage({
  keyFilename: process.env.GOOGLE_STORAGE_PATH,
  projectId: process.env.GOOGLE_PROJECT_ID,
})

async function convertHeicBufferToJpg(heicBuffer, options = {}) {
  try {
    const jpegBuffer = await convert({
      buffer: heicBuffer,
      format: 'JPEG',
      quality: options.quality || 0.75
    });
    
    const processedBuffer = await sharp(jpegBuffer).jpeg({ quality: 75, mozjpeg: true }).resize({ width: 1200 }).withMetadata().toBuffer();
    
    return processedBuffer;
  } catch (error) {
    console.error('❌ Buffer conversion failed:', error.message);
    throw error;
  }
}

const optimizeFile = async (fileBuffer, mimeType) => {
  let optimizedBuffer
  try {
    if (mimeType === 'image/jpeg') {
      optimizedBuffer = await sharp(fileBuffer).jpeg({ quality: 75, mozjpeg: true }).resize({ width: 1200 }).withMetadata().toBuffer()
    } else if (mimeType === 'image/png') {
      optimizedBuffer = await sharp(fileBuffer).png({ quality: 75 }).resize({ width: 1200 }).withMetadata().toBuffer()
    } else if (mimeType === 'image/webp') {
      optimizedBuffer = await sharp(fileBuffer).webp({ quality: 75 }).resize({ width: 1200 }).withMetadata().toBuffer()
    } else if (mimeType === 'image/gif') {
      optimizedBuffer = await sharp(fileBuffer).gif({ quality: 75 }).resize({ width: 1200 }).withMetadata().toBuffer()
    } else if (mimeType === 'image/heif') {
      optimizedBuffer = await sharp(fileBuffer).heif({ quality: 75 }).resize({ width: 1200 }).withMetadata().toBuffer()
    } else if (mimeType === 'image/heic') {
      optimizedBuffer = await convertHeicBufferToJpg(fileBuffer)
    }
    else {
      optimizedBuffer = fileBuffer
    }
  } catch (error) {
    console.error('Image optimization failed:', error.message)
    optimizedBuffer = fileBuffer
  }
  return optimizedBuffer
}

const randomFileName = (type) => {
  const random16Bytes = CryptoJS.lib.WordArray.random(16)
  const randomName = random16Bytes.toString(CryptoJS.enc.Hex)
  if(!type) return randomName
  let ext = '.jpg'
  if(type == 'image/jpeg') ext = '.jpg'
  if(type == 'image/png') ext = '.png'
  if(type == 'image/webp') ext = '.webp'
  if(type == 'image/gif') ext = '.gif'
  if(type == 'image/heic') ext = '.jpg'
  if(type == 'image/heif') ext = '.jpg'
  if(type == 'application/pdf') ext = '.pdf'
  if(type == 'text/plain') ext = '.txt'
  if(type == 'application/msword') ext = '.doc'
  if(type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = '.docx'
  if(type == 'application/vnd.ms-powerpoint') ext = '.ppt'
  if(type == 'application/vnd.openxmlformats-officedocument.presentationml.presentation') ext = '.pptx'
  if(type == 'application/vnd.ms-excel') ext = '.xls'
  if(type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ext = '.xlsx'
  if(type == 'application/zip') ext = '.zip'
  if(type == 'application/vnd.rar') ext = '.rar'

  return randomName + ext
}

export const uploadFiles = (req, res, next) => { // Зөвхөн JPG, PNG, WEBP, GIF, PDF, TXT, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR файлууд хүлээж авна
  const MAX_MB = 10
  const bucketName = process.env.GOOGLE_BUCKET_NAME
  const MAX_FILE_SIZE = MAX_MB * 1048576
  const bb = busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE, files: 10 } })
  let fileUploaded = false
  let isMaxSize = false
  let isWrongType = false
  let fileNames = []
  let uploadPromises = []

  const fileProccess = async (fileBuffer, mimeType, fileName) => {
    const optimizedBuffer = await optimizeFile(fileBuffer, mimeType)
    return storage.bucket(bucketName).file(`uploads/${fileName}`).save(optimizedBuffer).then(() => fileNames.push(fileName))
  }

  try {
    bb.on('file', async function(fieldname, file, info) {
      const fileBuffer = []
      fileUploaded = true
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'application/pdf', 'plain/text', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.rar', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']
      if(!supportedTypes.includes(info.mimeType)) {
        file.resume()
        isWrongType = true
      }

      const fileName = randomFileName(info.mimeType)
      
      file.on('limit', function(){
        file.resume()
        isMaxSize = true 
      })

      file.on('data', (data) => {
        fileBuffer.push(data)
      })

      file.on('end', async () => {
        if(isWrongType) return res.json({ status: 401, error: 'Зөвхөн PNG, JPG, WEBP эсвэл GIF' })
        if(isMaxSize) return res.json({ status: 402, error: `Хамгийн ихдээ ${MAX_MB}MB байна` })

        const finalBuffer = Buffer.concat(fileBuffer)

        uploadPromises.push(fileProccess(finalBuffer, info.mimeType, fileName))
      })
    })

    bb.on('finish', async function() {
      if(!fileUploaded) return res.json({ status: 400, error: 'Файл хоосон байна' })

      Promise.all(uploadPromises)
        .then(() => {
          req.fileNames = fileNames
          next()
        })
        .catch(err => {
          console.error('Error uploading files: ', err)
          return res.json({ status: 500, error: 'Файл хуулахад ямар нэгэн алдаа гарлаа' })
        })
    })

    return req.pipe(bb)
  }
  catch (err) {
    console.error('Error uploading files: ', err)
    return res.json({ status: 500, error: 'Файл хуулахад ямар нэгэн алдаа гарлаа' })
  }
}