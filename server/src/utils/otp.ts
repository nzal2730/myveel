import crypto from 'crypto';

export function generateOtp(): string {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOtpHash(otp: string, hashed: string): boolean {
  const incomingHash = hashOtp(otp);
  try {
    return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashed));
  } catch {
    return false;
  }
}

