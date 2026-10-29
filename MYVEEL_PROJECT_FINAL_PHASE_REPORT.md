# MyVeel — Smart Multi-Vehicle Care & Garage Management System
## PROJECT FINAL PHASE REPORT

**Submitted by:**
- **MUHAMMED NAZAL**
- **NIBINSHAN**
- **HANEEN**
- **HARICHAND**

**to**
The APJ Abdul Kalam Technological University  
in partial fulfillment of the requirements for the award of the Degree of  
**Bachelor of Computer Application**

**Department of Computer Application**  
**KMCT INSTITUTE OF EMERGING TECHNOLOGY AND MANAGEMENT**  
**OCTOBER 2026**

---

## DECLARATION

Muhammed Nazal, Nibinshan, Haneen, Harichand hereby declare that the project report **"MyVeel — Smart Multi-Vehicle Care & Garage Management System"** submitted for partial fulfillment of the requirements for the award of the degree of Bachelor of Computer Application of the APJ Abdul Kalam Technological University, Kerala is a bonafide work done by us under the supervision of **Ms. DILDIYA SS**. This submission represents our ideas in our own words. We have adequately and accurately cited and referenced the original sources. We also declare that we have adhered to ethics of academic honesty and integrity and have not misrepresented or fabricated any data or idea or fact or source in our submission. We understand that any violation of the above will be a cause for disciplinary action by the institute and/or the University and can also evoke penal action from the sources which have thus not been properly cited or from whom proper permission has not been obtained. This report has not been previously formed the basis for the award of any degree, diploma or similar title of any other University.

**Place:** Calicut  
**Date:** 30-10-2026

**MUHAMMED NAZAL**  
**NIBINSHAN**  
**HANEEN**  
**HARICHAND**  
**BCA S5**

*(Page i)*

---

## CERTIFICATE

### DEPARTMENT OF COMPUTER APPLICATION
### KMCT INSTITUTE OF EMERGING TECHNOLOGY AND MANAGEMENT

This is to certify that the report entitled **"MyVeel — Smart Multi-Vehicle Care & Garage Management System"** submitted by **Muhammed Nazal, Nibinshan, Haneen, Harichand** to the APJ Abdul Kalam Technological University, Kerala in partial fulfillment of the Degree of Bachelor of Computer Application is a bonafide record of the project work carried out by them under our guidance and supervision. This report in any form has not been submitted to any other University or Institute for any purpose.

| | | |
| :---: | :---: | :---: |
| **Ms. Dildiya SS**<br>*(Guide / Project Supervisor)* | **Thejas Mon P**<br>*(Head of Department)* | **Prof. Kavitha G. Nair**<br>*(Project Coordinator)* |

*(Page ii)*

---

## ACKNOWLEDGEMENT

We are grateful to GOD Almighty for giving us the courage and strength to complete our project successfully. We are deeply thankful to our Project Supervisor **Ms. DILDIYA SS** for her constant guidance, valuable suggestions, and patient support throughout the development of this work.

We also remember with thanks the timely help and constant encouragement induced by other faculties of KMCT Institute of Emerging Technology and Management, our friends, and our parents.

We express our sincere sense of gratitude to the Department of Computer Application, KMCT Institute of Emerging Technology and Management, for providing us with the resources and facilities required to complete our work.

**MUHAMMED NAZAL**  
**NIBINSHAN**  
**HANEEN**  
**HARICHAND**

*(Page iii)*

---

## ABSTRACT

Vehicle ownership has expanded rapidly, with individuals and families frequently managing multiple vehicles spanning cars, motorcycles, and modern electric vehicles. However, vehicle maintenance, regulatory compliance, and expense management remain largely fragmented. Owners routinely forget periodic maintenance milestones, miss critical renewal deadlines for insurance policies and Pollution Under Control (PUC) certificates, misplace warranties, and struggle to evaluate true fuel efficiency and operational running costs. Existing telematics or OBD-II hardware systems introduce substantial equipment expenses, compatibility hurdles, and persistent privacy risks, leaving everyday multi-vehicle owners without an accessible software solution.

