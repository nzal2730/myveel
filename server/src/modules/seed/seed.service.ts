import prisma from '../../config/db';
import { LicenceService } from '../licence/licence.service';

export class SeedService {
  static async seedDemoData(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 1. Vehicle 1: Hyundai Creta
    const carReg = 'KA01ME9421';
    let car = await prisma.vehicle.findFirst({
      where: { userId, registrationNumber: carReg },
    });

    if (!car) {
      car = await prisma.vehicle.create({
        data: {
          userId,
          nickname: 'Creta Stealth',
          make: 'Hyundai',
          model: 'Creta SX(O) Turbo DCT',
          year: 2023,
          registrationNumber: carReg,
          vehicleType: 'SUV',
          fuelType: 'Petrol',
          photo:
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          currentOdometer: 18450,
          notes: 'Daily commute and highway road-trip vehicle. Ceramic coated.',
        },
      });

      // Odometer Readings for Car
      await prisma.odometerReading.createMany({
        data: [
          {
            vehicleId: car.id,
            reading: 12000,
            readingDate: new Date('2024-01-15'),
            source: 'MANUAL',
            notes: 'New Year checkpoint',
          },
          {
            vehicleId: car.id,
            reading: 15200,
            readingDate: new Date('2024-05-10'),
            source: 'SERVICE',
            notes: 'Service 2 reading',
          },
          {
            vehicleId: car.id,
            reading: 18450,
            readingDate: new Date('2024-10-01'),
            source: 'FUEL',
            notes: 'Full tank fill-up',
          },
        ],
      });

      // Services for Car
      const service1 = await prisma.serviceRecord.create({
        data: {
          vehicleId: car.id,
          serviceDate: new Date('2024-05-10'),
          serviceType: 'Periodic 15,000 km Service',
          workshopName: 'Trident Hyundai Tech Center',
          description:
            'Synthetic engine oil change, oil filter, air filter, wheel balancing, AC disinfectant.',
          partsReplaced:
            'Castrol Magnatec 5W-30 (3.8L), Oil Filter, Air Filter, Cabin Pollen Filter',
          cost: 6850,
          odometer: 15200,
          nextDueMonths: 6,
          nextDueKm: 10000,
        },
      });

      // Linked expense
      await prisma.expense.create({
        data: {
          vehicleId: car.id,
          expenseDate: new Date('2024-05-10'),
          category: 'Service',
          amount: 6850,
          description: 'Periodic 15,000 km Service at Trident Hyundai Tech Center',
          sourceType: 'SERVICE',
          sourceId: service1.id,
        },
      });

      // Insurance for Car (Expiring in 21 days for realistic notification demo!)
      const insuranceExpiry = new Date();
      insuranceExpiry.setDate(insuranceExpiry.getDate() + 21);
      const ins1 = await prisma.insurancePolicy.create({
        data: {
          vehicleId: car.id,
          insurer: 'HDFC ERGO General Insurance',
          policyNumber: 'HDFC-MOT-9982310',
          coverType: 'Zero Depreciation + Engine Protect',
          premium: 24800,
          idv: 1450000,
          startDate: new Date('2023-11-15'),
          expiryDate: insuranceExpiry,
          isActive: true,
          notes: 'Includes 24x7 Roadside Assistance, Zero Dep, and Tyre Secure add-on.',
        },
      });

      await prisma.expense.create({
        data: {
          vehicleId: car.id,
          expenseDate: new Date('2023-11-15'),
          category: 'Insurance',
          amount: 24800,
          description: 'Insurance renewal: HDFC ERGO (Zero Depreciation)',
          sourceType: 'INSURANCE',
          sourceId: ins1.id,
        },
      });

      // Documents for Car (PUC expiring in 8 days!)
      const pucExpiry = new Date();
      pucExpiry.setDate(pucExpiry.getDate() + 8);
      await prisma.document.createMany({
        data: [
          {
            vehicleId: car.id,
            documentType: 'RC',
            documentNumber: 'RC-KA01-2023-009841',
            issueDate: new Date('2023-03-10'),
            expiryDate: new Date('2038-03-09'),
            notes: 'Original smart card issued at Koramangala RTO (KA-01).',
          },
          {
            vehicleId: car.id,
            documentType: 'PUC',
            documentNumber: 'PUC-BLR-884120',
            issueDate: new Date('2024-04-15'),
            expiryDate: pucExpiry,
            notes: 'BS-VI emission test certificate.',
          },
        ],
      });

      // Fuel Logs for Car
      const fuel1 = await prisma.fuelLog.create({
        data: {
          vehicleId: car.id,
          logDate: new Date('2024-09-12'),
          fuelType: 'Petrol',
          quantity: 42.0,
          totalCost: 4326,
          pricePerUnit: 103.0,
          odometer: 17890,
          isFullTank: true,
          notes: 'HPCL Auto Care Outlet',
        },
      });

      const fuel2 = await prisma.fuelLog.create({
        data: {
          vehicleId: car.id,
          logDate: new Date('2024-10-01'),
          fuelType: 'Petrol',
          quantity: 38.5,
          totalCost: 3965.5,
          pricePerUnit: 103.0,
          odometer: 18450,
          isFullTank: true,
          calculatedEfficiency: 14.55, // (18450 - 17890) / 38.5 = 14.55 km/L
          notes: 'Shell V-Power expressway pump',
        },
      });

      await prisma.expense.createMany({
        data: [
          {
            vehicleId: car.id,
            expenseDate: new Date('2024-09-12'),
            category: 'Fuel',
            amount: 4326,
            description: 'Fuel Fill-up: 42.0L @ ₹103/L',
            sourceType: 'FUEL',
            sourceId: fuel1.id,
          },
          {
            vehicleId: car.id,
            expenseDate: new Date('2024-10-01'),
            category: 'Fuel',
            amount: 3965.5,
            description: 'Fuel Fill-up: 38.5L @ ₹103/L',
            sourceType: 'FUEL',
            sourceId: fuel2.id,
          },
        ],
      });

      // Warranties for Car
      await prisma.warranty.create({
        data: {
          vehicleId: car.id,
          warrantyType: 'Vehicle Extended Warranty',
          provider: 'Hyundai Shield of Trust Super',
          coverageNotes: '5 Years / 1,00,000 km bumper-to-bumper manufacturer warranty',
          startDate: new Date('2023-03-10'),
          expiryDate: new Date('2028-03-09'),
          maxOdometer: 100000,
        },
      });

      // Tyre & Battery for Car
      await prisma.tyreBatteryRecord.createMany({
        data: [
          {
            vehicleId: car.id,
            itemType: 'TYRE',
            brand: 'JK Tyre',
            model: 'UX Royale 215/60 R17',
            position: 'Front Left',
            installedDate: new Date('2023-03-10'),
            installedOdometer: 0,
            replacementDueAgeMonths: 48,
            replacementDueKm: 50000,
            lastRotatedDate: new Date('2024-05-10'),
            lastAlignedDate: new Date('2024-05-10'),
            notes: 'OEM factory fitted tyres.',
          },
          {
            vehicleId: car.id,
            itemType: 'BATTERY',
            brand: 'Exide',
            model: 'Mileage DIN60',
            sizeOrSerial: 'EX-DIN60-98442',
            installedDate: new Date('2023-03-10'),
            installedOdometer: 0,
            replacementDueAgeMonths: 36,
            notes: 'Factory battery in engine compartment.',
          },
        ],
      });
    }

    // 2. Vehicle 2: Royal Enfield Meteor 350
    const bikeReg = 'KA01HK8102';
    let bike = await prisma.vehicle.findFirst({
      where: { userId, registrationNumber: bikeReg },
    });

    if (!bike) {
      bike = await prisma.vehicle.create({
        data: {
          userId,
          nickname: 'Meteor Cruiser',
          make: 'Royal Enfield',
          model: 'Meteor 350 Stellar Black',
          year: 2022,
          registrationNumber: bikeReg,
          vehicleType: 'Motorcycle',
          fuelType: 'Petrol',
          photo:
            'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
          currentOdometer: 9800,
          notes: 'Weekend cruiser and breakfast ride motorcycle.',
        },
      });

      await prisma.odometerReading.create({
        data: {
          vehicleId: bike.id,
          reading: 9800,
          readingDate: new Date(),
          source: 'MANUAL',
          notes: 'Current odometer',
        },
      });

      const bikeService = await prisma.serviceRecord.create({
        data: {
          vehicleId: bike.id,
          serviceDate: new Date('2024-03-18'),
          serviceType: 'Annual General Service',
          workshopName: 'Acclaim Motors Royal Enfield Service',
          description:
            'Liquid Gun semi-synthetic oil, spark plug clean, chain tensioning & lube.',
          partsReplaced: 'RE Liquid Gun 15W-50 (2.2L), Oil Filter, Chain Lube',
          cost: 2650,
          odometer: 8400,
          nextDueMonths: 6,
          nextDueKm: 5000,
        },
      });

      await prisma.expense.create({
        data: {
          vehicleId: bike.id,
          expenseDate: new Date('2024-03-18'),
          category: 'Service',
          amount: 2650,
          description: 'Annual General Service at Acclaim Motors Royal Enfield',
          sourceType: 'SERVICE',
          sourceId: bikeService.id,
        },
      });

      await prisma.insurancePolicy.create({
        data: {
          vehicleId: bike.id,
          insurer: 'ICICI Lombard General Insurance',
          policyNumber: 'ICICI-TW-5521990',
          coverType: 'Comprehensive Two Wheeler',
          premium: 3200,
          idv: 185000,
          startDate: new Date('2024-02-01'),
          expiryDate: new Date('2025-01-31'),
          isActive: true,
        },
      });
    }

    // 3. User Driving Licence
    const hasLicence = await prisma.drivingLicence.findUnique({ where: { userId } });
    if (!hasLicence) {
      const expLicence = new Date();
      expLicence.setFullYear(expLicence.getFullYear() + 8);
      await LicenceService.saveLicence(userId, {
        licenceNumber: 'KA01 20180019482',
        vehicleClasses: 'LMV, MCWG',
        issueDate: '2018-05-14',
        expiryDate: expLicence.toISOString().split('T')[0],
        issuingAuthority: 'RTO Bangalore Central (KA-01)',
        bloodGroup: 'O+ Positive',
      });
    }

    // 4. Care Schedules
    const careCount = await prisma.careSchedule.count({ where: { userId } });
    if (careCount === 0 && car && bike) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await prisma.careSchedule.createMany({
        data: [
          {
            userId,
            vehicleId: car.id,
            title: 'Sunday Foam Pressure Wash & Tyre Polish',
            careType: 'WASH',
            scheduledDate: tomorrow,
            recurrence: 'WEEKLY',
            notes: 'Use pH neutral car shampoo and microfibre drying towels.',
          },
          {
            userId,
            vehicleId: bike.id,
            title: 'Drive Chain Cleaning & Lube',
            careType: 'INSPECTION',
            scheduledDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
            recurrence: 'BIWEEKLY',
            notes: 'Clean with Motul chain cleaner and apply chain paste.',
          },
        ],
      });
    }

