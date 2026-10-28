import { Response } from 'express';
import { NearbyService } from './nearby.service';

export class NearbyController {
  static async search(req: any, res: Response) {
    try {
      const { category, latitude, longitude, radiusKm, query } = req.query;
      const data = await NearbyService.searchPlaces(req.user.id, {
        category: category as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radiusKm: radiusKm ? parseFloat(radiusKm as string) : undefined,
        query: query as string,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getFavourites(req: any, res: Response) {
    try {
      const favourites = await NearbyService.getFavourites(req.user.id);
      return res.json({ success: true, data: favourites });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async addFavourite(req: any, res: Response) {
    try {
      const { name, category, address, latitude, longitude, phone, rating, notes } = req.body;
      if (!name || !category || !address || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Name, category, address, latitude, and longitude are required.',
        });
      }

      const fav = await NearbyService.addFavourite(req.user.id, {
        name,
        category,
        address,
        latitude,
        longitude,
        phone,
        rating,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Place saved to favourites.',
        data: fav,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async removeFavourite(req: any, res: Response) {
    try {
      const result = await NearbyService.removeFavourite(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