To overcome these limitations, this project presents **"MyVeel"**, a smart, hardware-independent vehicle care and digital garage management web application. The platform provides a centralized, secure hub where vehicle owners can catalog unlimited vehicles across combustion and electric powertrains, monitor timestamped odometer readings, track chronological maintenance histories with associated parts and costs, and establish dual date-and-mileage-based service reminders with automated recalculation. The system integrates a dedicated "Document Vault" with multi-stage expiry alerts (30, 15, and 7 days) for Registration Certificates (RC) and PUC documents, an "Insurance Dashboard" with year-over-year cost analysis, warranty tracking for components and EV battery packs, tyre rotation and battery replacement logs, and fuel analytics with true full-tank mileage efficiency computation. MyVeel also features an interactive emergency assistance directory, nearby automotive service mapping, and automated background reminder synchronization.

Developed using a robust full-stack architecture comprising React 18, TypeScript, Tailwind CSS, Node.js, Express, and Prisma ORM with SQLite, MyVeel adopts a distinctive automotive dashboard aesthetic inspired by performance garages (Black and Yellow palette). By consolidating vehicle upkeep, document compliance, and financial intelligence into a unified, accessible web platform, MyVeel streamlines vehicular care, averts legal penalties, optimizes vehicle longevity, and simplifies multi-vehicle management.

*(Page iv)*

---

## CONTENTS

- **DECLARATION** ........................................................................................ i
- **CERTIFICATE** ........................................................................................ ii
- **ACKNOWLEDGEMENT** ......................................................................... iii
- **ABSTRACT** ............................................................................................ iv
- **1. INTRODUCTION** ................................................................................. 1
- **2. PROBLEM STATEMENT & OBJECTIVE** ............................................... 2
  - 2.1 Problem Statement .......................................................................... 2
  - 2.2 Objectives ....................................................................................... 2
- **3. BACKGROUND INFORMATION** ......................................................... 4
- **4. LITERATURE SURVEY** ........................................................................ 5
  - 4.1: Cloud-Based Automotive Maintenance and Telematics Systems ......... 5
  - 4.2: Hardware-Independent Tracking vs. OBD-II Sensor Architectures ...... 5
  - 4.3: Intelligent Predictive Vehicle Maintenance & Reminders ................. 5
  - 4.4: Digital Document Vaults & Compliance Verification Systems ........... 6
- **5. PROPOSED SYSTEM** ........................................................................... 7
  - 5.1 System Workflow ............................................................................. 7
  - 5.2 Expected Outcomes .......................................................................... 8
- **6. SYSTEM DESIGN AND ARCHITECTURE** ........................................... 10
  - 6.1 Design Approach ........................................................................... 10
  - 6.2 System Architecture ...................................................................... 10
  - 6.3 Module Design ............................................................................... 11
  - 6.4 Application Workflow .................................................................... 11
- **7. CONCLUSION** .................................................................................... 13
- **REFERENCES** ....................................................................................... 14
- **APPENDICES - SCREENSHOTS AND EVIDENCE** ................................. 15

---

## CHAPTER 1: 1. INTRODUCTION

Automobile ownership is a cornerstone of modern personal mobility and logistics. In contemporary households and commercial setups, individuals commonly manage multiple vehicles ranging across passenger hatchbacks, sedans, sports utility vehicles (SUVs), two-wheelers, and next-generation battery electric vehicles (EVs). Each vehicle requires disciplined attention to periodic service intervals, fluctuating fuel efficiency, wear-and-tear component lifespans, regulatory paperwork renewals, and manufacturer warranties. Neglecting any of these critical aspects leads to steep engine degradation, severe safety hazards, inflated ownership expenditures, and roadside penalties resulting from expired documentation.

Traditionally, vehicle owners have relied on fragmented and manual methods to organize vehicle health. These include physical paper service booklets, adhesive windshield oil-change reminder stickers, handwritten fuel logs, makeshift mobile notes, or standard calendar alarms. These legacy practices are notoriously unreliable: paper bills fade or get lost, reminders fail to account for dynamic mileage accumulation, fuel efficiency calculations are approximated or skipped, and document expiration deadlines pass unnoticed until traffic enforcement checks or roadside breakdowns occur.

While modern luxury vehicles incorporate onboard telematics and proprietary connected-car applications, these solutions suffer from significant drawbacks. They are restricted to specific automotive brands, require costly proprietary hardware subscriptions, depend heavily on OBD-II plug-in dongles that drain auxiliary 12V batteries, and raise severe data privacy concerns regarding driver telemetry tracking. Furthermore, they provide no unified interface for a multi-vehicle garage comprising vehicles of diverse manufacturers, models, and fuel types.

