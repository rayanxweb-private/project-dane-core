'use server';

import { adminStorage, adminAuth } from '@/config/firebase-admin';
import { encryptBuffer } from '@/utils/crypto';
import { cookies } from 'next/headers';
import { winstonLogger } from '@/lib/logger';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Strict 5MB structural allocation constraint boundary

export async function uploadMerchantLegalDocumentAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) return { success: false, error: 'UNAUTHENTICATED' };
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'MISSING_FILE_PAYLOAD' };

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: 'INVALID_FILE_TYPE', message: 'Only PDF, JPEG, and PNG objects are allowed.' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'FILE_SIZE_EXCEEDED', message: 'Maximum asset scale boundary limit is 5MB.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Cryptographic Isolation Enforcement prior to persistence
    const { encryptedData, iv, tag } = encryptBuffer(fileBuffer);

    const bucket = adminStorage.bucket();
    const destinationPath = `merchants/docs/${decodedToken.uid}/${Date.now()}_${file.name}.enc`;
    const storageFile = bucket.file(destinationPath);

    await storageFile.save(encryptedData, {
      metadata: {
        contentType: 'application/octet-stream',
        metadata: {
          originalMimeType: file.type,
          ownerUid: decodedToken.uid,
          cryptoIv: iv,
          cryptoTag: tag
        }
      }
    });

    winstonLogger.info(`Secure cryptographic asset upload successfully generated: ${destinationPath}`);
    return { success: true, data: { storageRefPath: destinationPath } };

  } catch (error: any) {
    winstonLogger.error('Fatal failure operating secure merchant asset framework upload upload:', error);
    return { success: false, error: 'UPLOAD_FAILURE', message: error.message };
  }
      }