    // 5. Emergency Contacts
    const contactCount = await prisma.emergencyContact.count({ where: { userId } });
    if (contactCount === 0) {
      await prisma.emergencyContact.createMany({
        data: [
          {
            userId,
            name: 'Hyundai 24x7 Roadside Assistance',
            contactType: 'ROADSIDE_ASSISTANCE',
            phone: '1800 102 4645',
            altPhone: '0124 434 3937',
            policyOrAccountNo: 'RSA-HMC-99418',
            notes: 'Toll-free roadside recovery, puncture repair, and jumpstart.',
          },
          {
            userId,
            name: 'Vikram Sharma (Family / Primary Emergency)',
            contactType: 'PERSONAL',
            phone: '+91 98450 99881',
            notes: 'Brother - Koramangala resident.',
          },
        ],
      });
    }

    return { success: true, message: 'Demo garage data seeded successfully!' };
  }

  static async clearDemoData(userId: string) {
    // Delete vehicles belonging to user (cascades to all vehicle-owned records)
    await prisma.vehicle.deleteMany({ where: { userId } });
    await prisma.careSchedule.deleteMany({ where: { userId } });
    await prisma.emergencyContact.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.favouritePlace.deleteMany({ where: { userId } });

    return { success: true, message: 'Garage cleared successfully. Ready for fresh records.' };
  }
}