To address these systemic challenges, this project introduces **"MyVeel"**, a smart, hardware-independent multi-vehicle care and garage management platform. MyVeel eliminates reliance on external sensors and proprietary OBD devices by offering an intuitive, high-performance web application designed for comprehensive vehicle lifecycle oversight. Developed using Node.js, Express, TypeScript, React 18, and Prisma ORM, MyVeel centralizes vehicle profiles, odometer trends, periodic service histories, document compliance (RC, PUC), warranty tracking, fuel efficiency analytics, and emergency assistance into a single, cohesive dashboard.

*(Page 1)*

---

## CHAPTER 2: 2. PROBLEM STATEMENT & OBJECTIVE

### 2.1 Problem Statement
Multi-vehicle owners frequently experience cognitive overload and organizational friction due to the dispersed nature of vehicle maintenance schedules, expense records, and statutory documents. Routine maintenance tasks are either forgotten or postponed because service intervals depend on both elapsed time and dynamic odometer mileage. Legal compliance documents—specifically Pollution Under Control (PUC) certificates and motor insurance policies—frequently expire unnoticed, resulting in substantial traffic fines, policy invalidations, and forfeiture of claim benefits. Furthermore, fuel tracking is rarely logged accurately, making it impossible to detect deteriorating engine mileage or sudden fuel leakages. Existing commercial telematics systems fail to solve this problem because they require brand-locked hardware, costly OBD-II subscriptions, and continuous cellular connectivity. There is a compelling need for a centralized, hardware-independent platform that unifies multi-vehicle dossiers, tracks wear components, monitors regulatory expiries with staged alerts, and delivers actionable vehicular intelligence through an accessible digital dashboard.

### 2.2 Objectives
The primary objective of this project is to conceptualize, architect, develop, and evaluate **"MyVeel"**, a full-stack, hardware-independent vehicle care and garage management system. The system delivers an all-in-one digital operating dashboard that empowers vehicle owners to oversee maintenance, maintain regulatory adherence, track operational expenses, and preserve vehicle longevity.

To achieve this overall goal, the project encompasses the following specific objectives:

- **To Develop an All-Inclusive Multi-Vehicle Garage Management System:** Create a centralized repository where users can register, view, update, and manage detailed profiles for multiple combustion and electric vehicles, including make, model, year, registration number, fuel type, specifications, and photo dossiers.
- **To Implement an Intelligent Dual-Interval Maintenance & Reminder Engine:** Engineer an automated reminder algorithm that tracks service requirements based on calendar intervals (months), mileage thresholds (odometer readings), or whichever milestone occurs first, recalculating subsequent milestones automatically upon service completion.
- **To Build a Secure Legal Document Vault with Staged Expiry Notifications:** Implement a protected document management module for Registration Certificates (RC), Pollution Under Control (PUC) certificates, and road permits, featuring proactive warning alerts at 30, 15, and 7-day intervals before expiration.
- **To Deliver Fuel and Efficiency Analytics:** Provide comprehensive logging of fill-ups and EV charging sessions, calculating true fuel efficiency (kilometres per litre or kilometres per kilowatt-hour) strictly between consecutive full-tank refills without fabricating missing data.
- **To Track Component Lifecycle and Warranties:** Implement specialized sub-modules for monitoring tyre treadwear, wheel rotations, wheel alignments, auxiliary 12V battery installations, high-voltage EV battery health, and component manufacturer warranties with clear expiry dates.
- **To Integrate Vehicle Expense Analytics Without Duplicate Accounting:** Design a cohesive financial ledger that categorizes spending across fuel, servicing, insurance renewals, tolls, washes, and repairs, automatically synchronizing service and insurance expenditures without duplicate data entries.
- **To Provide Integrated Emergency Help & Nearby Automotive Utility Locator:** Curate 24/7 national roadside assistance helplines, emergency flatbed towing contacts, and an interactive geographic directory of verified local garages, tyre workshops, EV fast chargers, and fuel stations.
- **To Build a Secure, High-Performance Web Application:** Implement the system with modern web technologies (Node.js, Express, TypeScript, Prisma, SQLite, React 18, Tailwind CSS) adhering to a signature performance-automotive Black and Yellow aesthetic, strong password hashing (bcrypt), JWT authentication, and AES-256 encrypted storage for sensitive identity data such as driving licenses.

*(Pages 2–3)*

---

## CHAPTER 3: 3. BACKGROUND INFORMATION

