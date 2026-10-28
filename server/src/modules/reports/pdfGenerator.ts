import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateVehicleReportPdf(data: any, res: Response) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  doc.pipe(res);

  const { vehicle, sections } = data;

  // Header Banner
  doc.rect(0, 0, doc.page.width, 80).fill('#0C0D10');

  // Title
  doc.fillColor('#FFD400').fontSize(24).font('Helvetica-Bold').text('MYVEEL', 40, 25);
  doc
    .fillColor('#F5F5F5')
    .fontSize(11)
    .font('Helvetica')
    .text('VEHICLE HISTORY & CARE DOSSIER', 160, 34);

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc
    .fillColor('#A0A5AF')
    .fontSize(9)
    .text(`Generated: ${dateStr}`, doc.page.width - 200, 36, { align: 'right', width: 160 });

  let y = 100;

  // VEHICLE PROFILE SUMMARY
  if (sections.profile) {
    doc.fillColor('#FFD400').fontSize(14).font('Helvetica-Bold').text('1. Vehicle Specification & Profile', 40, y);
    y += 20;

    // Draw card box
    doc.rect(40, y, doc.page.width - 80, 75).fillAndStroke('#14161B', '#292D35');

    doc.fillColor('#A0A5AF').fontSize(9).font('Helvetica');
    doc.text('Vehicle Nickname:', 55, y + 12);
    doc.text('Registration Number:', 55, y + 30);
    doc.text('Make & Model:', 55, y + 48);

    doc.fillColor('#F5F5F5').font('Helvetica-Bold');
    doc.text(vehicle.nickname, 170, y + 12);
    doc.text(vehicle.registrationNumber, 170, y + 30);
    doc.text(`${vehicle.make} ${vehicle.model} (${vehicle.year})`, 170, y + 48);

    doc.fillColor('#A0A5AF').font('Helvetica');
    doc.text('Vehicle Type:', 320, y + 12);
    doc.text('Fuel Type:', 320, y + 30);
    doc.text('Latest Odometer:', 320, y + 48);

    doc.fillColor('#F5F5F5').font('Helvetica-Bold');
    doc.text(vehicle.vehicleType || 'Car', 420, y + 12);
    doc.text(vehicle.fuelType || 'Petrol', 420, y + 30);
    doc.fillColor('#FFD400').text(`${vehicle.currentOdometer.toLocaleString()} km`, 420, y + 48);

    y += 95;
  }

  // SERVICE HISTORY
  if (sections.services && vehicle.serviceRecords?.length > 0) {
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 40;
    }
    doc.fillColor('#FFD400').fontSize(14).font('Helvetica-Bold').text('2. Service & Maintenance Log', 40, y);
    y += 20;

    // Table Header
    doc.rect(40, y, doc.page.width - 80, 20).fill('#1B1E24');
    doc.fillColor('#FFD400').fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 50, y + 5);
    doc.text('Service Type', 130, y + 5);
    doc.text('Workshop', 250, y + 5);
    doc.text('Odometer', 380, y + 5);
    doc.text('Cost', 470, y + 5, { align: 'right', width: 70 });
    y += 22;

    vehicle.serviceRecords.slice(0, 15).forEach((s: any, idx: number) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
      }
      const bg = idx % 2 === 0 ? '#101216' : '#14161B';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg);
      doc.fillColor('#F5F5F5').fontSize(8.5).font('Helvetica');
      doc.text(new Date(s.serviceDate).toISOString().split('T')[0], 50, y + 5);
      doc.text(s.serviceType, 130, y + 5, { width: 110, ellipsis: true });
      doc.text(s.workshopName, 250, y + 5, { width: 120, ellipsis: true });
      doc.text(`${s.odometer.toLocaleString()} km`, 380, y + 5);
      doc.fillColor('#FFD400').text(`₹${s.cost.toLocaleString()}`, 470, y + 5, { align: 'right', width: 70 });
      y += 20;
    });
    y += 20;
  }

  // INSURANCE POLICIES
  if (sections.insurance && vehicle.insurancePolicies?.length > 0) {
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 40;
    }
    doc.fillColor('#FFD400').fontSize(14).font('Helvetica-Bold').text('3. Insurance Policies & Coverage', 40, y);
    y += 20;

    doc.rect(40, y, doc.page.width - 80, 20).fill('#1B1E24');
    doc.fillColor('#FFD400').fontSize(9).font('Helvetica-Bold');
    doc.text('Insurer', 50, y + 5);
    doc.text('Policy No.', 160, y + 5);
    doc.text('Cover Type', 280, y + 5);
    doc.text('Valid Until', 390, y + 5);
    doc.text('Premium', 470, y + 5, { align: 'right', width: 70 });
    y += 22;

    vehicle.insurancePolicies.forEach((p: any, idx: number) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
      }
      const bg = idx % 2 === 0 ? '#101216' : '#14161B';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg);
      doc.fillColor('#F5F5F5').fontSize(8.5).font('Helvetica');
      doc.text(p.insurer, 50, y + 5);
      doc.text(p.policyNumber, 160, y + 5);
      doc.text(p.coverType, 280, y + 5);
      doc.text(new Date(p.expiryDate).toISOString().split('T')[0], 390, y + 5);
      doc.fillColor('#FFD400').text(`₹${p.premium.toLocaleString()}`, 470, y + 5, { align: 'right', width: 70 });
      y += 20;
    });
    y += 20;
  }

  // DOCUMENTS VAULT
  if (sections.documents && vehicle.documents?.length > 0) {
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 40;
    }
    doc.fillColor('#FFD400').fontSize(14).font('Helvetica-Bold').text('4. Regulatory Documents & Certificates', 40, y);
    y += 20;

    doc.rect(40, y, doc.page.width - 80, 20).fill('#1B1E24');
    doc.fillColor('#FFD400').fontSize(9).font('Helvetica-Bold');
    doc.text('Document Type', 50, y + 5);
    doc.text('Certificate / Doc No.', 170, y + 5);
    doc.text('Issue Date', 320, y + 5);
    doc.text('Expiry Date', 440, y + 5);
    y += 22;

    vehicle.documents.forEach((d: any, idx: number) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
      }
      const bg = idx % 2 === 0 ? '#101216' : '#14161B';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg);
      doc.fillColor('#F5F5F5').fontSize(8.5).font('Helvetica');
      doc.text(d.documentType, 50, y + 5);
      doc.text(d.documentNumber, 170, y + 5);
      doc.text(new Date(d.issueDate).toISOString().split('T')[0], 320, y + 5);
      doc.text(new Date(d.expiryDate).toISOString().split('T')[0], 440, y + 5);
      y += 20;
    });
    y += 20;
  }

  // ODOMETER TRENDS
  if (sections.odometer && vehicle.odometerReadings?.length > 0) {
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 40;
    }
    doc.fillColor('#FFD400').fontSize(14).font('Helvetica-Bold').text('5. Odometer Mileage Log', 40, y);
    y += 20;

    doc.rect(40, y, doc.page.width - 80, 20).fill('#1B1E24');
    doc.fillColor('#FFD400').fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 50, y + 5);
    doc.text('Reading (km)', 180, y + 5);
    doc.text('Source', 310, y + 5);
    doc.text('Notes / Correction', 420, y + 5);
    y += 22;

    vehicle.odometerReadings.slice(0, 10).forEach((o: any, idx: number) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
      }
      const bg = idx % 2 === 0 ? '#101216' : '#14161B';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg);
      doc.fillColor('#F5F5F5').fontSize(8.5).font('Helvetica');
      doc.text(new Date(o.readingDate).toISOString().split('T')[0], 50, y + 5);
      doc.fillColor('#FFD400').text(`${o.reading.toLocaleString()} km`, 180, y + 5);
      doc.fillColor('#A0A5AF').text(o.source, 310, y + 5);
      doc.text(o.isCorrection ? 'Correction confirmed' : o.notes || '-', 420, y + 5, {
        width: 130,
        ellipsis: true,
      });
      y += 20;
    });
    y += 20;
  }

  // FUEL & EXPENSES
  if (sections.expenses && vehicle.expenses?.length > 0) {
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 40;
    }
    const totalExpense = vehicle.expenses.reduce((s: number, e: any) => s + e.amount, 0);
    doc
      .fillColor('#FFD400')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`6. Garage Expense Record (Total: ₹${totalExpense.toLocaleString()})`, 40, y);
    y += 20;

    doc.rect(40, y, doc.page.width - 80, 20).fill('#1B1E24');
    doc.fillColor('#FFD400').fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 50, y + 5);
    doc.text('Category', 140, y + 5);
    doc.text('Description', 240, y + 5);
    doc.text('Amount', 470, y + 5, { align: 'right', width: 70 });
    y += 22;

    vehicle.expenses.slice(0, 15).forEach((e: any, idx: number) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 40;
      }
      const bg = idx % 2 === 0 ? '#101216' : '#14161B';
      doc.rect(40, y, doc.page.width - 80, 20).fill(bg);
      doc.fillColor('#F5F5F5').fontSize(8.5).font('Helvetica');
      doc.text(new Date(e.expenseDate).toISOString().split('T')[0], 50, y + 5);
      doc.text(e.category, 140, y + 5);
      doc.text(e.description, 240, y + 5, { width: 220, ellipsis: true });
      doc.fillColor('#FFD400').text(`₹${e.amount.toLocaleString()}`, 470, y + 5, { align: 'right', width: 70 });
      y += 20;
    });
  }

  // Footer Note
  const bottomY = doc.page.height - 35;
  doc.rect(40, bottomY - 5, doc.page.width - 80, 0.5).stroke('#292D35');
  doc
    .fillColor('#6B7280')
    .fontSize(7.5)
    .font('Helvetica')
    .text(
      'This report was generated securely by MyVeel Smart Garage Management System. All records are owner-certified.',
      40,
      bottomY,
      { align: 'center', width: doc.page.width - 80 }
    );

  doc.end();
}

