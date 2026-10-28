import prisma from '../../config/db';
import { encrypt, decrypt } from '../../utils/encryption';

export class LicenceService {
  static async getLicence(userId: string) {
    const licence = await prisma.drivingLicence.findUnique({
      where: { userId },
    });
    if (!licence) return null;

    let decryptedNumber = '****';
    try {
      decryptedNumber = decrypt(licence.licenceNumberEncrypted);
    } catch (e) {
      decryptedNumber = 'Encrypted Record';
    }

    const now = new Date();
    const exp = new Date(licence.expiryDate);
    const diffTime = exp.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 3600 * 24));

    let status = 'VALID';
    if (daysUntilExpiry < 0) {
      status = 'EXPIRED';
    } else if (daysUntilExpiry <= 30) {
      status = 'EXPIRING_SOON';
    }

    return {
      id: licence.id,
      licenceNumber: decryptedNumber,
      vehicleClasses: licence.vehicleClasses,
      issueDate: licence.issueDate,
      expiryDate: licence.expiryDate,
      issuingAuthority: licence.issuingAuthority,
      bloodGroup: licence.bloodGroup,
      documentUrl: licence.documentUrl,
      status,
      daysUntilExpiry,
      updatedAt: licence.updatedAt,
    };
  }

  static async saveLicence(userId: string, data: any) {
    const encryptedNumber = encrypt(data.licenceNumber.trim().toUpperCase());

    await prisma.drivingLicence.upsert({
      where: { userId },
      create: {
        userId,
        licenceNumberEncrypted: encryptedNumber,
        vehicleClasses: data.vehicleClasses.trim(),
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        issuingAuthority: data.issuingAuthority?.trim() || null,
        bloodGroup: data.bloodGroup?.trim() || null,
        documentUrl: data.documentUrl || null,
      },
      update: {
        licenceNumberEncrypted: encryptedNumber,
        vehicleClasses: data.vehicleClasses.trim(),
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        issuingAuthority: data.issuingAuthority?.trim() || null,
        bloodGroup: data.bloodGroup?.trim() || null,
        documentUrl: data.documentUrl || null,
      },
    });

    return this.getLicence(userId);
  }

  static async deleteLicence(userId: string) {
    await prisma.drivingLicence.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Driving licence removed.' };
  }
}