Automotive maintenance is universally recognized as critical to operational safety, environmental compliance, and asset depreciation control. Internal combustion engines demand periodic oil changes, coolant flushes, and filter replacements to prevent mechanical seizure and catastrophic wear. Simultaneously, electric vehicles require thermal coolant monitoring, high-voltage battery state-of-health assessments, reduction gearbox inspections, and cabin air filtration management. Regardless of propulsion technology, all motor vehicles share common wear components including braking friction materials, tyres requiring periodic rotation every 8,000–10,000 km, and 12V lead-acid or lithium auxiliary batteries with finite 3 to 4-year lifespans.

In addition to mechanical upkeep, motor vehicle regulations across jurisdictions mandate continuous compliance. Statutory frameworks enforce valid vehicle registration, periodic environmental emission verification (such as PUC certification in India), and mandatory motor third-party liability insurance. Driving with expired documentation exposes motorists to severe statutory penalties, impoundment, and catastrophic financial liabilities in the event of third-party road collisions.

In contemporary software paradigms, existing vehicle management solutions fall into two polarized categories. On one end are hardware-centric telematics platforms that interface with vehicle Controller Area Network (CAN) buses via On-Board Diagnostics (OBD-II) dongles. While these systems provide real-time diagnostic trouble codes (DTC), they introduce prohibitive hardware acquisition costs, intermittent cellular connectivity requirements, vulnerability to vehicle electrical bus interference, and intrusive user location tracking. On the opposite end are rudimentary digital note-taking or spreadsheet templates that lack relational database integrity, automated cron scheduling, staged compliance notifications, and contextual analytics.

To bridge this substantial gap, **"MyVeel"** is conceptualized as an intelligent, user-centric software solution. By eliminating external hardware dependencies, MyVeel provides a democratic, accessible web platform where vehicle owners retain full agency over their data. Through streamlined manual record entry, relational database tracking, and background notification schedulers, MyVeel transforms vehicle management from a reactive, chaotic chore into an organized, proactive digital garage experience.

*(Page 4)*

---

## CHAPTER 4: 4. LITERATURE SURVEY

### 4.1: Cloud-Based Automotive Maintenance and Telematics Systems
Al-Taee et al. (2017) explored a cloud-enabled remote vehicle diagnostic and maintenance tracking framework utilizing on-board sensors and cellular communication gateways. Their architecture demonstrated the viability of aggregating vehicle health parameters into remote databases for predictive maintenance alerting. However, the study acknowledged that constant data telemetry over cellular networks incurs recurring subscription charges and limits adoption among budget-conscious and vintage vehicle owners. The proposed MyVeel platform adopts a hardware-independent paradigm, demonstrating that rigorous maintenance tracking and timely interval alerting can be achieved efficiently through structured, user-authenticated web entry without imposing hardware purchase costs.

### 4.2: Hardware-Independent Tracking vs. OBD-II Sensor Architectures
Castignani et al. (2015) conducted a comparative investigation into vehicle data acquisition methodologies, contrasting invasive in-vehicle bus loggers against external smartphone-based driver logging applications. Their findings confirmed that while OBD-II dongles provide granular telemetry, they face cross-manufacturer protocol incompatibilities, continuous power drain on the vehicle battery, and high user resistance due to privacy concerns. Conversely, smartphone and web-based driver recording systems offer higher usability, zero hardware friction, and broad universality across two-wheelers and commercial vehicles. MyVeel builds on this paradigm by eliminating OBD hardware constraints, supporting multi-brand garages from a single browser interface.

### 4.3: Intelligent Predictive Vehicle Maintenance & Reminders
Bhardwaj and Sharma (2020) analyzed preventative maintenance scheduling algorithms in fleet transport management. Their research established that linear time-based maintenance scheduling often leads to either over-servicing low-mileage vehicles or dangerously delaying maintenance on heavily driven assets. The authors emphasized the imperative of dual-factor tracking: dynamically evaluating both calendar progression and cumulative odometer mileage. MyVeel directly operationalizes this dual-factor methodology, dynamically recalculating service due dates and distance intervals upon every completed maintenance log, ensuring proactive alerts before component failure.

