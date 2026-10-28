import { Response } from 'express';
import { DocumentsService } from './documents.service';

export class DocumentsController {
  static async getAll(req: any, res: Response) {
    try {
      const { vehicleId, documentType } = req.query;
      const docs = await DocumentsService.getAllDocuments(req.user.id, {
        vehicleId: vehicleId as string,
        documentType: documentType as string,
      });
      return res.json({ success: true, data: docs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: any, res: Response) {
    try {
      const doc = await DocumentsService.getDocumentById(req.user.id, req.params.id);
      return res.json({ success: true, data: doc });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const { vehicleId, documentType, documentNumber, issueDate, expiryDate, fileUrl, notes } =
        req.body;

      if (!vehicleId || !documentType || !documentNumber || !issueDate || !expiryDate) {
        return res.status(400).json({
          success: false,
          message:
            'Vehicle, document type, document number, issue date, and expiry date are required.',
        });
      }

      const doc = await DocumentsService.createDocument(req.user.id, {
        vehicleId,
        documentType,
        documentNumber,
        issueDate,
        expiryDate,
        fileUrl,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Document stored in vault successfully.',
        data: doc,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const updated = await DocumentsService.updateDocument(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Document updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await DocumentsService.deleteDocument(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

