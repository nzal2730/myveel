import prisma from '../../config/db';

export class DocumentsService {
  static async getAllDocuments(userId: string, filters?: any) {
    const where: any = {
      vehicle: { userId },
    };
    if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters?.documentType && filters.documentType !== 'ALL') {
      where.documentType = filters.documentType;
    }

    const docs = await prisma.document.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, registrationNumber: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();
    return docs.map((doc) => {
      const exp = new Date(doc.expiryDate);
      const diffTime = exp.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 3600 * 24));
      let status = 'VALID';
      if (daysUntilExpiry < 0) {
        status = 'EXPIRED';
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING_SOON';
      }

      return {
        ...doc,
        status,
        daysUntilExpiry,
      };
    });
  }

  static async getDocumentById(userId: string, docId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: docId, vehicle: { userId } },
      include: { vehicle: true },
    });
    if (!doc) throw new Error('Document not found or unauthorized');
    return doc;
  }

  static async createDocument(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const doc = await prisma.document.create({
      data: {
        vehicleId: data.vehicleId,
        documentType: data.documentType,
        documentNumber: data.documentNumber.trim(),
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        fileUrl: data.fileUrl || null,
        notes: data.notes?.trim() || null,
      },
    });

    return doc;
  }

  static async updateDocument(userId: string, docId: string, data: any) {
    const doc = await prisma.document.findFirst({
      where: { id: docId, vehicle: { userId } },
    });
    if (!doc) throw new Error('Document not found or unauthorized');

    const updated = await prisma.document.update({
      where: { id: docId },
      data: {
        ...(data.documentType ? { documentType: data.documentType } : {}),
        ...(data.documentNumber ? { documentNumber: data.documentNumber.trim() } : {}),
        ...(data.issueDate ? { issueDate: new Date(data.issueDate) } : {}),
        ...(data.expiryDate ? { expiryDate: new Date(data.expiryDate) } : {}),
        ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
      },
    });

    return updated;
  }

  static async deleteDocument(userId: string, docId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: docId, vehicle: { userId } },
    });
    if (!doc) throw new Error('Document not found or unauthorized');

    await prisma.document.delete({
      where: { id: docId },
    });

    return { success: true, message: 'Document removed from vault.' };
  }
}