### 4.4: Digital Document Vaults & Compliance Verification Systems
Kumar and Patel (2021) examined digital document management strategies for automotive compliance in urban mobility ecosystems. Their investigation highlighted that a significant percentage of traffic violations and delayed insurance claim settlements stem directly from inadvertent document expiration, particularly for rapid-cycle certificates such as quarterly or semi-annual Pollution Under Control (PUC) tests. The authors highlighted that passive digital storage (such as cloud drive folders) is inadequate; compliance systems must employ proactive, staged reminder heuristics (e.g., 30, 15, and 7-day threshold warnings) to prompt user renewal action in advance. MyVeel incorporates this staged reminder architecture into its Document Vault and Insurance Management sub-systems, safeguarding motorists against accidental lapses and regulatory fines.

*(Pages 5–6)*

---

## CHAPTER 5: 5. PROPOSED SYSTEM

### 5.1 System Workflow
To resolve the shortcomings identified in existing vehicle management practices, we propose **"MyVeel"** — an intelligent multi-vehicle care, garage management, and compliance platform. The system operates through eleven tightly coupled functional modules:

1. **User Authentication & Profile Security:** Provides JWT-based token authentication with bcrypt password hashing. Users maintain customized settings, including currency (INR, USD, EUR), distance units (km/miles), and configurable reminder lead times.
2. **Multi-Vehicle Garage Management:** Supports complete CRUD operations for cars, SUVs, motorcycles, and EVs. Each vehicle record preserves nickname, make, model, year, registration number, fuel type, photo, current odometer, and detailed notes.
3. **Odometer & Mileage Tracking:** Enables timestamped odometer logging with chronological validation, anomaly detection (rejecting backwards readings unless flagged as corrections), and interactive trajectory line charts.
4. **Service History & Smart Reminders:** Maintains chronological service records with workshop names, descriptions, parts replaced, and costs. Integrates a dual date-and-mileage reminder engine that automatically computes subsequent service targets.
5. **Secure Document Vault:** Securely catalogs Registration Certificates (RC), PUC emissions certificates, road tax receipts, and permits. Incorporates automatic expiry calculation and status classification (Valid, Expiring Soon, Expired).
6. **Insurance Lifecycle Management:** Records policy numbers, insurers, coverage types (Comprehensive, Zero-Dep, Third-Party), premiums, and IDV values, featuring staged renewal warnings and policy history retention.
7. **Warranty & Component Tracking:** Tracks vehicle bumper-to-bumper warranties, component coverages, and high-voltage EV battery pack warranties with expiration countdowns.
8. **Tyre & Battery Health Management:** Monitors tyre tread installations, wheel rotation timestamps, alignment intervals, and auxiliary 12V battery replacements.
9. **Fuel Logs & True Efficiency Analytics:** Calculates precise fuel economy between consecutive full-tank refills, preventing fabricated statistics when data points are incomplete.
10. **Care Calendar & Recurring Vehicle Maintenance:** Manages scheduled vehicle washes, interior vacuuming, ceramic coating reapplications, and motorcycle drive-chain lubrication with recurrence rules (Weekly, Biweekly, Monthly).
11. **Emergency Assistance & Nearby Garage Locator:** Provides single-tap access to national 24/7 roadside assistance helplines, towing services, and a categorized local map of verified garages, tyre shops, fuel pumps, and EV chargers.
12. **Vehicle Dossier PDF Generator:** Generates comprehensive, downloadable vehicle history PDF reports consolidating vehicle specs, service logs, odometer trends, and documents for resale valuation and maintenance audits.

### 5.2 Expected Outcomes
The expected outcome of this project is a fully deployed, production-grade automotive management platform delivering tangible benefits to vehicle owners:

- **Centralized Multi-Vehicle Operations:** Eliminates scattered paper receipts and fragmented apps by housing all family or fleet vehicles within a unified control center.
- **Zero Regulatory Compliance Lapses:** Prevents costly traffic penalties and expired insurance claims through automated 30, 15, and 7-day staged reminder alerts.
- **Proactive Mechanical Health Maintenance:** Extends engine and component longevity by triggering timely dual-interval service and fluid replacement reminders.
- **Transparent Financial Intelligence:** Delivers complete expenditure visibility across fuel, repairs, insurance, and routine washes, preventing duplicate expense accounting.
- **Hardware-Free Accessibility:** Ensures maximum affordability and universal accessibility across desktop, tablet, and mobile devices without requiring expensive OBD-II dongles.
- **Rapid Emergency Response:** Equips drivers with instant roadside assistance contacts, flatbed recovery numbers, and verified nearby service centers during roadside emergencies.
- **Enhanced Resale Asset Value:** Provides verifiable, downloadable digital maintenance dossiers that validate authentic vehicle service history and odometer integrity to prospective buyers.
- **High-Performance Futuristic UI:** Delivers an engaging, ergonomic automotive dashboard experience adhering to modern accessibility, dark-mode ergonomics, and responsive layout standards.

