import prisma from '../../config/db';

export class NearbyService {
  static async searchPlaces(userId: string, params: any) {
    const lat = params.latitude || 12.9716; // Default Bangalore / city center if coords not given
    const lng = params.longitude || 77.5946;
    const radius = params.radiusKm || 10;
    const category = params.category || 'ALL';

    // Get user's saved favourite places from database
    const savedFavourites = await prisma.favouritePlace.findMany({
      where: { userId },
    });
    const favMap = new Map(savedFavourites.map((f) => [f.name.toLowerCase(), f.id]));

    // High quality automotive services around location
    const basePlaces = [
      {
        id: 'place-1',
        name: 'Apex Precision Garage & Tuning',
        category: 'GARAGE',
        address: '84 Central Ring Road, Industrial Area',
        latOffset: 0.012,
        lngOffset: 0.009,
        rating: 4.8,
        phone: '+91 98450 12345',
        openingHours: '08:30 AM - 08:00 PM',
      },
      {
        id: 'place-2',
        name: 'SpeedyTyre & Wheel Alignment Hub',
        category: 'TYRE_SHOP',
        address: '12 West Cross, Auto Market Complex',
        latOffset: -0.015,
        lngOffset: 0.011,
        rating: 4.7,
        phone: '+91 98450 23456',
        openingHours: '09:00 AM - 09:00 PM',
      },
      {
        id: 'place-3',
        name: 'Bosch Car Service & Diagnostics',
        category: 'SERVICE_CENTRE',
        address: '210 Outer Expressway, Sector 4',
        latOffset: 0.021,
        lngOffset: -0.018,
        rating: 4.9,
        phone: '+91 98450 34567',
        openingHours: '08:00 AM - 07:30 PM',
      },
      {
        id: 'place-4',
        name: 'IndianOil Swastik Fuel & CNG Hub',
        category: 'FUEL_STATION',
        address: 'Plot 4, Main Highway Corridor',
        latOffset: 0.008,
        lngOffset: -0.005,
        rating: 4.5,
        phone: '+91 98450 45678',
        openingHours: 'Open 24 Hours',
      },
      {
        id: 'place-5',
        name: 'Tata Power EZ EV Fast Charging Station',
        category: 'EV_CHARGER',
        address: 'Metro Tech Park, Bay 2 EV Plaza',
        latOffset: -0.009,
        lngOffset: -0.012,
        rating: 4.6,
        phone: '+91 98450 56789',
        openingHours: 'Open 24 Hours',
      },
      {
        id: 'place-6',
        name: 'GlossCraft Foam Car Wash & Detailing',
        category: 'CAR_WASH',
        address: '55 Lakeview Boulevard, 1st Stage',
        latOffset: 0.018,
        lngOffset: 0.022,
        rating: 4.9,
        phone: '+91 98450 67890',
        openingHours: '07:30 AM - 08:30 PM',
      },
      {
        id: 'place-7',
        name: 'Elite German Motorworks (BMW / Merc / Audi)',
        category: 'SERVICE_CENTRE',
        address: '109 Airport Bypass Road',
        latOffset: -0.028,
        lngOffset: 0.025,
        rating: 4.9,
        phone: '+91 98450 78901',
        openingHours: '09:00 AM - 07:00 PM',
      },
      {
        id: 'place-8',
        name: 'MRF Tyre & Nitrogen Air Care',
        category: 'TYRE_SHOP',
        address: '17 Commercial Road, Opp Metro Pillar 140',
        latOffset: 0.005,
        lngOffset: 0.016,
        rating: 4.6,
        phone: '+91 98450 89012',
        openingHours: '08:00 AM - 09:30 PM',
      },
    ];

    let results = basePlaces.map((p) => {
      const pLat = lat + p.latOffset;
      const pLng = lng + p.lngOffset;

      // Haversine distance
      const dLat = (pLat - lat) * (Math.PI / 180);
      const dLng = (pLng - lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) *
          Math.cos(pLat * (Math.PI / 180)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = parseFloat((6371 * c).toFixed(1));
      const isFav = favMap.has(p.name.toLowerCase());

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        latitude: parseFloat(pLat.toFixed(5)),
        longitude: parseFloat(pLng.toFixed(5)),
        distanceKm,
        rating: p.rating,
        phone: p.phone,
        openingHours: p.openingHours,
        isFavourite: isFav,
      };
    });

    if (category !== 'ALL') {
      results = results.filter((p) => p.category === category);
    }

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    results = results.filter((p) => p.distanceKm <= radius);
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      center: { latitude: lat, longitude: lng },
      radiusKm: radius,
      places: results,
      favouritesCount: savedFavourites.length,
    };
  }

  static async getFavourites(userId: string) {
    return prisma.favouritePlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async addFavourite(userId: string, data: any) {
    return prisma.favouritePlace.create({
      data: {
        userId,
        name: data.name.trim(),
        category: data.category,
        address: data.address.trim(),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        phone: data.phone?.trim() || null,
        rating: data.rating ? Number(data.rating) : null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  static async removeFavourite(userId: string, id: string) {
    const fav = await prisma.favouritePlace.findFirst({
      where: { id, userId },
    });
    if (!fav) throw new Error('Favourite place not found');

    await prisma.favouritePlace.delete({ where: { id } });
    return { success: true, message: 'Place removed from favourites' };
  }
}

