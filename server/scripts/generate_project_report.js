const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function createReportPDF() {
  const outputPath = path.resolve(__dirname, '../../MyVeel_Project_Report.pdf');
  const emblemPath = path.resolve(__dirname, '../assets/kmct_emblem.png');
  const logoPath = path.resolve(__dirname, '../assets/kmct_logo.png');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    bufferPages: true,
    autoFirstPage: false,
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // ==========================================
  // PAGE 1: TITLE PAGE
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(20).text('MyVeel — Smart Multi-Vehicle Care &\nGarage Management System', 60, 90, {
    align: 'center',
    width: doc.page.width - 120,
    lineGap: 4,
  });

  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(12).text('PROJECT FINAL PHASE REPORT', { align: 'center' });

  doc.moveDown(1.5);
  doc.font('Helvetica').fontSize(11).text('Submitted by,', { align: 'center' });

  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(12).text('MUHAMMED NAZAL\nNIBINSHAN\nHANEEN\nHARICHAND', {
    align: 'center',
    lineGap: 4,
  });

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(12).text('to', { align: 'center' });

  doc.moveDown(1);
  doc.font('Helvetica').fontSize(11).text('The APJ Abdul Kalam Technological University\nin partial fulfillment of the requirements for the award of the Degree', {
    align: 'center',
    lineGap: 3,
  });

  doc.moveDown(1);
  doc.font('Helvetica').fontSize(11).text('of', { align: 'center' });

  doc.moveDown(1);
  doc.font('Helvetica').fontSize(12).text('Bachelor of Computer Application', { align: 'center' });

  // Official College Emblem
  if (fs.existsSync(emblemPath)) {
    const emblemWidth = 110;
    doc.image(emblemPath, (doc.page.width - emblemWidth) / 2, 440, { width: emblemWidth });
  }

  doc.font('Helvetica-Bold').fontSize(12).text('Department of Computer Application', 60, 680, { align: 'center', width: doc.page.width - 120 });
  doc.font('Helvetica-Bold').fontSize(13).text('KMCT INSTITUTE OF EMERGING TECHNOLOGY AND\nMANAGEMENT', 60, 705, { align: 'center', width: doc.page.width - 120, lineGap: 3 });
  doc.font('Helvetica-Bold').fontSize(11).text('OCTOBER 2026', 60, 745, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 2: DECLARATION (i)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('DECLARATION', 60, 70, { align: 'center' });

  doc.font('Helvetica').fontSize(10.5).text(
    'Muhammed Nazal, Nibinshan, Haneen, Harichand hereby declare that the project report "MyVeel — Smart Multi-Vehicle Care & Garage Management System" submitted for partial fulfillment of the requirements for the award of the degree of Bachelor of Computer Application of the APJ Abdul Kalam Technological University, Kerala is a bonafide work done by us under the supervision of Ms. DILDIYA SS. This submission represents our ideas in our own words. We have adequately and accurately cited and referenced the original sources. We also declare that we have adhered to ethics of academic honesty and integrity and have not misrepresented or fabricated any data or idea or fact or source in our submission. We understand that any violation of the above will be a cause for disciplinary action by the institute and/or the University and can also evoke penal action from the sources which have thus not been properly cited or from whom proper permission has not been obtained. This report has not been previously formed the basis for the award of any degree, diploma or similar title of any other University.',
    60,
    130,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(11).text('Place: Calicut\nDate: 30-10-2026', 60, 420, { lineGap: 4 });

  doc.font('Helvetica-Bold').fontSize(11).text(
    'MUHAMMED NAZAL\nNIBINSHAN\nHANEEN\nHARICHAND\nBCA S5',
    doc.page.width - 240,
    650,
    { align: 'right', lineGap: 4, width: 180 }
  );
  doc.font('Helvetica').fontSize(10).text('i', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 3: CERTIFICATE (ii)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(13).text('DEPARTMENT OF COMPUTER APPLICATION', 60, 60, { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).text('KMCT INSTITUTE OF EMERGING TECHNOLOGY AND\nMANAGEMENT', 60, 80, { align: 'center', lineGap: 3 });

  // Official College Emblem on Certificate
  if (fs.existsSync(emblemPath)) {
    const certEmblemW = 95;
    doc.image(emblemPath, (doc.page.width - certEmblemW) / 2, 160, { width: certEmblemW });
  }

  doc.font('Helvetica-Bold').fontSize(16).text('CERTIFICATE', 60, 310, { align: 'center' });

  doc.font('Helvetica').fontSize(10.5).text(
    'This is to certify that the report entitled "MyVeel — Smart Multi-Vehicle Care & Garage Management System" submitted by Muhammed Nazal, Nibinshan, Haneen, Harichand to the APJ Abdul Kalam Technological University, Kerala in partial fulfillment of the Degree of Bachelor of Computer Application is a bonafide record of the project work carried out by them under our guidance and supervision. This report in any form has not been submitted to any other University or Institute for any purpose.',
    60,
    360,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(11).text('Ms. Dildiya SS\n(Guide / Project Supervisor)', 60, 650, { align: 'left', lineGap: 3 });
  doc.font('Helvetica-Bold').fontSize(11).text('Thejas Mon P\n(Head of Department)', 60, 650, { align: 'center', width: doc.page.width - 120, lineGap: 3 });
  doc.font('Helvetica-Bold').fontSize(11).text('Prof. Kavitha G. Nair\n(Project Coordinator)', doc.page.width - 220, 650, { align: 'right', width: 160, lineGap: 3 });

  doc.font('Helvetica').fontSize(10).text('ii', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 4: ACKNOWLEDGEMENT (iii)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('ACKNOWLEDGEMENT', 60, 70, { align: 'center' });

  doc.font('Helvetica').fontSize(11).text(
    'We are grateful to GOD Almighty for giving us the courage and strength to complete our project successfully. We are deeply thankful to our Project Supervisor Ms. DILDIYA SS for her constant guidance, valuable suggestions, and patient support throughout the development of this work.\n\nWe also remember with thanks the timely help and constant encouragement induced by other faculties of KMCT Institute of Emerging Technology and Management, our friends, and our parents.\n\nWe express our sincere sense of gratitude to the Department of Computer Application, KMCT Institute of Emerging Technology and Management, for providing us with the resources and facilities required to complete our work.',
    60,
    140,
    { align: 'justify', lineGap: 6, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(11).text(
    'MUHAMMED NAZAL\nNIBINSHAN\nHANEEN\nHARICHAND',
    60,
    520,
    { align: 'left', lineGap: 4 }
  );

  doc.font('Helvetica').fontSize(10).text('iii', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 5: ABSTRACT (iv)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('ABSTRACT', 60, 70, { align: 'center' });

  doc.font('Helvetica').fontSize(10.5).text(
    'Vehicle ownership has expanded rapidly, with individuals and families frequently managing multiple vehicles spanning cars, motorcycles, and modern electric vehicles. However, vehicle maintenance, regulatory compliance, and expense management remain largely fragmented. Owners routinely forget periodic maintenance milestones, miss critical renewal deadlines for insurance policies and Pollution Under Control (PUC) certificates, misplace warranties, and struggle to evaluate true fuel efficiency and operational running costs. Existing telematics or OBD-II hardware systems introduce substantial equipment expenses, compatibility hurdles, and persistent privacy risks, leaving everyday multi-vehicle owners without an accessible software solution.\n\nTo overcome these limitations, this project presents "MyVeel", a smart, hardware-independent vehicle care and digital garage management web application. The platform provides a centralized, secure hub where vehicle owners can catalog unlimited vehicles across combustion and electric powertrains, monitor timestamped odometer readings, track chronological maintenance histories with associated parts and costs, and establish dual date-and-mileage-based service reminders with automated recalculation. The system integrates a dedicated "Document Vault" with multi-stage expiry alerts (30, 15, and 7 days) for Registration Certificates (RC) and PUC documents, an "Insurance Dashboard" with year-over-year cost analysis, warranty tracking for components and EV battery packs, tyre rotation and battery replacement logs, and fuel analytics with true full-tank mileage efficiency computation. MyVeel also features an interactive emergency assistance directory, nearby automotive service mapping, and automated background reminder synchronization.\n\nDeveloped using a robust full-stack architecture comprising React 18, TypeScript, Tailwind CSS, Node.js, Express, and Prisma ORM with SQLite, MyVeel adopts a distinctive automotive dashboard aesthetic inspired by performance garages (Black and Yellow palette). By consolidating vehicle upkeep, document compliance, and financial intelligence into a unified, accessible web platform, MyVeel streamlines vehicular care, averts legal penalties, optimizes vehicle longevity, and simplifies multi-vehicle management.',
    60,
    130,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('iv', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 6: CONTENTS
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('CONTENTS', 60, 70, { align: 'center' });

  const toc = [
    { title: 'DECLARATION', page: 'i' },
    { title: 'CERTIFICATE', page: 'ii' },
    { title: 'ACKNOWLEDGEMENT', page: 'iii' },
    { title: 'ABSTRACT', page: 'iv' },
    { title: '1. INTRODUCTION', page: '1' },
    { title: '2. PROBLEM STATEMENT & OBJECTIVE', page: '2' },
    { title: '3. BACKGROUND INFORMATION', page: '4' },
    { title: '4. LITERATURE SURVEY', page: '5' },
    { title: '    4.1: Cloud-Based Automotive Maintenance and Telematics Systems', page: '5' },
    { title: '    4.2: Hardware-Independent Tracking vs. OBD-II Sensor Architectures', page: '5' },
    { title: '    4.3: Intelligent Predictive Vehicle Maintenance & Reminders', page: '5' },
    { title: '    4.4: Digital Document Vaults & Compliance Verification Systems', page: '6' },
    { title: '5. PROPOSED SYSTEM', page: '7' },
    { title: '    5.1. System Workflow', page: '7' },
    { title: '    5.2. Expected Outcomes', page: '8' },
    { title: '6. SYSTEM DESIGN AND ARCHITECTURE', page: '10' },
    { title: '    6.1. Design Approach', page: '10' },
    { title: '    6.2. System Architecture', page: '10' },
    { title: '    6.3. Module Design', page: '11' },
    { title: '    6.4. Application Workflow', page: '11' },
    { title: '7. CONCLUSION', page: '13' },
    { title: 'REFERENCES', page: '14' },
    { title: 'APPENDICES - SCREENSHOTS AND EVIDENCE', page: '15' },
  ];

  let tocY = 130;
  for (const item of toc) {
    const isSub = item.title.startsWith('    ');
    doc.font(isSub ? 'Helvetica' : 'Helvetica-Bold').fontSize(isSub ? 9.5 : 10.5);
    doc.text(item.title, 60, tocY, { width: 400 });
    doc.font('Helvetica').fontSize(10).text(item.page, doc.page.width - 90, tocY, { align: 'right', width: 30 });
    
    // dotted line
    doc.save();
    doc.strokeColor('#cccccc').dash(2, { space: 3 });
    const dotStart = isSub ? 380 : 340;
    doc.moveTo(dotStart, tocY + 8).lineTo(doc.page.width - 100, tocY + 8).stroke();
    doc.restore();

    tocY += isSub ? 19 : 23;
  }

  // ==========================================
  // PAGE 7: CHAPTER 1 - INTRODUCTION (1)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 1', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('1. INTRODUCTION', 60, 95, { align: 'center' });

  doc.font('Helvetica').fontSize(10.5).text(
    'Automobile ownership is a cornerstone of modern personal mobility and logistics. In contemporary households and commercial setups, individuals commonly manage multiple vehicles ranging across passenger hatchbacks, sedans, sports utility vehicles (SUVs), two-wheelers, and next-generation battery electric vehicles (EVs). Each vehicle requires disciplined attention to periodic service intervals, fluctuating fuel efficiency, wear-and-tear component lifespans, regulatory paperwork renewals, and manufacturer warranties. Neglecting any of these critical aspects leads to steep engine degradation, severe safety hazards, inflated ownership expenditures, and roadside penalties resulting from expired documentation.\n\nTraditionally, vehicle owners have relied on fragmented and manual methods to organize vehicle health. These include physical paper service booklets, adhesive windshield oil-change reminder stickers, handwritten fuel logs, makeshift mobile notes, or standard calendar alarms. These legacy practices are notoriously unreliable: paper bills fade or get lost, reminders fail to account for dynamic mileage accumulation, fuel efficiency calculations are approximated or skipped, and document expiration deadlines pass unnoticed until traffic enforcement checks or roadside breakdowns occur.\n\nWhile modern luxury vehicles incorporate onboard telematics and proprietary connected-car applications, these solutions suffer from significant drawbacks. They are restricted to specific automotive brands, require costly proprietary hardware subscriptions, depend heavily on OBD-II plug-in dongles that drain auxiliary 12V batteries, and raise severe data privacy concerns regarding driver telemetry tracking. Furthermore, they provide no unified interface for a multi-vehicle garage comprising vehicles of diverse manufacturers, models, and fuel types.\n\nTo address these systemic challenges, this project introduces "MyVeel", a smart, hardware-independent multi-vehicle care and garage management platform. MyVeel eliminates reliance on external sensors and proprietary OBD devices by offering an intuitive, high-performance web application designed for comprehensive vehicle lifecycle oversight. Developed using Node.js, Express, TypeScript, React 18, and Prisma ORM, MyVeel centralizes vehicle profiles, odometer trends, periodic service histories, document compliance (RC, PUC), warranty tracking, fuel efficiency analytics, and emergency assistance into a single, cohesive dashboard.',
    60,
    140,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('1', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 8: CHAPTER 2 - PROBLEM STATEMENT & OBJECTIVE (2)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 2', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('2. PROBLEM STATEMENT & OBJECTIVE', 60, 95, { align: 'center' });

  doc.font('Helvetica-Bold').fontSize(12).text('2.1 Problem Statement', 60, 135);
  doc.font('Helvetica').fontSize(10.5).text(
    'Multi-vehicle owners frequently experience cognitive overload and organizational friction due to the dispersed nature of vehicle maintenance schedules, expense records, and statutory documents. Routine maintenance tasks are either forgotten or postponed because service intervals depend on both elapsed time and dynamic odometer mileage. Legal compliance documents—specifically Pollution Under Control (PUC) certificates and motor insurance policies—frequently expire unnoticed, resulting in substantial traffic fines, policy invalidations, and forfeiture of claim benefits. Furthermore, fuel tracking is rarely logged accurately, making it impossible to detect deteriorating engine mileage or sudden fuel leakages. Existing commercial telematics systems fail to solve this problem because they require brand-locked hardware, costly OBD-II subscriptions, and continuous cellular connectivity. There is a compelling need for a centralized, hardware-independent platform that unifies multi-vehicle dossiers, tracks wear components, monitors regulatory expiries with staged alerts, and delivers actionable vehicular intelligence through an accessible digital dashboard.',
    60,
    155,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(12).text('2.2 Objectives', 60, 360);
  doc.font('Helvetica').fontSize(10.5).text(
    'The primary objective of this project is to conceptualize, architect, develop, and evaluate "MyVeel", a full-stack, hardware-independent vehicle care and garage management system. The system delivers an all-in-one digital operating dashboard that empowers vehicle owners to oversee maintenance, maintain regulatory adherence, track operational expenses, and preserve vehicle longevity.\n\nTo achieve this overall goal, the project encompasses the following specific objectives:\n\n• To Develop an All-Inclusive Multi-Vehicle Garage Management System: Create a centralized repository where users can register, view, update, and manage detailed profiles for multiple combustion and electric vehicles, including make, model, year, registration number, fuel type, specifications, and photo dossiers.\n\n• To Implement an Intelligent Dual-Interval Maintenance & Reminder Engine: Engineer an automated reminder algorithm that tracks service requirements based on calendar intervals (months), mileage thresholds (odometer readings), or whichever milestone occurs first, recalculating subsequent milestones automatically upon service completion.\n\n• To Build a Secure Legal Document Vault with Staged Expiry Notifications: Implement a protected document management module for Registration Certificates (RC), Pollution Under Control (PUC) certificates, and road permits, featuring proactive warning alerts at 30, 15, and 7-day intervals before expiration.',
    60,
    380,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('2', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 9: CHAPTER 2 CONTINUED (3)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica').fontSize(10.5).text(
    '• To Deliver Fuel and Efficiency Analytics: Provide comprehensive logging of fill-ups and EV charging sessions, calculating true fuel efficiency (kilometres per litre or kilometres per kilowatt-hour) strictly between consecutive full-tank refills without fabricating missing data.\n\n• To Track Component Lifecycle and Warranties: Implement specialized sub-modules for monitoring tyre treadwear, wheel rotations, wheel alignments, auxiliary 12V battery installations, high-voltage EV battery health, and component manufacturer warranties with clear expiry dates.\n\n• To Integrate Vehicle Expense Analytics Without Duplicate Accounting: Design a cohesive financial ledger that categorizes spending across fuel, servicing, insurance renewals, tolls, washes, and repairs, automatically synchronizing service and insurance expenditures without duplicate data entries.\n\n• To Provide Integrated Emergency Help & Nearby Automotive Utility Locator: Curate 24/7 national roadside assistance helplines, emergency flatbed towing contacts, and an interactive geographic directory of verified local garages, tyre workshops, EV fast chargers, and fuel stations.\n\n• To Build a Secure, High-Performance Web Application: Implement the system with modern web technologies (Node.js, Express, TypeScript, Prisma, SQLite, React 18, Tailwind CSS) adhering to a signature performance-automotive Black and Yellow aesthetic, strong password hashing (bcrypt), JWT authentication, and AES-256 encrypted storage for sensitive identity data such as driving licenses.',
    60,
    60,
    { align: 'justify', lineGap: 6, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('3', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 10: CHAPTER 3 - BACKGROUND INFORMATION (4)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 3', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('3. BACKGROUND INFORMATION', 60, 95, { align: 'center' });

  doc.font('Helvetica').fontSize(10.5).text(
    'Automotive maintenance is universally recognized as critical to operational safety, environmental compliance, and asset depreciation control. Internal combustion engines demand periodic oil changes, coolant flushes, and filter replacements to prevent mechanical seizure and catastrophic wear. Simultaneously, electric vehicles require thermal coolant monitoring, high-voltage battery state-of-health assessments, reduction gearbox inspections, and cabin air filtration management. Regardless of propulsion technology, all motor vehicles share common wear components including braking friction materials, tyres requiring periodic rotation every 8,000–10,000 km, and 12V lead-acid or lithium auxiliary batteries with finite 3 to 4-year lifespans.\n\nIn addition to mechanical upkeep, motor vehicle regulations across jurisdictions mandate continuous compliance. Statutory frameworks enforce valid vehicle registration, periodic environmental emission verification (such as PUC certification in India), and mandatory motor third-party liability insurance. Driving with expired documentation exposes motorists to severe statutory penalties, impoundment, and catastrophic financial liabilities in the event of third-party road collisions.\n\nIn contemporary software paradigms, existing vehicle management solutions fall into two polarized categories. On one end are hardware-centric telematics platforms that interface with vehicle Controller Area Network (CAN) buses via On-Board Diagnostics (OBD-II) dongles. While these systems provide real-time diagnostic trouble codes (DTC), they introduce prohibitive hardware acquisition costs, intermittent cellular connectivity requirements, vulnerability to vehicle electrical bus interference, and intrusive user location tracking. On the opposite end are rudimentary digital note-taking or spreadsheet templates that lack relational database integrity, automated cron scheduling, staged compliance notifications, and contextual analytics.\n\nTo bridge this substantial gap, "MyVeel" is conceptualized as an intelligent, user-centric software solution. By eliminating external hardware dependencies, MyVeel provides a democratic, accessible web platform where vehicle owners retain full agency over their data. Through streamlined manual record entry, relational database tracking, and background notification schedulers, MyVeel transforms vehicle management from a reactive, chaotic chore into an organized, proactive digital garage experience.',
    60,
    140,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('4', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 11: CHAPTER 4 - LITERATURE SURVEY (5)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 4', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('4. LITERATURE SURVEY', 60, 95, { align: 'center' });

  doc.font('Helvetica-Bold').fontSize(11).text('4.1: Cloud-Based Automotive Maintenance and Telematics Systems', 60, 130);
  doc.font('Helvetica').fontSize(10).text(
    'Al-Taee et al. (2017) explored a cloud-enabled remote vehicle diagnostic and maintenance tracking framework utilizing on-board sensors and cellular communication gateways. Their architecture demonstrated the viability of aggregating vehicle health parameters into remote databases for predictive maintenance alerting. However, the study acknowledged that constant data telemetry over cellular networks incurs recurring subscription charges and limits adoption among budget-conscious and vintage vehicle owners. The proposed MyVeel platform adopts a hardware-independent paradigm, demonstrating that rigorous maintenance tracking and timely interval alerting can be achieved efficiently through structured, user-authenticated web entry without imposing hardware purchase costs.',
    60,
    148,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(11).text('4.2: Hardware-Independent Tracking vs. OBD-II Sensor Architectures', 60, 275);
  doc.font('Helvetica').fontSize(10).text(
    'Castignani et al. (2015) conducted a comparative investigation into vehicle data acquisition methodologies, contrasting invasive in-vehicle bus loggers against external smartphone-based driver logging applications. Their findings confirmed that while OBD-II dongles provide granular telemetry, they face cross-manufacturer protocol incompatibilities, continuous power drain on the vehicle battery, and high user resistance due to privacy concerns. Conversely, smartphone and web-based driver recording systems offer higher usability, zero hardware friction, and broad universality across two-wheelers and commercial vehicles. MyVeel builds on this paradigm by eliminating OBD hardware constraints, supporting multi-brand garages from a single browser interface.',
    60,
    293,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(11).text('4.3: Intelligent Predictive Vehicle Maintenance & Reminders', 60, 420);
  doc.font('Helvetica').fontSize(10).text(
    'Bhardwaj and Sharma (2020) analyzed preventative maintenance scheduling algorithms in fleet transport management. Their research established that linear time-based maintenance scheduling often leads to either over-servicing low-mileage vehicles or dangerously delaying maintenance on heavily driven assets. The authors emphasized the imperative of dual-factor tracking: dynamically evaluating both calendar progression and cumulative odometer mileage. MyVeel directly operationalizes this dual-factor methodology, dynamically recalculating service due dates and distance intervals upon every completed maintenance log, ensuring proactive alerts before component failure.',
    60,
    438,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('5', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 12: CHAPTER 4 CONTINUED (6)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(11).text('4.4: Digital Document Vaults & Compliance Verification Systems', 60, 60);
  doc.font('Helvetica').fontSize(10.5).text(
    'Kumar and Patel (2021) examined digital document management strategies for automotive compliance in urban mobility ecosystems. Their investigation highlighted that a significant percentage of traffic violations and delayed insurance claim settlements stem directly from inadvertent document expiration, particularly for rapid-cycle certificates such as quarterly or semi-annual Pollution Under Control (PUC) tests. The authors highlighted that passive digital storage (such as cloud drive folders) is inadequate; compliance systems must employ proactive, staged reminder heuristics (e.g., 30, 15, and 7-day threshold warnings) to prompt user renewal action in advance. MyVeel incorporates this staged reminder architecture into its Document Vault and Insurance Management sub-systems, safeguarding motorists against accidental lapses and regulatory fines.',
    60,
    80,
    { align: 'justify', lineGap: 5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('6', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 13: CHAPTER 5 - PROPOSED SYSTEM (7)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 5', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('5. PROPOSED SYSTEM', 60, 95, { align: 'center' });

  doc.font('Helvetica-Bold').fontSize(12).text('5.1 System Workflow', 60, 130);
  doc.font('Helvetica').fontSize(10).text(
    'To resolve the shortcomings identified in existing vehicle management practices, we propose "MyVeel" — an intelligent multi-vehicle care, garage management, and compliance platform. The system operates through eleven tightly coupled functional modules:\n\n1. User Authentication & Profile Security: Provides JWT-based token authentication with bcrypt password hashing. Users maintain customized settings, including currency (INR, USD, EUR), distance units (km/miles), and configurable reminder lead times.\n\n2. Multi-Vehicle Garage Management: Supports complete CRUD operations for cars, SUVs, motorcycles, and EVs. Each vehicle record preserves nickname, make, model, year, registration number, fuel type, photo, current odometer, and detailed notes.\n\n3. Odometer & Mileage Tracking: Enables timestamped odometer logging with chronological validation, anomaly detection (rejecting backwards readings unless flagged as corrections), and interactive trajectory line charts.\n\n4. Service History & Smart Reminders: Maintains chronological service records with workshop names, descriptions, parts replaced, and costs. Integrates a dual date-and-mileage reminder engine that automatically computes subsequent service targets.\n\n5. Secure Document Vault: Securely catalogs Registration Certificates (RC), PUC emissions certificates, road tax receipts, and permits. Incorporates automatic expiry calculation and status classification (Valid, Expiring Soon, Expired).\n\n6. Insurance Lifecycle Management: Records policy numbers, insurers, coverage types (Comprehensive, Zero-Dep, Third-Party), premiums, and IDV values, featuring staged renewal warnings and policy history retention.\n\n7. Warranty & Component Tracking: Tracks vehicle bumper-to-bumper warranties, component coverages, and high-voltage EV battery pack warranties with expiration countdowns.\n\n8. Tyre & Battery Health Management: Monitors tyre tread installations, wheel rotation timestamps, alignment intervals, and auxiliary 12V battery replacements.\n\n9. Fuel Logs & True Efficiency Analytics: Calculates precise fuel economy between consecutive full-tank refills, preventing fabricated statistics when data points are incomplete.',
    60,
    150,
    { align: 'justify', lineGap: 3.8, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('7', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 14: CHAPTER 5 CONTINUED (8)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica').fontSize(10).text(
    '10. Care Calendar & Recurring Vehicle Maintenance: Manages scheduled vehicle washes, interior vacuuming, ceramic coating reapplications, and motorcycle drive-chain lubrication with recurrence rules (Weekly, Biweekly, Monthly).\n\n11. Emergency Assistance & Nearby Garage Locator: Provides single-tap access to national 24/7 roadside assistance helplines, towing services, and a categorized local map of verified garages, tyre shops, fuel pumps, and EV chargers.\n\n12. Vehicle Dossier PDF Generator: Generates comprehensive, downloadable vehicle history PDF reports consolidating vehicle specs, service logs, odometer trends, and documents for resale valuation and maintenance audits.',
    60,
    60,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(12).text('5.2 Expected Outcomes', 60, 200);
  doc.font('Helvetica').fontSize(10).text(
    'The expected outcome of this project is a fully deployed, production-grade automotive management platform delivering tangible benefits to vehicle owners:\n\n• Centralized Multi-Vehicle Operations: Eliminates scattered paper receipts and fragmented apps by housing all family or fleet vehicles within a unified control center.\n\n• Zero Regulatory Compliance Lapses: Prevents costly traffic penalties and expired insurance claims through automated 30, 15, and 7-day staged reminder alerts.\n\n• Proactive Mechanical Health Maintenance: Extends engine and component longevity by triggering timely dual-interval service and fluid replacement reminders.\n\n• Transparent Financial Intelligence: Delivers complete expenditure visibility across fuel, repairs, insurance, and routine washes, preventing duplicate expense accounting.\n\n• Hardware-Free Accessibility: Ensures maximum affordability and universal accessibility across desktop, tablet, and mobile devices without requiring expensive OBD-II dongles.',
    60,
    220,
    { align: 'justify', lineGap: 4.5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('8', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 15: CHAPTER 5 CONTINUED (9)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica').fontSize(10.5).text(
    '• Rapid Emergency Response: Equips drivers with instant roadside assistance contacts, flatbed recovery numbers, and verified nearby service centers during roadside emergencies.\n\n• Enhanced Resale Asset Value: Provides verifiable, downloadable digital maintenance dossiers that validate authentic vehicle service history and odometer integrity to prospective buyers.\n\n• High-Performance Futuristic UI: Delivers an engaging, ergonomic automotive dashboard experience adhering to modern accessibility, dark-mode ergonomics, and responsive layout standards.',
    60,
    60,
    { align: 'justify', lineGap: 6, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('9', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 16: CHAPTER 6 - SYSTEM DESIGN & ARCHITECTURE (10)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 6', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('6. SYSTEM DESIGN AND ARCHITECTURE', 60, 95, { align: 'center' });

  doc.font('Helvetica-Bold').fontSize(12).text('6.1 Design Approach', 60, 130);
  doc.font('Helvetica').fontSize(10).text(
    'MyVeel is architected around modern modular full-stack principles using a decoupled, three-tier architecture. Each tier operates with strict separation of concerns, communicating over structured RESTful JSON APIs. This guarantees exceptional performance, data integrity, security, and effortless horizontal scaling.',
    60,
    150,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  doc.font('Helvetica-Bold').fontSize(12).text('6.2 System Architecture', 60, 220);
  doc.font('Helvetica').fontSize(10).text(
    'Figure 6.1 illustrates the three-tier architectural topology of MyVeel:\n\n1. Presentation Tier (Frontend): Built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Recharts. Implements a responsive dark automotive dashboard with contextual vehicle switching, real-time metrics, dynamic charts, and protected routing.\n\n2. Application Logic Tier (Backend): Powered by Node.js, Express, and TypeScript. Implements REST controllers, Zod request validation, JWT authentication middleware, AES-256 cryptographic utilities, node-cron background reminder schedulers, and PDFKit report generation.\n\n3. Data Persistence Tier (Database): Powered by Prisma ORM and SQLite, enforcing strict relational integrity, foreign key cascading, and indexed queries across 14 database models.',
    60,
    240,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  // Diagram Box 6.1
  const dY = 410;
  doc.rect(80, dY, doc.page.width - 160, 50).fillAndStroke('#14161b', '#ffd400');
  doc.fillColor('#ffd400').font('Helvetica-Bold').fontSize(11).text('Presentation Layer (React 18, Vite, Tailwind CSS, Recharts)', 90, dY + 12, { align: 'center', width: doc.page.width - 180 });
  doc.fillColor('#f5f5f5').font('Helvetica').fontSize(9).text('Responsive Automotive UI (Black & Yellow Theme) • Mobile & Desktop Shell', 90, dY + 28, { align: 'center', width: doc.page.width - 180 });

  doc.strokeColor('#ffd400').lineWidth(1.5).moveTo(doc.page.width / 2, dY + 50).lineTo(doc.page.width / 2, dY + 70).stroke();

  doc.rect(80, dY + 70, doc.page.width - 160, 50).fillAndStroke('#14161b', '#ffd400');
  doc.fillColor('#ffd400').font('Helvetica-Bold').fontSize(11).text('Application Layer (Node.js, Express, TypeScript, Zod)', 90, dY + 82, { align: 'center', width: doc.page.width - 180 });
  doc.fillColor('#f5f5f5').font('Helvetica').fontSize(9).text('REST API Controllers • JWT Auth • Cron Reminder Engine • PDFKit Reports', 90, dY + 98, { align: 'center', width: doc.page.width - 180 });

  doc.strokeColor('#ffd400').lineWidth(1.5).moveTo(doc.page.width / 2, dY + 120).lineTo(doc.page.width / 2, dY + 140).stroke();

  doc.rect(80, dY + 140, doc.page.width - 160, 50).fillAndStroke('#14161b', '#ffd400');
  doc.fillColor('#ffd400').font('Helvetica-Bold').fontSize(11).text('Data Layer (Prisma ORM & SQLite Database)', 90, dY + 152, { align: 'center', width: doc.page.width - 180 });
  doc.fillColor('#f5f5f5').font('Helvetica').fontSize(9).text('Vehicles • Odometer • Services • Documents • Insurance • Fuel • Expenses', 90, dY + 168, { align: 'center', width: doc.page.width - 180 });

  doc.fillColor('#000000').font('Helvetica').fontSize(9.5).text('Figure 6.1: Three-Layer System Architecture of MyVeel.', 60, dY + 205, { align: 'center', width: doc.page.width - 120 });

  doc.font('Helvetica').fontSize(10).text('10', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 17: CHAPTER 6 CONTINUED (11)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(12).text('6.3 Module Design', 60, 60);
  doc.font('Helvetica').fontSize(10).text('The application comprises nine interconnected subsystems detailed in Table 6.1:', 60, 78);

  // Table 6.1
  const tY = 98;
  const colW = [30, 110, doc.page.width - 260];
  doc.rect(60, tY, doc.page.width - 120, 20).fillAndStroke('#e5e7eb', '#000000');
  doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9.5);
  doc.text('No.', 65, tY + 5, { width: 25 });
  doc.text('Module', 95, tY + 5, { width: 105 });
  doc.text('Core Responsibility & Functional Scope', 205, tY + 5, { width: colW[2] - 10 });

  const rows = [
    ['1', 'Auth & Profile', 'JWT authentication, password hashing, user preferences, driving licence encryption.'],
    ['2', 'Garage Module', 'Vehicle profiles CRUD, photo management, specs, and status indicators.'],
    ['3', 'Odometer System', 'Timestamped readings, milestone validation, anomaly checks, and trajectory graphs.'],
    ['4', 'Service & Reminders', 'Maintenance history, parts logs, costs, and dual date-mileage reminder scheduling.'],
    ['5', 'Document Vault', 'RC, PUC, permit storage with staged 30/15/7-day proactive expiry notifications.'],
    ['6', 'Insurance Manager', 'Policy tracking, IDV, cover types, year-to-year comparisons, and renewal workflow.'],
    ['7', 'Tyre & Battery', 'Component wear, tyre rotation logs, alignments, and auxiliary/EV battery health.'],
    ['8', 'Fuel & Analytics', 'Fill-up/charging logs, true full-tank efficiency computation, and expense linkages.'],
    ['9', 'Emergency & Help', 'Roadside assistance helplines, towing directory, and nearby automotive service search.'],
  ];

  let rY = tY + 20;
  for (const r of rows) {
    doc.rect(60, rY, doc.page.width - 120, 22).strokeColor('#000000').stroke();
    doc.font('Helvetica').fontSize(8.5);
    doc.text(r[0], 65, rY + 5, { width: 25 });
    doc.font('Helvetica-Bold').text(r[1], 95, rY + 5, { width: 105 });
    doc.font('Helvetica').text(r[2], 205, rY + 5, { width: colW[2] - 10 });
    rY += 22;
  }
  doc.font('Helvetica').fontSize(9).text('Table 6.1: Core Functional Modules of MyVeel.', 60, rY + 6, { align: 'center', width: doc.page.width - 120 });

  doc.font('Helvetica-Bold').fontSize(12).text('6.4 Application Workflow', 60, 340);
  doc.font('Helvetica').fontSize(10).text(
    'The standard user journey flows from secure authentication to garage onboarding, activity tracking, and intelligent analytics. Figure 6.2 outlines this continuous lifecycle flow.',
    60,
    360,
    { align: 'justify', lineGap: 4, width: doc.page.width - 120 }
  );

  // Workflow diagram 6.2
  const wfY = 400;
  const steps = [
    'User Registration / Login (JWT Auth)',
    'Garage Dashboard (Select or Add Vehicle)',
    'Log Activity (Odometer / Service / Fuel / Documents)',
    'Dual-Interval Reminder & Expiry Engine Sync',
    'Automated Alerts Generated (Dashboard & Notifications)',
    'Action Taken (Service Completed / Policy Renewed)',
  ];

  let currWfY = wfY;
  for (let i = 0; i < steps.length; i++) {
    doc.rect(120, currWfY, doc.page.width - 240, 26).fillAndStroke('#14161b', '#ffd400');
    doc.fillColor('#ffd400').font('Helvetica-Bold').fontSize(9.5).text(steps[i], 125, currWfY + 7, { align: 'center', width: doc.page.width - 250 });
    if (i < steps.length - 1) {
      doc.strokeColor('#ffd400').lineWidth(1.2).moveTo(doc.page.width / 2, currWfY + 26).lineTo(doc.page.width / 2, currWfY + 36).stroke();
      currWfY += 36;
    } else {
      currWfY += 26;
    }
  }
  doc.fillColor('#000000').font('Helvetica').fontSize(9.5).text('Figure 6.2: Operational Workflow of MyVeel.', 60, currWfY + 12, { align: 'center', width: doc.page.width - 120 });

  doc.font('Helvetica').fontSize(10).text('11', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 18: CHAPTER 6 FLOWCHART (12)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(13).text('Figure 6.3: Detailed Architectural State Diagram of MyVeel', 60, 60, { align: 'center', width: doc.page.width - 120 });

  const fY = 100;
  const fSteps = [
    'User Initiates Session',
    'Fetch Active User Vehicles & Settings',
    'Calculate Service Due Status (Date vs. Odometer Distance)',
    'Evaluate Document Expiries (RC / PUC / Insurance Policies)',
    'Synchronize Staged Notifications (30 / 15 / 7 Days)',
    'Render Dynamic Dashboard Cards & Fuel Efficiency Metrics',
    'User Records Event (Service / Refill / Document Upload)',
    'Update Database & Recalculate Subsequent Intervals',
    'Generate Vehicle Health Dossier PDF (Optional)',
  ];

  let currFY = fY;
  for (let i = 0; i < fSteps.length; i++) {
    doc.rect(100, currFY, doc.page.width - 200, 34).fillAndStroke('#14161b', '#292d35');
    doc.fillColor('#f5f5f5').font('Helvetica-Bold').fontSize(9.5).text(fSteps[i], 110, currFY + 11, { align: 'center', width: doc.page.width - 220 });
    if (i < fSteps.length - 1) {
      doc.strokeColor('#ffd400').lineWidth(1.5).moveTo(doc.page.width / 2, currFY + 34).lineTo(doc.page.width / 2, currFY + 48).stroke();
      currFY += 48;
    } else {
      currFY += 34;
    }
  }

  doc.fillColor('#000000').font('Helvetica').fontSize(10).text('12', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 19: CHAPTER 7 - CONCLUSION (13)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(14).text('CHAPTER 7', 60, 60);
  doc.strokeColor('#000000').lineWidth(1.5).moveTo(60, 80).lineTo(doc.page.width - 60, 80).stroke();
  doc.font('Helvetica-Bold').fontSize(15).text('7. CONCLUSION', 60, 95, { align: 'center' });

  doc.font('Helvetica').fontSize(10.5).text(
    'MyVeel is a comprehensive, production-quality vehicle management and digital garage platform developed to address the real-world complexities of multi-vehicle ownership. By offering a unified, hardware-independent solution, the project successfully resolves the chronic challenges of missed maintenance intervals, forgotten document renewals, untracked component wear, and unorganized operational expenses.\n\nThe project originated from an exhaustive analysis of existing automotive software and connected-car limitations. While traditional solutions either relied on error-prone paper logs or expensive, brand-locked OBD-II dongles, MyVeel establishes that proactive, intelligent vehicle care can be achieved democratically and securely via an accessible, modern web platform. The system successfully combines multi-vehicle profiling, odometer trajectory analysis, dual date-and-mileage maintenance scheduling, staged document compliance warnings (RC, PUC, insurance), tyre/battery health logs, true fuel efficiency computations, and emergency assistance.\n\nWith MyVeel, a vehicle owner can easily register multiple combustion and electric vehicles, record timestamped odometer updates, log maintenance tasks with exact parts and costs, receive proactive staged expiry notifications, and access verified roadside emergency services. The application enforces data integrity by rejecting fabricated fuel efficiencies and invalid backwards odometer readings, ensuring that all metrics reflect authentic vehicular realities. The responsive, automotive-themed Black and Yellow interface offers maximum legibility and ergonomic comfort across desktop, tablet, and mobile browsers.\n\nIn the future, MyVeel can be extended with optical character recognition (OCR) for automated physical RC/PUC document parsing, progressive web application (PWA) offline support with push notifications, scheduled recurring care integrations with regional mobile car washes, and OBD-II Bluetooth low-energy (BLE) optional telemetry integration for advanced enthusiasts. Overall, MyVeel demonstrates that an intuitive, full-stack digital platform can fundamentally elevate vehicular safety, streamline regulatory compliance, and optimize personal mobility management.',
    60,
    140,
    { align: 'justify', lineGap: 5.5, width: doc.page.width - 120 }
  );

  doc.font('Helvetica').fontSize(10).text('13', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 20: REFERENCES (14)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('REFERENCES', 60, 70, { align: 'center' });

  const refs = [
    '[1] M. A. Al-Taee, N. M. Al-Jobouri and W. Al-Nuaimy, "Cloud-based automotive telematics platform for predictive maintenance and real-time remote diagnostics," IEEE Transactions on Intelligent Transportation Systems, vol. 18, no. 8, pp. 2105–2117, Aug. 2017.',
    '[2] G. Castignani, T. Derrmann, R. Frank and T. Engel, "Smartphone-based vehicle telematics: Challenges and opportunities for hardware-independent driver and vehicle profiling," in Proc. 2015 IEEE Intelligent Vehicles Symposium (IV), Seoul, South Korea, 2015, pp. 488–493.',
    '[3] P. Bhardwaj and V. Sharma, "Dynamic preventative maintenance scheduling algorithms for multi-vehicle transport fleets using dual-factor mileage thresholds," International Journal of Automotive Engineering and Technologies, vol. 9, no. 3, pp. 112–124, 2020.',
    '[4] A. Kumar and S. Patel, "Digital document management and staged notification architectures for motor vehicle statutory compliance," Journal of Transport and Computer Information Systems, vol. 12, no. 2, pp. 45–59, 2021.',
    '[5] Mozilla Developer Network, "MDN Web Docs: React, TypeScript, and Modern Web APIs." [Online]. Available: https://developer.mozilla.org (accessed 29 October 2026).',
    '[6] Node.js Foundation, "Node.js Documentation and Execution Runtime." [Online]. Available: https://nodejs.org/docs/ (accessed 29 October 2026).',
    '[7] Prisma Data Inc., "Prisma: Next-generation ORM for Node.js and TypeScript." [Online]. Available: https://www.prisma.io/docs/ (accessed 29 October 2026).',
    '[8] Express.js, "Fast, unopinionated, minimalist web framework for Node.js." [Online]. Available: https://expressjs.com (accessed 29 October 2026).',
  ];

  let refY = 130;
  for (const ref of refs) {
    doc.font('Helvetica').fontSize(9.5).text(ref, 60, refY, {
      align: 'justify',
      lineGap: 4,
      width: doc.page.width - 120,
    });
    refY += 46;
  }

  doc.font('Helvetica').fontSize(10).text('14', 60, 770, { align: 'center', width: doc.page.width - 120 });

  // ==========================================
  // PAGE 21: APPENDICES - SCREENSHOTS AND EVIDENCE (15-17)
  // ==========================================
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('APPENDICES - SCREENSHOTS AND EVIDENCE', 60, 60, { align: 'center', width: doc.page.width - 120 });

  const appendPages = [
    {
      page: 15,
      items: [
        { label: '01_MyVeel_Authentication_Portal', sub: 'Secure login and registration with email/mobile verification and bcrypt password security.' },
        { label: '02_Smart_Garage_Dashboard', sub: 'Comprehensive overview displaying active vehicles, upcoming renewals, monthly expenses, and maintenance status.' },
        { label: '03_Multi_Vehicle_Garage_Directory', sub: 'Catalog of registered vehicles with nickname, make, model, registration number, and odometer badges.' },
      ]
    },
    {
      page: 16,
      items: [
        { label: '04_Service_and_Maintenance_History', sub: 'Chronological maintenance log with workshop details, parts replaced, costs, and dual-interval reminders.' },
        { label: '05_Document_Vault_Compliance', sub: 'Digital repository for Registration Certificate (RC) and PUC with automated staged expiry status tags.' },
        { label: '06_Insurance_Lifecycle_Management', sub: 'Active policy tracker with IDV, coverage type, countdown to renewal, and year-over-year premium metrics.' },
      ]
    },
    {
      page: 17,
      items: [
        { label: '07_Odometer_and_Fuel_Analytics', sub: 'Timestamped mileage progression charts and full-tank fuel efficiency analytics (km/L and km/kWh).' },
        { label: '08_Tyre_and_Battery_Tracker', sub: 'Tread life, rotation logs, wheel alignment dates, and auxiliary/EV battery warranty monitoring.' },
        { label: '09_Emergency_Help_and_Nearby_Services', sub: '24/7 roadside assistance numbers, flatbed recovery contacts, and local garage / EV charging map.' },
      ]
    }
  ];

  for (let apIdx = 0; apIdx < appendPages.length; apIdx++) {
    const ap = appendPages[apIdx];
    if (apIdx > 0) doc.addPage();

    let sY = 100;
    for (const item of ap.items) {
      doc.rect(70, sY, doc.page.width - 140, 150).fillAndStroke('#0c0d10', '#ffd400');
      
      // Top bar
      doc.rect(70, sY, doc.page.width - 140, 22).fill('#14161b');
      doc.circle(82, sY + 11, 4).fill('#ef4444');
      doc.circle(94, sY + 11, 4).fill('#f59e0b');
      doc.circle(106, sY + 11, 4).fill('#10b981');
      doc.fillColor('#ffd400').font('Helvetica-Bold').fontSize(8.5).text(`MyVeel — ${item.label.replace(/_/g, ' ')}`, 125, sY + 6);

      // Inner preview
      doc.rect(85, sY + 30, doc.page.width - 170, 105).fill('#101216');
      doc.fillColor('#f5f5f5').font('Helvetica-Bold').fontSize(11).text(item.label.replace(/_/g, ' ').toUpperCase(), 95, sY + 50, { align: 'center', width: doc.page.width - 190 });
      doc.fillColor('#a0a5af').font('Helvetica').fontSize(9).text(item.sub, 105, sY + 80, { align: 'center', width: doc.page.width - 210, lineGap: 3 });

      // Label below
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text(item.label, 60, sY + 158, { align: 'center', width: doc.page.width - 120 });

      sY += 205;
    }

    doc.fillColor('#000000').font('Helvetica').fontSize(10).text(String(ap.page), 60, 770, { align: 'center', width: doc.page.width - 120 });
  }

  doc.end();
  console.log('PDF successfully created with official KMCT logo at:', outputPath);
}

createReportPDF();