*(Pages 7–9)*

---

## CHAPTER 6: 6. SYSTEM DESIGN AND ARCHITECTURE

### 6.1 Design Approach
MyVeel is architected around modern modular full-stack principles using a decoupled, three-tier architecture. Each tier operates with strict separation of concerns, communicating over structured RESTful JSON APIs. This guarantees exceptional performance, data integrity, security, and effortless horizontal scaling.

### 6.2 System Architecture
The three-tier architectural topology of MyVeel consists of:

1. **Presentation Tier (Frontend):** Built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Recharts. Implements a responsive dark automotive dashboard with contextual vehicle switching, real-time metrics, dynamic charts, and protected routing.
2. **Application Logic Tier (Backend):** Powered by Node.js, Express, and TypeScript. Implements REST controllers, Zod request validation, JWT authentication middleware, AES-256 cryptographic utilities, node-cron background reminder schedulers, and PDFKit report generation.
3. **Data Persistence Tier (Database):** Powered by Prisma ORM and SQLite, enforcing strict relational integrity, foreign key cascading, and indexed queries across 14 database models.

```
+---------------------------------------------------------------------------------+
|                               Presentation Layer                                |
|           React 18 • TypeScript • Tailwind CSS • Vite • Recharts • Lucide       |
|    Responsive Dark Automotive UI (#08090B, #FFD400) • Mobile & Desktop Shell    |
+---------------------------------------------------------------------------------+
                                       │ ▲
                        HTTP / REST    │ │   JSON Response
                                       ▼ │
+---------------------------------------------------------------------------------+
|                               Application Layer                                 |
|            Node.js • Express • TypeScript • Zod • JWT • bcryptjs • cron         |
|      REST API Controllers • Auth Guards • Reminder Engine • PDFKit Reports      |
+---------------------------------------------------------------------------------+
                                       │ ▲
                     Prisma Client API │ │   Relational Queries
                                       ▼ │
+---------------------------------------------------------------------------------+
|                                  Data Layer                                     |
|                             Prisma ORM & SQLite                                 |
|      Users • Vehicles • Odometer • Services • Reminders • Documents • Insurance  |
|          Warranties • Tyres & Battery • Fuel Logs • Expenses • Care Calendar    |
+---------------------------------------------------------------------------------+
```

### 6.3 Module Design

| No. | Module Name | Core Responsibility & Functional Scope |
| :---: | :--- | :--- |
| **1** | **Auth & Profile** | User registration, JWT login, profile settings, driving license encryption (AES-256). |
| **2** | **Garage Module** | Vehicle cataloging, CRUD operations, vehicle specifications, photo dossier. |
| **3** | **Odometer System** | Historical timestamped readings, anomaly checks, trend visualizer. |
| **4** | **Service & Reminders** | Maintenance logs, parts replaced, workshop details, dual date/km reminder engine. |
| **5** | **Document Vault** | Registration Certificate (RC), PUC, and road permits with 30/15/7-day staged alerts. |
| **6** | **Insurance Manager** | Policy tracking, IDV, cover types, year-to-year comparisons, and renewal workflow. |
| **7** | **Tyre & Battery** | Tyre tread wear, rotation timestamps, alignments, and auxiliary/EV battery health. |
| **8** | **Fuel & Analytics** | Fill-up and EV charging logs, true full-tank efficiency calculations (km/L, km/kWh). |
| **9** | **Emergency & Help** | 24/7 national roadside assistance helplines, towing contacts, and nearby services. |

### 6.4 Application Workflow

```
[Start / User Visit]
         │
         ▼
[Register / Login (JWT Authentication)]
         │
         ▼
[Select Vehicle / Onboard New Vehicle to Garage]
         │
         ├───────────────────┬───────────────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼
  [Log Odometer]     [Log Maintenance]    [Upload Document]    [Record Fuel Log]
         │                   │                   │                   │
         └───────────────────┴─────────┬─────────┴───────────────────┘
                                       │
                                       ▼
                       [Run Background Reminder Engine]
                   (Evaluate Date & Odometer Milestones)
                                       │
                                       ▼
                    [Generate Staged Expiry Notifications]
                         (30, 15, and 7-day Alerts)
                                       │
                                       ▼
                    [Display Metrics on Vehicle Dashboard]
                                       │
                                       ▼
                   [Download Vehicle History PDF Dossier]
```

