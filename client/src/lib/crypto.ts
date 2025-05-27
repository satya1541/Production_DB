/**
 * Client-side encryption utilities using Web Crypto API
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

/**
 * Generate a random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random IV
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive encryption key from PIN and salt
 */
export async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  
  // Import PIN as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinData,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with PIN
 */
export async function encryptData(data: string, pin: string): Promise<{
  encryptedData: string;
  salt: string;
  iv: string;
}> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(pin, salt);
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    dataBuffer
  );
  
  return {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt data with PIN
 */
export async function decryptData(
  encryptedData: string,
  pin: string,
  salt: string,
  iv: string
): Promise<string> {
  const saltBuffer = base64ToArrayBuffer(salt);
  const ivBuffer = base64ToArrayBuffer(iv);
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  
  const key = await deriveKey(pin, new Uint8Array(saltBuffer));
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(ivBuffer) },
    key,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash PIN for verification (not for encryption)
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}
