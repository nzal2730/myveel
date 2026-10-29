const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUserWith3Vehicles(accountEmail, accountMobile, accountName) {
  console.log(`\n======================================================`);
  console.log(`Seeding Account: ${accountEmail} (${accountName})`);
  console.log(`======================================================`);

  const passwordHash = await bcrypt.hash('123456', 10);

  let user = await prisma.user.findUnique({
    where: { email: accountEmail },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: accountName,
        passwordHash,
        role: 'USER',
        isEmailVerified: true,
        isMobileVerified: true,
        mobile: accountMobile,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: accountName,
        email: accountEmail,
        mobile: accountMobile,
        passwordHash,
        role: 'USER',
        isEmailVerified: true,
        isMobileVerified: true,
      },
    });
  }

  const userId = user.id;

  // 1. Settings
  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      emailAlerts: true,
      smsAlerts: false,
      distanceUnit: 'km',
      currency: '₹',
      reminderDaysBefore: '30,15,7',
    },
    update: {
      emailAlerts: true,
      distanceUnit: 'km',
      currency: '₹',
      reminderDaysBefore: '30,15,7',
    },
  });

  // 2. Driving Licence
  await prisma.drivingLicence.upsert({
    where: { userId },
    create: {
      userId,
      licenceNumberEncrypted: 'DL-0420180054321',
      vehicleClasses: 'MCWG, LMV',
      issueDate: new Date('2018-05-15'),
      expiryDate: new Date('2038-05-14'),
      issuingAuthority: 'RTO Koramangala, Bengaluru',
      bloodGroup: 'O+',
    },
    update: {
      licenceNumberEncrypted: 'DL-0420180054321',
      vehicleClasses: 'MCWG, LMV',
      issueDate: new Date('2018-05-15'),
      expiryDate: new Date('2038-05-14'),
      issuingAuthority: 'RTO Koramangala, Bengaluru',
      bloodGroup: 'O+',
    },
  });

  // 3. Emergency Contacts
  await prisma.emergencyContact.deleteMany({ where: { userId } });
  await prisma.emergencyContact.createMany({
    data: [
      {
        userId,
        name: 'Sarah Carter (Family)',
        contactType: 'PERSONAL',
        phone: '+91 98765 00002',
        notes: 'Primary emergency contact',
      },
      {
        userId,
        name: 'Allianz Global Roadside Assist',
        contactType: 'ROADSIDE_ASSISTANCE',
        phone: '1800-102-4444',
        policyOrAccountNo: 'ALL-RSA-99214',
        notes: '24/7 Nationwide flatbed towing and puncture assistance',
      },
      {
        userId,
        name: 'Bengaluru 24x7 Recovery Towing',
        contactType: 'TOWING',
        phone: '+91 98450 11223',
        notes: 'Local heavy duty tow truck service',
      },
    ],
  });

  // 4. Favourite Places
  await prisma.favouritePlace.deleteMany({ where: { userId } });
  await prisma.favouritePlace.createMany({
    data: [
      {
        userId,
        name: 'Advaith Hyundai Authorized Center',
        category: 'SERVICE_CENTRE',
        address: 'Outer Ring Road, Marathahalli, Bengaluru, Karnataka 560037',
        latitude: 12.9562,
        longitude: 77.7019,
        phone: '+91 80 4356 7890',
        rating: 4.8,
        notes: 'Preferred advisor: Ramesh Kumar',
      },
      {
        userId,
        name: "King's Royal Enfield Workshop",
        category: 'GARAGE',
        address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
        latitude: 12.9719,
        longitude: 77.6412,
        phone: '+91 80 2520 1199',
        rating: 4.7,
        notes: 'Expert in Meteor 350 and Classic tuning',
      },
      {
        userId,
        name: 'Tata Power EZ Charge 60kW DC',
        category: 'EV_CHARGER',
        address: 'ITPL Main Road, Whitefield, Bengaluru 560066',
        latitude: 12.9868,
        longitude: 77.7378,
        phone: '1800-209-5161',
        rating: 4.6,
        notes: 'Dual CCS2 guns, open 24 hours with cafe',
      },
      {
        userId,
        name: 'Shell Fuel & V-Power Station',
        category: 'FUEL_STATION',
        address: 'Bellandur Junction, Sarjapur Outer Ring Rd, Bengaluru 560103',
        latitude: 12.9287,
        longitude: 77.6744,
        phone: '+91 80 6712 3400',
        rating: 4.9,
        notes: 'Clean restrooms, nitrogen air top-up, high octane fuel',
      },
      {
        userId,
        name: '3M Car Care & Ceramic Studio',
        category: 'CAR_WASH',
        address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru 560102',
        latitude: 12.9116,
        longitude: 77.6534,
        phone: '+91 80 2258 7766',
        rating: 4.9,
        notes: 'Foam wash, underbody rust protection, interior steam',
      },
    ],
  });

  // Clean old vehicles
  await prisma.vehicle.deleteMany({ where: { userId } });

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // VEHICLE 1: Hyundai Creta
  const v1 = await prisma.vehicle.create({
    data: {
      userId,
      nickname: 'Creta Stealth',
      make: 'Hyundai',
      model: 'Creta SX(O) Turbo DCT',
      year: 2023,
      registrationNumber: 'KA01MJ4582',
      vehicleType: 'SUV',
      fuelType: 'Petrol',
      currentOdometer: 18450,
      photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      notes: '1.5L Turbo GDi 7-speed DCT. Abyss Black Pearl. Daily commuter and highway tourer.',
    },
  });

  await prisma.odometerReading.createMany({
    data: [
      { vehicleId: v1.id, reading: 45, readingDate: new Date('2023-03-10'), source: 'MANUAL', notes: 'Vehicle Delivery' },
      { vehicleId: v1.id, reading: 5200, readingDate: new Date('2023-09-15'), source: 'MANUAL', notes: 'Goa road trip check' },
      { vehicleId: v1.id, reading: 10400, readingDate: new Date('2024-03-20'), source: 'SERVICE', notes: '10,000 km Annual Service' },
      { vehicleId: v1.id, reading: 15300, readingDate: new Date('2024-09-05'), source: 'FUEL', notes: 'Full tank fill-up' },
      { vehicleId: v1.id, reading: 18450, readingDate: new Date(now.getTime() - 2 * dayMs), source: 'MANUAL', notes: 'Current odometer' },
    ],
  });

  const v1Service = await prisma.serviceRecord.create({
    data: {
      vehicleId: v1.id,
      serviceDate: new Date('2024-03-20'),
      serviceType: 'Oil Change',
      workshopName: 'Advaith Hyundai Outer Ring Road',
      description: '10,000 km scheduled periodic maintenance. Engine oil replacement with Shell Helix Ultra 5W-30, oil filter change, AC cabin filter replacement, and 4-wheel brake inspection.',
      partsReplaced: 'Synthetic Engine Oil (3.8L), Hyundai Genuine Oil Filter, AC Pollen Filter, Washer Fluid',
      cost: 6450,
      odometer: 10400,
      nextDueKm: 20000,
      nextDueMonths: 12,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v1.id,
      expenseDate: new Date('2024-03-20'),
      category: 'Service',
      amount: 6450,
      description: '10,000 km Scheduled Service - Advaith Hyundai',
      sourceType: 'SERVICE',
      sourceId: v1Service.id,
    },
  });

  await prisma.serviceReminder.create({
    data: {
      vehicleId: v1.id,
      title: '20,000 km Annual Major Service',
      serviceType: 'Major Service',
      dueDate: new Date(now.getTime() + 35 * dayMs),
      dueOdometer: 20000,
      isCompleted: false,
      notes: 'Brake fluid flush, spark plug inspection, wheel alignment & balancing.',
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vehicleId: v1.id,
        documentType: 'RC',
        documentNumber: 'KA01MJ4582RC9901',
        issueDate: new Date('2023-03-15'),
        expiryDate: new Date('2038-03-14'),
        notes: 'Smart Card Registration Certificate - RTO Bangalore Central',
      },
      {
        vehicleId: v1.id,
        documentType: 'PUC',
        documentNumber: 'KA-01-2024-PUC-4491',
        issueDate: new Date(now.getTime() - 170 * dayMs),
        expiryDate: new Date(now.getTime() + 10 * dayMs),
        notes: 'BS6 Petrol Emission Test Certificate - Clean emission',
      },
    ],
  });

  const v1Insurance = await prisma.insurancePolicy.create({
    data: {
      vehicleId: v1.id,
      insurer: 'HDFC ERGO General Insurance',
      policyNumber: 'HDFC-MOT-2023-889140',
      coverType: 'Zero Depreciation',
      premium: 28450,
      idv: 1480000,
      startDate: new Date(now.getTime() - 344 * dayMs),
      expiryDate: new Date(now.getTime() + 21 * dayMs),
      isActive: true,
      notes: 'Includes Zero Dep, Engine Protector, Consumables Cover, and 24x7 Roadside Assistance.',
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v1.id,
      expenseDate: new Date(now.getTime() - 344 * dayMs),
      category: 'Insurance',
      amount: 28450,
      description: 'HDFC ERGO Zero-Dep Comprehensive Insurance Renewal',
      sourceType: 'INSURANCE',
      sourceId: v1Insurance.id,
    },
  });

  await prisma.tyreBatteryRecord.createMany({
    data: [
      {
        vehicleId: v1.id,
        itemType: 'TYRE',
        brand: 'Goodyear',
        model: 'Assurance TripleMax 2',
        position: 'All 4 Wheels',
        sizeOrSerial: '215/60 R17 96H',
        installedDate: new Date('2023-03-10'),
        installedOdometer: 45,
        replacementDueKm: 50000,
        replacementDueAgeMonths: 48,
        lastRotatedDate: new Date('2024-03-20'),
        lastAlignedDate: new Date('2024-03-20'),
        notes: 'OEM tyres, healthy tread depth (6.2mm remaining).',
      },
      {
        vehicleId: v1.id,
        itemType: 'BATTERY',
        brand: 'Amaron',
        model: 'Pro DIN60',
        position: 'Engine Compartment',
        sizeOrSerial: 'A-PRO-DIN60-2023',
        installedDate: new Date('2023-03-10'),
        installedOdometer: 45,
        replacementDueAgeMonths: 48,
        notes: '12V 60Ah maintenance free, 48-month warranty.',
      },
    ],
  });

  const v1FuelLogs = [
    { logDate: new Date(now.getTime() - 25 * dayMs), quantity: 42.5, totalCost: 4369, pricePerUnit: 102.8, odometer: 17200, isFullTank: true, calculatedEfficiency: null },
    { logDate: new Date(now.getTime() - 17 * dayMs), quantity: 30.2, totalCost: 3105, pricePerUnit: 102.8, odometer: 17650, isFullTank: true, calculatedEfficiency: 14.9 },
    { logDate: new Date(now.getTime() - 9 * dayMs), quantity: 30.0, totalCost: 3087, pricePerUnit: 102.9, odometer: 18100, isFullTank: true, calculatedEfficiency: 15.0 },
    { logDate: new Date(now.getTime() - 2 * dayMs), quantity: 24.1, totalCost: 2485, pricePerUnit: 103.1, odometer: 18450, isFullTank: true, calculatedEfficiency: 14.5 },
  ];

  for (const fl of v1FuelLogs) {
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: v1.id,
        fuelType: 'Petrol',
        ...fl,
        notes: 'Shell V-Power Petrol',
      },
    });
    await prisma.expense.create({
      data: {
        vehicleId: v1.id,
        expenseDate: fl.logDate,
        category: 'Fuel',
        amount: fl.totalCost,
        description: `Shell Petrol Fill-up (${fl.quantity}L @ ₹${fl.pricePerUnit})`,
        sourceType: 'FUEL',
        sourceId: log.id,
      },
    });
  }

  await prisma.careSchedule.create({
    data: {
      userId,
      vehicleId: v1.id,
      title: 'Exterior Foam Wash & Glass Rain-X Treatment',
      careType: 'WASH',
      scheduledDate: new Date(now.getTime() + 3 * dayMs),
      recurrence: 'BIWEEKLY',
      notes: 'Full body high-pressure wash, wheel grime removal, and windshield hydrophobic coating.',
    },
  });

  // VEHICLE 2: Royal Enfield Meteor 350
  const v2 = await prisma.vehicle.create({
    data: {
      userId,
      nickname: 'Meteor Cruiser',
      make: 'Royal Enfield',
      model: 'Meteor 350 Stellar Black',
      year: 2022,
      registrationNumber: 'KA05EL7731',
      vehicleType: 'Motorcycle',
      fuelType: 'Petrol',
      currentOdometer: 9820,
      photo: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      notes: '349cc air-oil cooled single cylinder. Fitted with touring screen, sump guard, and touring rider seat.',
    },
  });

  await prisma.odometerReading.createMany({
    data: [
      { vehicleId: v2.id, reading: 18, readingDate: new Date('2022-08-10'), source: 'MANUAL', notes: 'Showroom Delivery' },
      { vehicleId: v2.id, reading: 4850, readingDate: new Date('2023-08-12'), source: 'SERVICE', notes: 'Periodic Service' },
      { vehicleId: v2.id, reading: 7900, readingDate: new Date('2024-05-10'), source: 'MANUAL', notes: 'Mysore trip' },
      { vehicleId: v2.id, reading: 9820, readingDate: new Date(now.getTime() - 4 * dayMs), source: 'FUEL', notes: 'Latest petrol fill' },
    ],
  });

  const v2Service = await prisma.serviceRecord.create({
    data: {
      vehicleId: v2.id,
      serviceDate: new Date('2023-08-12'),
      serviceType: 'General Service',
      workshopName: "King's Royal Enfield Workshop",
      description: '5,000 km periodic service. Engine oil flushed and refilled with Motul 7100 15W-50 100% Synthetic, oil filter change, spark plug cleaned, drive chain cleaned & lubed, clutch free play adjusted.',
      partsReplaced: 'Motul 7100 15W-50 (2.1L), RE Genuine Oil Filter, Chain Lube',
      cost: 2950,
      odometer: 4850,
      nextDueKm: 10000,
      nextDueMonths: 12,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v2.id,
      expenseDate: new Date('2023-08-12'),
      category: 'Service',
      amount: 2950,
      description: '5,000 km Periodic Service - King\'s Royal Enfield',
      sourceType: 'SERVICE',
      sourceId: v2Service.id,
    },
  });

  await prisma.serviceReminder.create({
    data: {
      vehicleId: v2.id,
      title: '10,000 km Major Service & Valve Clearance',
      serviceType: 'Major Service',
      dueDate: new Date(now.getTime() + 14 * dayMs),
      dueOdometer: 10000,
      isCompleted: false,
      notes: 'Engine oil change, air filter replacement, tappet inspection, brake pad thickness check.',
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vehicleId: v2.id,
        documentType: 'RC',
        documentNumber: 'KA05EL7731RC442',
        issueDate: new Date('2022-08-12'),
        expiryDate: new Date('2037-08-11'),
        notes: 'Smart Card Registration Certificate - RTO Bangalore South',
      },
      {
        vehicleId: v2.id,
        documentType: 'PUC',
        documentNumber: 'KA-05-2024-PUC-8819',
        issueDate: new Date(now.getTime() - 60 * dayMs),
        expiryDate: new Date(now.getTime() + 120 * dayMs),
        notes: 'Valid 2-Wheeler Emission Test Certificate',
      },
    ],
  });

  const v2Insurance = await prisma.insurancePolicy.create({
    data: {
      vehicleId: v2.id,
      insurer: 'ICICI Lombard General Insurance',
      policyNumber: 'ICICI-2W-984210',
      coverType: 'Comprehensive',
      premium: 3850,
      idv: 185000,
      startDate: new Date(now.getTime() - 200 * dayMs),
      expiryDate: new Date(now.getTime() + 165 * dayMs),
      isActive: true,
      notes: 'Includes Own Damage + 5 Years Third Party Liability Cover.',
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v2.id,
      expenseDate: new Date(now.getTime() - 200 * dayMs),
      category: 'Insurance',
      amount: 3850,
      description: 'ICICI Lombard Two-Wheeler Comprehensive Policy',
      sourceType: 'INSURANCE',
      sourceId: v2Insurance.id,
    },
  });

  await prisma.tyreBatteryRecord.createMany({
    data: [
      {
        vehicleId: v2.id,
        itemType: 'TYRE',
        brand: 'CEAT',
        model: 'Zoom Plus Tubeless',
        position: 'Front & Rear',
        sizeOrSerial: '100/90-19 F | 140/70-17 R',
        installedDate: new Date('2022-08-10'),
        installedOdometer: 18,
        replacementDueKm: 30000,
        replacementDueAgeMonths: 48,
        notes: 'Good condition, no punctures.',
      },
      {
        vehicleId: v2.id,
        itemType: 'BATTERY',
        brand: 'Exide',
        model: 'Xplore 12V 8Ah VRLA',
        position: 'Under Seat',
        sizeOrSerial: 'EX-XP-12V8AH',
        installedDate: new Date('2022-08-10'),
        installedOdometer: 18,
        replacementDueAgeMonths: 36,
        notes: '12V 8Ah maintenance free motorcycle battery.',
      },
    ],
  });

  const v2FuelLogs = [
    { logDate: new Date(now.getTime() - 28 * dayMs), quantity: 12.0, totalCost: 1230, pricePerUnit: 102.5, odometer: 9150, isFullTank: true, calculatedEfficiency: null },
    { logDate: new Date(now.getTime() - 15 * dayMs), quantity: 10.0, totalCost: 1026, pricePerUnit: 102.6, odometer: 9510, isFullTank: true, calculatedEfficiency: 36.0 },
    { logDate: new Date(now.getTime() - 4 * dayMs), quantity: 8.6, totalCost: 884, pricePerUnit: 102.8, odometer: 9820, isFullTank: true, calculatedEfficiency: 36.0 },
  ];

  for (const fl of v2FuelLogs) {
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: v2.id,
        fuelType: 'Petrol',
        ...fl,
        notes: 'Shell Regular Petrol',
      },
    });
    await prisma.expense.create({
      data: {
        vehicleId: v2.id,
        expenseDate: fl.logDate,
        category: 'Fuel',
        amount: fl.totalCost,
        description: `Motorcycle Fuel Fill (${fl.quantity}L @ ₹${fl.pricePerUnit})`,
        sourceType: 'FUEL',
        sourceId: log.id,
      },
    });
  }

  await prisma.careSchedule.create({
    data: {
      userId,
      vehicleId: v2.id,
      title: 'Drive Chain Cleaning, Lubrication & Tension Adjustment',
      careType: 'INSPECTION',
      scheduledDate: new Date(now.getTime() + 4 * dayMs),
      recurrence: 'BIWEEKLY',
      notes: 'Clean chain with Motul Chain Clean brush, dry, and apply Motul C2 Road Chain Lube.',
    },
  });

  // VEHICLE 3: Tata Nexon EV
  const v3 = await prisma.vehicle.create({
    data: {
      userId,
      nickname: 'Volt Runner',
      make: 'Tata',
      model: 'Nexon EV Empowered+ Long Range',
      year: 2024,
      registrationNumber: 'KA03EV8844',
      vehicleType: 'Electric',
      fuelType: 'Electric',
      currentOdometer: 12400,
      photo: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      notes: '40.5 kWh LFP High Energy Density battery pack. Pristine White with Black Roof. ARAI certified range 465 km.',
    },
  });

  await prisma.odometerReading.createMany({
    data: [
      { vehicleId: v3.id, reading: 32, readingDate: new Date('2024-01-15'), source: 'MANUAL', notes: 'Delivery inspection' },
      { vehicleId: v3.id, reading: 6200, readingDate: new Date('2024-06-10'), source: 'SERVICE', notes: 'First Service at 7,500 km mark' },
      { vehicleId: v3.id, reading: 12400, readingDate: new Date(now.getTime() - 1 * dayMs), source: 'FUEL', notes: 'DC Fast charging session' },
    ],
  });

  await prisma.warranty.createMany({
    data: [
      {
        vehicleId: v3.id,
        warrantyType: 'Battery',
        provider: 'Tata Motors Passenger Vehicles Ltd',
        coverageNotes: '8 Years or 1,60,000 km High Voltage LFP Battery Pack & Electric Motor Warranty. Minimum 70% state-of-health guarantee.',
        startDate: new Date('2024-01-15'),
        expiryDate: new Date('2032-01-14'),
        maxOdometer: 160000,
      },
      {
        vehicleId: v3.id,
        warrantyType: 'Vehicle',
        provider: 'Tata Motors Ltd',
        coverageNotes: '3 Years / 1,25,000 km standard manufacturer bumper-to-bumper vehicle warranty.',
        startDate: new Date('2024-01-15'),
        expiryDate: new Date('2027-01-14'),
        maxOdometer: 125000,
      },
    ],
  });

  const v3Service = await prisma.serviceRecord.create({
    data: {
      vehicleId: v3.id,
      serviceDate: new Date('2024-06-10'),
      serviceType: 'Inspection',
      workshopName: 'KHT Motors Tata Authorized Service Center',
      description: '7,500 km Periodic EV Inspection. High-voltage battery pack diagnostics, motor coolant loop check, transaxle reduction gear oil level inspection, and telematics firmware OTA update.',
      partsReplaced: 'Cabin HEPA Filter, Windshield Washer Fluid',
      cost: 1450,
      odometer: 6200,
      nextDueKm: 15000,
      nextDueMonths: 12,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v3.id,
      expenseDate: new Date('2024-06-10'),
      category: 'Service',
      amount: 1450,
      description: '7,500 km Periodic EV Inspection - KHT Motors',
      sourceType: 'SERVICE',
      sourceId: v3Service.id,
    },
  });

  await prisma.serviceReminder.create({
    data: {
      vehicleId: v3.id,
      title: '15,000 km EV Annual Diagnostic & Brake Fluid Flush',
      serviceType: 'General Service',
      dueDate: new Date(now.getTime() + 60 * dayMs),
      dueOdometer: 15000,
      isCompleted: false,
      notes: 'Brake fluid DOT4 moisture test, battery health cell balancing report, tire rotation.',
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vehicleId: v3.id,
        documentType: 'RC',
        documentNumber: 'KA03EV8844RC112',
        issueDate: new Date('2024-01-18'),
        expiryDate: new Date('2039-01-17'),
        notes: 'Smart Card Registration Certificate - Electric Vehicle (Green Plate)',
      },
      {
        vehicleId: v3.id,
        documentType: 'OTHER',
        documentNumber: 'EV-GREEN-EXEMPT-8844',
        issueDate: new Date('2024-01-18'),
        expiryDate: new Date('2039-01-17'),
        notes: 'Electric Vehicle Zero Emission Certificate & Lifetime Road Tax Exemption',
      },
    ],
  });

  const v3Insurance = await prisma.insurancePolicy.create({
    data: {
      vehicleId: v3.id,
      insurer: 'Tata AIG General Insurance',
      policyNumber: 'TATA-EV-2024-441092',
      coverType: 'Zero Depreciation',
      premium: 32100,
      idv: 1820000,
      startDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-14'),
      isActive: true,
      notes: 'Electric Vehicle Zero-Dep policy with Battery Protection, Wallbox Charger Coverage, and Roadside EV Towing to nearest charger.',
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v3.id,
      expenseDate: new Date('2024-01-15'),
      category: 'Insurance',
      amount: 32100,
      description: 'Tata AIG EV Zero-Dep Comprehensive Insurance',
      sourceType: 'INSURANCE',
      sourceId: v3Insurance.id,
    },
  });

  await prisma.tyreBatteryRecord.createMany({
    data: [
      {
        vehicleId: v3.id,
        itemType: 'TYRE',
        brand: 'MRF',
        model: 'Wanderer EV Low Rolling Resistance',
        position: 'All 4 Wheels',
        sizeOrSerial: '215/60 R16 95H',
        installedDate: new Date('2024-01-15'),
        installedOdometer: 32,
        replacementDueKm: 50000,
        replacementDueAgeMonths: 48,
        notes: 'EV compound with acoustic foam layer for low cabin road noise.',
      },
      {
        vehicleId: v3.id,
        itemType: 'BATTERY',
        brand: 'Tata AutoComp / Gotion LFP',
        model: '40.5 kWh Liquid-Cooled LFP High Voltage Pack',
        position: 'Underbody Skateboard',
        sizeOrSerial: 'NEXON-LFP-40.5-2024-991',
        installedDate: new Date('2024-01-15'),
        installedOdometer: 32,
        replacementDueAgeMonths: 96,
        replacementDueKm: 160000,
        notes: 'IP67 rated, state of health 99.4%, liquid thermal management system.',
      },
      {
        vehicleId: v3.id,
        itemType: 'BATTERY',
        brand: 'Exide',
        model: 'Matrix 12V 45Ah Auxiliary',
        position: 'Engine Bay',
        sizeOrSerial: 'EX-12V45AH-AUX',
        installedDate: new Date('2024-01-15'),
        installedOdometer: 32,
        replacementDueAgeMonths: 48,
        notes: '12V low-voltage auxiliary battery powering lighting, ECUs and screens.',
      },
    ],
  });

  const v3ChargingSessions = [
    { logDate: new Date(now.getTime() - 20 * dayMs), quantity: 30.0, totalCost: 555, pricePerUnit: 18.5, odometer: 11600, isFullTank: true, calculatedEfficiency: null },
    { logDate: new Date(now.getTime() - 11 * dayMs), quantity: 32.0, totalCost: 592, pricePerUnit: 18.5, odometer: 12020, isFullTank: true, calculatedEfficiency: 13.1 },
    { logDate: new Date(now.getTime() - 1 * dayMs), quantity: 28.0, totalCost: 532, pricePerUnit: 19.0, odometer: 12400, isFullTank: true, calculatedEfficiency: 13.5 },
  ];

  for (const cs of v3ChargingSessions) {
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: v3.id,
        fuelType: 'Electricity',
        ...cs,
        notes: 'Tata Power EZ Charge 60kW DC Fast Charging',
      },
    });
    await prisma.expense.create({
      data: {
        vehicleId: v3.id,
        expenseDate: cs.logDate,
        category: 'Fuel',
        amount: cs.totalCost,
        description: `EV DC Fast Charge (${cs.quantity} kWh @ ₹${cs.pricePerUnit}/kWh)`,
        sourceType: 'FUEL',
        sourceId: log.id,
      },
    });
  }

  await prisma.careSchedule.create({
    data: {
      userId,
      vehicleId: v3.id,
      title: 'Interior Deep Vacuum & Leatherette Conditioning',
      careType: 'INTERIOR_CLEAN',
      scheduledDate: new Date(now.getTime() + 10 * dayMs),
      recurrence: 'MONTHLY',
      notes: 'Clean ventilated seats, wipe dual 10.25-inch screens with microfiber, clean AC vents.',
    },
  });

  // Notifications
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.notification.createMany({
    data: [
      {
        userId,
        vehicleId: v1.id,
        title: 'PUC Expiry Notice: Creta Stealth',
        message: 'Pollution Under Control (PUC) certificate expires in 10 days. Get it renewed at an authorized emission center.',
        category: 'DOCUMENT',
        priority: 'WARNING',
        dedupeKey: `DOC_PUC_${v1.id}_EXP_WARNING`,
        linkUrl: '/documents',
      },
      {
        userId,
        vehicleId: v1.id,
        title: 'Insurance Renewal: Creta Stealth',
        message: 'HDFC ERGO Zero Depreciation policy expires in 21 days. Review quotes and renew to ensure continuous coverage.',
        category: 'INSURANCE',
        priority: 'WARNING',
        dedupeKey: `INS_POLICY_${v1.id}_EXP_WARNING`,
        linkUrl: '/insurance',
      },
      {
        userId,
        vehicleId: v2.id,
        title: 'Service Approaching: Meteor Cruiser',
        message: '10,000 km Major Service is due in 180 km. Book an appointment with King\'s Royal Enfield Workshop.',
        category: 'SERVICE',
        priority: 'URGENT',
        dedupeKey: `SRV_DUE_${v2.id}_10K`,
        linkUrl: '/services',
      },
      {
        userId,
        vehicleId: v3.id,
        title: 'Battery Warranty Active: Volt Runner',
        message: '8-Year / 1,60,000 km High Voltage LFP Battery Warranty is active and healthy.',
        category: 'WARRANTY',
        priority: 'INFO',
        dedupeKey: `WAR_ACTIVE_${v3.id}`,
        linkUrl: '/warranty',
      },
    ],
  });

  console.log(`Seeded user: ${accountEmail} with 3 vehicles successfully!`);
}

async function main() {
  await seedUserWith3Vehicles('user@myveel.com', '9876500001', 'Alex Carter');
  await seedUserWith3Vehicles('demouser@myveel.com', '9876500002', 'Demo User');
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