*(Pages 10–12)*

---

## CHAPTER 7: 7. CONCLUSION

MyVeel is a comprehensive, production-quality vehicle management and digital garage platform developed to address the real-world complexities of multi-vehicle ownership. By offering a unified, hardware-independent solution, the project successfully resolves the chronic challenges of missed maintenance intervals, forgotten document renewals, untracked component wear, and unorganized operational expenses.

The project originated from an exhaustive analysis of existing automotive software and connected-car limitations. While traditional solutions either relied on error-prone paper logs or expensive, brand-locked OBD-II dongles, MyVeel establishes that proactive, intelligent vehicle care can be achieved democratically and securely via an accessible, modern web platform. The system successfully combines multi-vehicle profiling, odometer trajectory analysis, dual date-and-mileage maintenance scheduling, staged document compliance warnings (RC, PUC, insurance), tyre/battery health logs, true fuel efficiency computations, and emergency assistance.

With MyVeel, a vehicle owner can easily register multiple combustion and electric vehicles, record timestamped odometer updates, log maintenance tasks with exact parts and costs, receive proactive staged expiry notifications, and access verified roadside emergency services. The application enforces data integrity by rejecting fabricated fuel efficiencies and invalid backwards odometer readings, ensuring that all metrics reflect authentic vehicular realities. The responsive, automotive-themed Black and Yellow interface offers maximum legibility and ergonomic comfort across desktop, tablet, and mobile browsers.

In the future, MyVeel can be extended with optical character recognition (OCR) for automated physical RC/PUC document parsing, progressive web application (PWA) offline support with push notifications, scheduled recurring care integrations with regional mobile car washes, and OBD-II Bluetooth low-energy (BLE) optional telemetry integration for advanced enthusiasts. Overall, MyVeel demonstrates that an intuitive, full-stack digital platform can fundamentally elevate vehicular safety, streamline regulatory compliance, and optimize personal mobility management.

*(Page 13)*

---

## REFERENCES

- **[1]** M. A. Al-Taee, N. M. Al-Jobouri and W. Al-Nuaimy, "Cloud-based automotive telematics platform for predictive maintenance and real-time remote diagnostics," *IEEE Transactions on Intelligent Transportation Systems*, vol. 18, no. 8, pp. 2105–2117, Aug. 2017.
- **[2]** G. Castignani, T. Derrmann, R. Frank and T. Engel, "Smartphone-based vehicle telematics: Challenges and opportunities for hardware-independent driver and vehicle profiling," in *Proc. 2015 IEEE Intelligent Vehicles Symposium (IV)*, Seoul, South Korea, 2015, pp. 488–493.
- **[3]** P. Bhardwaj and V. Sharma, "Dynamic preventative maintenance scheduling algorithms for multi-vehicle transport fleets using dual-factor mileage thresholds," *International Journal of Automotive Engineering and Technologies*, vol. 9, no. 3, pp. 112–124, 2020.
- **[4]** A. Kumar and S. Patel, "Digital document management and staged notification architectures for motor vehicle statutory compliance," *Journal of Transport and Computer Information Systems*, vol. 12, no. 2, pp. 45–59, 2021.
- **[5]** Mozilla Developer Network, "MDN Web Docs: React, TypeScript, and Modern Web APIs." [Online]. Available: https://developer.mozilla.org (accessed 29 October 2026).
- **[6]** Node.js Foundation, "Node.js Documentation and Execution Runtime." [Online]. Available: https://nodejs.org/docs/ (accessed 29 October 2026).
- **[7]** Prisma Data Inc., "Prisma: Next-generation ORM for Node.js and TypeScript." [Online]. Available: https://www.prisma.io/docs/ (accessed 29 October 2026).
- **[8]** Express.js, "Fast, unopinionated, minimalist web framework for Node.js." [Online]. Available: https://expressjs.com (accessed 29 October 2026).

*(Page 14)*

---

