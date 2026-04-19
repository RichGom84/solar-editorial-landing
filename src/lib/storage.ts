import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { firebaseStorage } from './firebase'
import { compressToWebp } from './image-processor'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif']

export function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return '이미지 파일만 업로드할 수 있습니다.'
  if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(file.type)) {
    if (!file.type.startsWith('image/')) return '지원하지 않는 이미지 형식입니다.'
  }
  if (file.size > MAX_FILE_SIZE) return '이미지는 10MB 이하만 업로드할 수 있습니다.'
  return null
}

export async function uploadReviewImage(userId: string, orderId: string, file: File, index: number): Promise<string> {
  const err = validateImage(file)
  if (err) throw new Error(err)

  const webpBlob = await compressToWebp(file, { maxDimension: 1600, quality: 0.82 })
  const path = `reviews/${userId}/${orderId}/${Date.now()}-${index}.webp`
  const storageRef = ref(firebaseStorage, path)
  await uploadBytes(storageRef, webpBlob, { contentType: 'image/webp' })
  return getDownloadURL(storageRef)
}

export async function uploadReviewImages(userId: string, orderId: string, files: File[]): Promise<string[]> {
  return Promise.all(files.map((f, i) => uploadReviewImage(userId, orderId, f, i)))
}

export async function deleteStorageFileByUrl(url: string) {
  try {
    const storageRef = ref(firebaseStorage, url)
    await deleteObject(storageRef)
  } catch (e) {
    console.warn('Storage delete failed (may already be gone):', e)
  }
}
