import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'abcdefghijklmnopqrstuvwxyz012345'; // Must be strictly 32 bytes cryptographically secure key string
const ALGORITHM = 'aes-256-gcm';

export function encryptBuffer(buffer: Buffer): { encryptedData: Buffer; iv: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedData,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

export function decryptBuffer(encryptedBuffer: Buffer, iv: string, tag: string): Buffer {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}