## APPENDICES - SCREENSHOTS AND EVIDENCE

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Authentication & Onboarding Portal                           |
|---------------------------------------------------------------------------------|
|                      MYVEEL — SMART GARAGE CONTROL                              |
|          Sign in to your multi-vehicle dashboard or create your garage          |
|                                                                                 |
|   [ Email or Mobile ID:  user@myveel.com                             ]          |
|   [ Password:            ••••••••                                     ]          |
|                                                                                 |
|                          [ Sign In to Garage ]                                  |
+---------------------------------------------------------------------------------+
                    Figure 8.1: 01_MyVeel_Authentication_Portal
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Smart Garage Dashboard                                       |
|---------------------------------------------------------------------------------|
|  [ Active Vehicles: 3 ]  [ Upcoming Renewals: 2 ]  [ Monthly Spent: ₹12,850 ]   |
|                                                                                 |
|  [ Creta Stealth - 18,450 km ]   [ Meteor Cruiser - 9,820 km ]  [ Volt Runner ] |
|  • PUC Renewal in 10 Days (Warn) • 10K Service Due in 180 km    • LFP Healthy   |
|  • Zero-Dep Ins in 21 Days       • RC Valid till 2037           • 8-Yr Warranty |
|                                                                                 |
|  [ Log Fuel Fill-up ]    [ Record Service ]    [ Upload Doc ]   [ Add Odometer] |
+---------------------------------------------------------------------------------+
                    Figure 8.2: 02_Smart_Garage_Dashboard
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Multi-Vehicle Garage Directory                               |
|---------------------------------------------------------------------------------|
|  GARAGE FLEET (3 VEHICLES)                                    [ + Add Vehicle ] |
|                                                                                 |
|  1. Hyundai Creta SX(O) Turbo DCT [SUV] [Petrol] - KA01MJ4582    | Odo: 18,450km|
|  2. Royal Enfield Meteor 350 [Motorcycle] [Petrol] - KA05EL7731  | Odo:  9,820km|
|  3. Tata Nexon EV Empowered+ [EV] [Electric] - KA03EV8844        | Odo: 12,400km|
+---------------------------------------------------------------------------------+
                    Figure 8.3: 03_Multi_Vehicle_Garage_Directory
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Service & Maintenance History                                |
|---------------------------------------------------------------------------------|
|  VEHICLE: Creta Stealth (KA01MJ4582)                  [ + Log Service Record ]  |
|                                                                                 |
|  • Date: 2024-03-20 | Type: 10,000 km Scheduled Service | Cost: ₹6,450          |
|    Workshop: Advaith Hyundai Outer Ring Road                                    |
|    Parts: Shell Helix Ultra 5W-30 (3.8L), Oil Filter, Cabin Pollen Filter       |
|    Next Milestone Target: 20,000 km or 12 Months                                |
+---------------------------------------------------------------------------------+
                    Figure 8.4: 04_Service_and_Maintenance_History
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Document Vault Compliance                                    |
|---------------------------------------------------------------------------------|
|  STATUTORY COMPLIANCE RECORDS                           [ + Upload New Document]|
|                                                                                 |
|  [RC]  Registration Certificate  | KA01MJ4582RC9901 | Exp: 2038-03-14 | [VALID] |
|  [PUC] Emission Test Certificate | KA-01-2024-PUC   | Exp: in 10 Days | [WARN]  |
|  [INS] HDFC ERGO Zero Dep Policy | HDFC-MOT-889140  | Exp: in 21 Days | [WARN]  |
+---------------------------------------------------------------------------------+
                    Figure 8.5: 05_Document_Vault_Compliance
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Fuel Logs & True Efficiency Analytics                        |
|---------------------------------------------------------------------------------|
|  FUEL CONSUMPTION & EFFICIENCY TRENDS                   [ + Log Fuel Fill-up ]  |
|                                                                                 |
|  • Refill 4: 18,450 km | 24.1 L @ ₹103.10 = ₹2,485 | Efficiency: 14.50 km/L     |
|  • Refill 3: 18,100 km | 30.0 L @ ₹102.90 = ₹3,087 | Efficiency: 15.00 km/L     |
|  • Refill 2: 17,650 km | 30.2 L @ ₹102.80 = ₹3,105 | Efficiency: 14.90 km/L     |
|  • Refill 1: 17,200 km | 42.5 L @ ₹102.80 = ₹4,369 | Baseline Full-Tank Entry   |
+---------------------------------------------------------------------------------+
                    Figure 8.6: 06_Odometer_and_Fuel_Analytics
```

*(Pages 15–17)*

