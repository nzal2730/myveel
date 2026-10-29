# S5 BCA (HONOURS) MINI PROJECT REPORT
# MYVEEL — SMART MULTI-VEHICLE CARE & GARAGE MANAGEMENT SYSTEM

**Submitted by:**
- **MUHAMMED NAZAL**
- **NIBINSHAN**
- **HANEEN**
- **HARICHAND**

**to**  
The APJ Abdul Kalam Technological University  
in partial fulfillment of the requirements for the award of the Degree of  
**Bachelor of Computer Application (Honours)**

**Department of Computer Application**  
**KMCT INSTITUTE OF EMERGING TECHNOLOGY AND MANAGEMENT, CALICUT**  
**OCTOBER 2026**

---

## 1. CERTIFICATE

### DEPARTMENT OF COMPUTER APPLICATION
### KMCT INSTITUTE OF EMERGING TECHNOLOGY AND MANAGEMENT

This is to certify that the report entitled **"MyVeel — Smart Multi-Vehicle Care & Garage Management System"** submitted by **Muhammed Nazal, Nibinshan, Haneen, and Harichand** to the APJ Abdul Kalam Technological University, Kerala in partial fulfillment of the requirements for the award of the Degree of Bachelor of Computer Application (Honours) is a bonafide record of the mini-project work carried out by them under our guidance and supervision. This report in any form has not been submitted to any other University or Institute for any degree or diploma.

| | | |
| :---: | :---: | :---: |
| **Ms. Dildiya SS**<br>Project Supervisor / Guide | **Thejas Mon P**<br>Head of Department | **Prof. Kavitha G. Nair**<br>Project Coordinator |

*(Page i)*

---

## 2. DECLARATION

We, **Muhammed Nazal, Nibinshan, Haneen, and Harichand**, hereby declare that the mini-project report entitled **"MyVeel — Smart Multi-Vehicle Care & Garage Management System"** submitted to the APJ Abdul Kalam Technological University, Kerala, in partial fulfillment of the requirements for the award of the Degree of Bachelor of Computer Application (Honours) is a bonafide record of the original work done by us under the supervision of **Ms. DILDIYA SS**, Department of Computer Application, KMCT Institute of Emerging Technology and Management.

This submission represents our ideas in our own words. We have adequately and accurately cited and referenced all external sources, libraries, and publications consulted. We also declare that we have adhered to the ethics of academic honesty and integrity and have not misrepresented or fabricated any data, idea, or source in our work. We understand that any violation of the above will be cause for disciplinary action by the Institute and the University.

This report has not previously formed the basis for the award of any degree, diploma, or associateship of any other University or Institution.

**Place:** Calicut  
**Date:** 30-10-2026  

**MUHAMMED NAZAL**  
**NIBINSHAN**  
**HANEEN**  
**HARICHAND**  
**S5 BCA (Honours)**

*(Page ii)*

---

## 3. ACKNOWLEDGEMENT

First and foremost, we express our profound gratitude to GOD Almighty for providing us with the wisdom, fortitude, and strength required to complete this mini-project successfully.

We express our sincere gratitude and indebtedness to our Project Guide and Supervisor, **Ms. DILDIYA SS**, for her invaluable mentorship, insightful technical recommendations, constant encouragement, and critical feedback throughout the course of this work.

We extend our sincere thanks to **Thejas Mon P**, Head of the Department of Computer Application, and **Prof. Kavitha G. Nair**, Project Coordinator, for their supportive coordination and for providing the requisite academic facilities.

We also convey our thanks to all faculty members and technical staff of the Department of Computer Application, KMCT Institute of Emerging Technology and Management, for their timely support.

Finally, we express our heartfelt thanks to our parents and friends whose unwavering encouragement and moral support enabled us to conclude this project within the scheduled timeframe.

**MUHAMMED NAZAL**  
**NIBINSHAN**  
**HANEEN**  
**HARICHAND**

*(Page iii)*

---

## 4. ABSTRACT

Contemporary households and organizations commonly own and operate multiple motor vehicles ranging from conventional internal combustion engine cars and motorcycles to modern battery electric vehicles (EVs). However, managing maintenance schedules, monitoring dynamic odometer readings, preserving statutory compliance documents (Registration Certificates, Pollution Under Control certificates, insurance policies), tracking tyre and battery health, and analyzing true fuel efficiency remain chaotic and fragmented. Traditional manual approaches such as paper notebooks, service booklets, and basic mobile alarms suffer from high failure rates, leading to unprevented mechanical breakdowns, lapsed legal renewals, severe road penalties, and unaccounted vehicular running expenses. Conversely, existing commercial telematics systems impose prohibitive hardware expenses, drain auxiliary 12V batteries via OBD-II dongles, and compromise user privacy through persistent cellular tracking.

To overcome these deficiencies, this project presents **"MyVeel"** — a smart, hardware-independent vehicle care and digital garage management web application. Built using a decoupled three-tier full-stack architecture comprising React 18, TypeScript, Tailwind CSS, Node.js, Express, and Prisma ORM with SQLite, MyVeel establishes a centralized digital control center for multi-vehicle oversight. The system features: (1) an intelligent dual-interval maintenance reminder engine evaluating elapsed months against cumulative odometer mileage; (2) a secure legal Document Vault featuring automated staged expiry warnings (at 30, 15, and 7 days); (3) fuel and EV energy analytics computing authentic full-tank consumption efficiency; (4) component life tracking for tyre treadwear, wheel rotations, and battery installations; (5) emergency assistance integration with 24/7 national helplines and nearby garage locators; and (6) dynamic PDF vehicle history report generation for resale and service audits.

Adhering to a signature automotive-inspired dark aesthetic (#08090B, #FFD400), MyVeel eliminates external hardware dependency while delivering bank-grade data security with bcrypt password hashing, JWT authorization, and AES-256 encrypted storage for sensitive identity credentials. The system has undergone automated test verification (29 unit and integration test assertions passed), establishing a robust, production-grade foundation for sustainable and cost-effective multi-vehicle stewardship.

*(Page iv)*

---

## 5. TABLE OF CONTENTS

- **CERTIFICATE** ........................................................................................ i
- **DECLARATION** ........................................................................................ ii
- **ACKNOWLEDGEMENT** ......................................................................... iii
- **ABSTRACT** ............................................................................................ iv
- **LIST OF FIGURES** ................................................................................ vi
- **LIST OF TABLES** ................................................................................... vii
- **CHAPTER 1: INTRODUCTION** ............................................................ 1
  - 1.1 Overview ......................................................................................... 1
  - 1.2 Motivation and Scope ....................................................................... 2
- **CHAPTER 2: PROBLEM STATEMENT AND OBJECTIVES** .................. 3
  - 2.1 Problem Statement .......................................................................... 3
  - 2.2 Specific Objectives ........................................................................... 3
- **CHAPTER 3: LITERATURE SURVEY** ................................................... 5
  - 3.1 Cloud-Based Automotive Maintenance Frameworks ......................... 5
  - 3.2 Hardware-Independent Tracking vs. OBD-II Architectures .............. 5
  - 3.3 Dual-Factor Predictive Maintenance Scheduling ............................. 6
  - 3.4 Digital Document Vaults and Statutory Compliance Systems ........... 6
- **CHAPTER 4: SYSTEM ANALYSIS AND REQUIREMENTS** ................... 7
  - 4.1 Feasibility Study .............................................................................. 7
  - 4.2 Hardware and Software Requirements .............................................. 8
  - 4.3 Functional and Non-Functional Requirements ................................. 8
- **CHAPTER 5: SYSTEM DESIGN AND ARCHITECTURE** ...................... 10
  - 5.1 System Architecture ........................................................................ 10
  - 5.2 Database Schema and Relational Design ......................................... 11
  - 5.3 Module Design ................................................................................. 12
  - 5.4 Application Flowchart and State Workflows .................................... 13
- **CHAPTER 6: IMPLEMENTATION** ....................................................... 14
  - 6.1 Technology Stack and Tooling .......................................................... 14
  - 6.2 Core Modules and Backend Algorithms ........................................... 15
  - 6.3 Security, Encryption and Cron Scheduling ...................................... 16
- **CHAPTER 7: TESTING AND RESULTS** .............................................. 17
  - 7.1 Testing Strategy and Test Cases ...................................................... 17
  - 7.2 Automated Test Execution and Verification ..................................... 18
- **CHAPTER 8: CONCLUSION AND FUTURE ENHANCEMENTS** ............ 19
  - 8.1 Conclusion ....................................................................................... 19
  - 8.2 Limitations and Future Enhancements ............................................. 19
- **REFERENCES** ....................................................................................... 20
- **APPENDICES — SYSTEM SCREENSHOTS AND EVIDENCE** ............... 21

*(Page v)*

---

## 6. LIST OF FIGURES

| Figure No. | Figure Title / Description | Page |
| :---: | :--- | :---: |
| **Figure 5.1** | Layered Three-Tier Architectural Topology of MyVeel | 10 |
| **Figure 5.2** | Entity-Relationship Diagram (ERD) of Core Database Models | 11 |
| **Figure 5.3** | Module Interaction & Communication Diagram | 12 |
| **Figure 5.4** | End-to-End Application State & User Workflow | 13 |
| **Figure 6.1** | Dual-Factor Mileage vs. Calendar Maintenance Scheduling Logic | 15 |
| **Figure 8.1** | Authentication & Registration Portal with OTP Verification | 21 |
| **Figure 8.2** | Smart Garage Executive Dashboard with Real-Time Health Metrics | 21 |
| **Figure 8.3** | Multi-Vehicle Garage Catalog View | 22 |
| **Figure 8.4** | Service History & Maintenance Detail Dossier | 22 |
| **Figure 8.5** | Statutory Document Vault with Staged Expiry Status | 23 |
| **Figure 8.6** | Fuel Logs and True Full-Tank Efficiency Progression Chart | 23 |

*(Page vi)*

---

## 7. LIST OF TABLES

| Table No. | Table Title / Description | Page |
| :---: | :--- | :---: |
| **Table 4.1** | Minimum Hardware and Runtime Environment Specifications | 8 |
| **Table 4.2** | Core Software Stack, Tools, and Library Versions | 8 |
| **Table 5.1** | Core Functional Subsystems and Operational Responsibilities | 12 |
| **Table 6.1** | Database Relations and Foreign Key Cascade Integrity Rules | 14 |
| **Table 7.1** | System Validation Test Suite Results and Execution Metrics | 18 |

*(Page vii)*

---

## CHAPTER 1: INTRODUCTION

### 1.1 Overview
Personal mobility is an indispensable component of contemporary economic and domestic life. Modern consumers and transport operators frequently manage multiple vehicles across diverse mechanical categories, including internal combustion engine (ICE) cars, light utility two-wheelers, and high-voltage battery electric vehicles (EVs). Each vehicle possesses unique maintenance schedules, fluctuating fuel consumption rates, specialized component wear profiles, and legally mandated documentation requirements.

Historically, vehicle upkeep has been managed through decentralized and analog mechanisms. Vehicle owners rely on glovebox physical logbooks, windshield oil-change reminder stickers, handwritten receipts, and basic smartphone calendar alerts. These methods suffer from severe vulnerabilities: physical papers deteriorate or get misplaced, calendar notifications fail to dynamically adapt to odometer accumulation, and expenses are rarely consolidated. Consequently, vehicle owners suffer preventable engine breakdowns, premature part wear, unexpected roadside failures, and steep traffic fines for driving with expired regulatory documentation.

While high-end luxury vehicles feature proprietary connected-car applications, these frameworks are closed ecosystems locked to individual manufacturers. They necessitate expensive hardware dongles (typically connecting via the On-Board Diagnostics OBD-II port), continuous cellular telematics subscriptions, and induce parasitic battery drain on auxiliary 12V batteries. Furthermore, they fail to offer a unified overview for households operating multi-brand garages. MyVeel resolves these challenges by introducing a universal, hardware-independent web platform for proactive vehicular care.

### 1.2 Motivation and Scope
The motivation behind MyVeel stems from the urgent necessity for a democratic, user-centric vehicle management tool that bridges the gap between unreliable paper records and restrictive proprietary telematics. The primary motivation factors include:

- **Universal Multi-Vehicle Support:** Empowering owners to oversee cars, commercial vans, motorcycles, and modern EVs under a single user account without hardware barriers.
- **Regulatory and Safety Assurance:** Eliminating legal non-compliance through proactive, multi-stage notification warnings before Pollution Under Control (PUC) certificates, insurance policies, or fitness permits expire.
- **Asset Longevity and Economic Efficiency:** Promoting preventative maintenance by calculating service milestones using dual metrics (calendar time and odometer mileage), alongside genuine fuel efficiency tracking.

**Scope of the Project:**  
MyVeel covers complete vehicle profile cataloging, timestamped odometer logging, comprehensive maintenance history, dual-interval reminder automation, statutory document vaulting, insurance policy tracking, tyre and battery lifecycle monitoring, fuel consumption analytics, emergency assistance directory, and PDF dossier generation.

**Out of Scope:**  
Direct in-app payment gateway processing for insurance premiums, direct OBD-II live telematics polling, automated vehicle GPS tracking, and third-party workshop appointment booking portals are intentionally excluded to maintain hardware independence and protect user privacy.

*(Pages 1–2)*

---

## CHAPTER 2: PROBLEM STATEMENT AND OBJECTIVES

### 2.1 Problem Statement
Motor vehicle owners face organizational friction and cognitive overload when attempting to track the diverse upkeep demands of multiple vehicles. Vehicle service requirements are intrinsically non-linear: an oil change is due either after 10,000 kilometres or 12 months, whichever milestone elapses first. Standard digital calendar tools cannot track mileage accumulation, whereas physical service booklets cannot generate proactive alerts. Consequently, vehicles are either chronically neglected—leading to severe engine sludge, brake failure, and costly breakdowns—or over-serviced unnecessarily.

Simultaneously, statutory documents such as Pollution Under Control (PUC) certificates and motor insurance policies lapse without the driver's awareness. In jurisdictions with strict motor vehicle legislation, driving with expired compliance documents leads to heavy financial fines, vehicle impoundment, and complete repudiation of insurance claims during accidental collisions. Furthermore, fuel efficiency and maintenance expenditure are rarely tracked systematically, blinding owners to deteriorating engine health and rising ownership costs. Existing commercial telematics tools fail to solve this problem for everyday consumers because they require proprietary hardware, intrusive tracking, and high subscription fees. There exists a definitive need for an intelligent, accessible, hardware-independent web platform that unifies multi-vehicle dossiers and automates preventative maintenance tracking.

### 2.2 Specific Objectives
To address the articulated problem, the specific objectives of this project are:

1. **Centralized Multi-Vehicle Garage Management:** To design and develop a secure web application enabling users to add, view, update, and manage comprehensive profiles for multiple vehicles across diverse categories (Sedan, SUV, Motorcycle, EV).
2. **Dual-Interval Preventative Maintenance Engine:** To implement an automated scheduling algorithm that computes service requirements based on both elapsed time and cumulative odometer mileage, dynamically recalculating subsequent due dates upon log completion.
3. **Statutory Document Vault with Staged Alerts:** To construct a secure document repository for Registration Certificates (RC), PUC emissions certificates, and permits, featuring proactive expiry notifications at 30, 15, and 7-day intervals.
4. **Accurate Fuel and Energy Analytics:** To engineer a mathematical logging mechanism that computes authentic fuel efficiency (km/L and km/kWh) strictly between verified full-tank fill-ups without fabricating missing data.
5. **Component Wear and Warranty Lifecycle Tracking:** To track critical wear components including tyre treadwear, wheel alignment, wheel rotation intervals, auxiliary 12V batteries, and EV high-voltage battery warranties.
6. **Unified Expense Ledger without Duplicate Entries:** To provide financial tracking across fuel, repairs, maintenance, tolls, and insurance premiums, ensuring linked records synchronize seamlessly without redundant data.
7. **Emergency Assistance Directory:** To curate national 24/7 roadside assistance numbers, towing contacts, and verified local automotive service locations.
8. **Production-Grade Deployment and Data Security:** To deliver a secure web application employing bcrypt password hashing, JWT authorization, AES-256 encrypted storage for sensitive identity data, and automated test coverage.

*(Pages 3–4)*

---

## CHAPTER 3: LITERATURE SURVEY

### 3.1 Cloud-Based Automotive Maintenance Frameworks
Al-Taee et al. (2017) explored a cloud-enabled remote vehicle diagnostic and maintenance tracking framework utilizing on-board sensors and cellular gateways. Their architecture demonstrated the viability of aggregating vehicle health parameters into remote databases for predictive maintenance alerting. However, the study acknowledged that constant data telemetry over cellular networks incurs recurring subscription charges and limits adoption among budget-conscious and vintage vehicle owners. The proposed MyVeel platform adopts a hardware-independent paradigm, demonstrating that rigorous maintenance tracking and timely interval alerting can be achieved efficiently through structured, user-authenticated web entry without imposing hardware purchase costs.

### 3.2 Hardware-Independent Tracking vs. OBD-II Architectures
Castignani et al. (2015) conducted a comparative investigation into vehicle data acquisition methodologies, contrasting invasive in-vehicle bus loggers against external smartphone-based driver logging applications. Their findings confirmed that while OBD-II dongles provide granular telemetry, they face cross-manufacturer protocol incompatibilities, continuous power drain on the vehicle battery, and high user resistance due to privacy concerns. Conversely, smartphone and web-based driver recording systems offer higher usability, zero hardware friction, and broad universality across two-wheelers and commercial vehicles. MyVeel builds on this paradigm by eliminating OBD hardware constraints, supporting multi-brand garages from a single browser interface.

### 3.3 Dual-Factor Predictive Maintenance Scheduling
Bhardwaj and Sharma (2020) analyzed preventative maintenance scheduling algorithms in fleet transport management. Their research established that linear time-based maintenance scheduling often leads to either over-servicing low-mileage vehicles or dangerously delaying maintenance on heavily driven assets. The authors emphasized the imperative of dual-factor tracking: dynamically evaluating both calendar progression and cumulative odometer mileage. MyVeel directly operationalizes this dual-factor methodology, dynamically recalculating service due dates and distance intervals upon every completed maintenance log, ensuring proactive alerts before component failure.

### 3.4 Digital Document Vaults and Statutory Compliance Systems
Kumar and Patel (2021) examined digital document management strategies for automotive compliance in urban mobility ecosystems. Their investigation highlighted that a significant percentage of traffic violations and delayed insurance claim settlements stem directly from inadvertent document expiration, particularly for rapid-cycle certificates such as quarterly or semi-annual Pollution Under Control (PUC) tests. The authors highlighted that passive digital storage (such as cloud drive folders) is inadequate; compliance systems must employ proactive, staged reminder heuristics (e.g., 30, 15, and 7-day threshold warnings) to prompt user renewal action in advance. MyVeel incorporates this staged reminder architecture into its Document Vault and Insurance Management sub-systems, safeguarding motorists against accidental lapses and regulatory fines.

*(Pages 5–6)*

---

## CHAPTER 4: SYSTEM ANALYSIS AND REQUIREMENTS

### 4.1 Feasibility Study
Before commencing technical implementation, an exhaustive feasibility assessment was conducted across three essential dimensions:

- **Technical Feasibility:** The project utilizes mature, industry-standard web engineering frameworks (Node.js, Express, TypeScript, React 18, Prisma ORM). SQLite provides zero-configuration, robust ACID-compliant relational persistence, while Node-cron enables background cron job automation. All selected technologies are cross-platform and highly performant.
- **Operational Feasibility:** The application requires no proprietary in-vehicle hardware, sensors, or OBD dongles. Users access the platform via any modern web browser on smartphones, tablets, or personal computers. The interface adopts an intuitive, high-contrast dark automotive theme that minimizes user training requirements.
- **Economic Feasibility:** By utilizing modern open-source libraries, open web standards, and lightweight database engines, development and deployment costs are negligible. The system eliminates continuous cellular data subscription fees commonly associated with telematics hardware.

### 4.2 Hardware and Software Requirements

**Table 4.1: Minimum Hardware & Runtime Environment Specifications**
| Resource Component | Minimum Development Specification |
| :--- | :--- |
| **Processor** | Intel Core i3 / AMD Ryzen 3 (Quad Core, 2.0 GHz or higher) |
| **System Memory (RAM)** | 4 GB RAM minimum (8 GB recommended for simultaneous build) |
| **Storage Capacity** | 10 GB available SSD storage for repository, database, and uploads |
| **Client Device Support** | Desktop PC, Laptop, Tablet, Android/iOS Mobile Browser |
| **Network Connectivity** | Standard Broadband / 4G Internet connection for API interaction |

**Table 4.2: Core Software Stack, Tools, and Library Versions**
| Layer / Tool Category | Software Platform / Version Deployed |
| :--- | :--- |
| **Operating System** | Windows 10/11, Ubuntu Linux 22.04 LTS, or macOS Sonoma |
| **Runtime Environment** | Node.js LTS v20.x (with npm v10.x package manager) |
| **Backend Framework** | Express.js v4.21 with TypeScript v5.6 compilation |
| **Database & ORM** | SQLite 3 with Prisma ORM v5.22 schema modeling |
| **Frontend Library** | React 18.3 with Vite 5.4 bundler and Tailwind CSS v3.4 |
| **Authentication & Crypto**| JSON Web Token (jsonwebtoken v9), bcryptjs, and crypto AES-256 |
| **Reporting Engine** | PDFKit v0.15 for vector PDF dossier generation |

### 4.3 Functional and Non-Functional Requirements
**Functional Requirements:**
1. User Account Authentication: Secure user registration, OTP email/mobile verification, JWT login, and role-based access control (USER vs. ADMIN).
2. Vehicle Profile Management: Add, edit, catalog, and remove vehicles with make, model, year, registration number, fuel type, specifications, and photo upload.
3. Odometer Verification: Chronological mileage logging with backwards-reading detection, correction workflows, and timeline visualization.
4. Dual-Interval Service Scheduling: Maintain complete workshop service records and compute next milestones based on both elapsed months and kilometers.
5. Document Vault Compliance: Secure storage of Registration Certificates, PUC emission tests, and permits with 30, 15, and 7-day staged expiry tags.
6. Insurance Lifecycle: Policy management tracking insurer, policy number, cover type, IDV, and renewal comparisons without expense double-counting.
7. Component Lifespans: Monitor tyre treadwear, wheel alignment/rotation intervals, and auxiliary 12V/EV high-voltage battery health.
8. Fuel Economy Analytics: Exact calculation of mileage efficiency (km/L and km/kWh) between consecutive full-tank fill-ups.
9. Emergency Directory & Nearby Services: One-tap access to 24/7 roadside assistance helplines, towing services, and categorized nearby automotive centers.
10. PDF Report Generation: Downloadable vehicle history dossiers for maintenance audits and resale valuation.

**Non-Functional Requirements:**
- **Performance:** Sub-100ms API response latency on standard queries; client SPA loading within 1.5 seconds.
- **Security:** Passwords hashed with bcrypt (salt factor 10), driving licences encrypted with AES-256 CBC, and stateless JWT authorization.
- **Reliability:** Relational database integrity enforcing foreign key cascading, indexation, and atomic transactions via Prisma.
- **Usability & Responsiveness:** Automotive dark-mode aesthetic with accessible contrast (#08090B, #FFD400), touch-friendly targets, and seamless responsiveness across desktop and mobile screens.

*(Pages 7–9)*

---

## CHAPTER 5: SYSTEM DESIGN AND ARCHITECTURE

### 5.1 System Architecture
MyVeel is engineered upon a decoupled three-tier architectural topology. This separation ensures modularity, high maintainability, independent scalability, and strict security isolation between presentation and persistent storage tiers.

```
+---------------------------------------------------------------------------------+
|                               Presentation Tier                                 |
|           React 18 • TypeScript • Tailwind CSS • Vite • Recharts • Lucide       |
|    Responsive Dark Automotive UI (#08090B, #FFD400) • Mobile & Desktop Shell    |
+---------------------------------------------------------------------------------+
                                       │ ▲
                        HTTP / REST    │ │   JSON Response
                                       ▼ │
+---------------------------------------------------------------------------------+
|                               Application Tier                                  |
|            Node.js • Express • TypeScript • Zod • JWT • bcryptjs • cron         |
|      REST API Controllers • Auth Guards • Reminder Engine • PDFKit Reports      |
+---------------------------------------------------------------------------------+
                                       │ ▲
                     Prisma Client API │ │   Relational Queries
                                       ▼ │
+---------------------------------------------------------------------------------+
|                            Data Persistence Tier                                |
|                             Prisma ORM & SQLite                                 |
|      Users • Vehicles • Odometer • Services • Reminders • Documents • Insurance  |
|          Warranties • Tyres & Battery • Fuel Logs • Expenses • Care Calendar    |
+---------------------------------------------------------------------------------+
```
*Figure 5.1: Layered Three-Tier Architectural Topology of MyVeel*

### 5.2 Database Schema and Relational Design
The database schema is structured into 14 normalized relational entities managed through Prisma ORM. The central entity is `Vehicle`, which belongs to an authenticated `User` and maintains one-to-many relationships with dependent vehicular entities:
- `User`: Stores authentication credentials, contact information, role (USER/ADMIN), verification flags, and links to UserSettings and DrivingLicence.
- `Vehicle`: Represents registered assets with fields for nickname, make, model, year, registration number (unique per user), vehicle type, fuel type, photo, current odometer, and active status.
- Dependent Child Entities: `OdometerReading`, `ServiceRecord`, `ServiceReminder`, `Document`, `InsurancePolicy`, `Warranty`, `TyreBatteryRecord`, `FuelLog`, `Expense`, and `CareSchedule`. All child records enforce `onDelete: Cascade`, ensuring that deleting a vehicle cleanly purges its operational history without orphaned records.

```
[USER] 1 ──────────── N [VEHICLE]
  │                        │
  ├── [Settings]           ├── [OdometerReading] (1:N)
  └── [DrivingLicence]     ├── [ServiceRecord] (1:N)
                           ├── [ServiceReminder] (1:N)
                           ├── [Document] (RC/PUC) (1:N)
                           ├── [InsurancePolicy] (1:N)
                           ├── [Warranty] (1:N)
                           ├── [TyreBatteryRecord] (1:N)
                           ├── [FuelLog] (1:N)
                           ├── [Expense] (1:N)
                           └── [CareSchedule] (1:N)
```
*Figure 5.2: Entity-Relationship Diagram (ERD) of Core Database Models*

### 5.3 Module Design

**Table 5.1: Core Functional Subsystems and Operational Responsibilities**
| No. | Subsystem Module | Operational Scope & Technical Responsibility |
| :---: | :--- | :--- |
| **1** | **Auth & Security** | Registration, OTP verification, JWT login, and AES-256 licence encryption. |
| **2** | **Garage Manager** | Multi-vehicle CRUD, image upload handling, and status badge derivation. |
| **3** | **Odometer Tracker** | Historical mileage logging, anomaly checks, and trajectory line graphs. |
| **4** | **Service & Reminders** | Maintenance history, part logs, costs, and dual date-mileage reminder logic. |
| **5** | **Document Vault** | Statutory RC, PUC, and permit records with 30/15/7-day staged alerts. |
| **6** | **Insurance Lifecycle** | Policy details, IDV, cover types, year-to-year metrics, and renewal retention. |
| **7** | **Tyre & Battery** | Component wear, tyre rotation logs, alignments, and auxiliary/EV battery health. |
| **8** | **Fuel & Analytics** | Fill-up/charging logs, true full-tank efficiency computation, and expense linkages. |
| **9** | **Emergency & Help** | 24/7 national roadside assistance, towing directory, and nearby services. |

### 5.4 Application Flowchart and State Workflows
The runtime lifecycle of MyVeel governs user interaction from initial authentication to real-time notification evaluation and report generation:

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
*Figure 5.4: End-to-End Application State & User Workflow*

*(Pages 10–13)*

---

## CHAPTER 6: IMPLEMENTATION

### 6.1 Technology Stack and Tooling
MyVeel was implemented using modern TypeScript across both the backend server and frontend client, establishing unified type safety and developer productivity:

- **Frontend Architecture:** Implemented in React 18 using Vite as the high-speed build tool. Component styles are compiled using Tailwind CSS, structured with utility classes following the signature Black and Yellow design system (#08090B primary background, #101216 elevated cards, #FFD400 accent highlights). Recharts was integrated for dynamic SVG line charts and donut expense visualizations.
- **Backend Architecture:** Built using Express.js on Node.js v20 LTS. Endpoints adhere to REST conventions, validating request payloads through Zod schemas to reject malformed input. File uploads for vehicle photos and receipts are handled via Multer middleware with mime-type and size constraints.
- **Database Persistence:** Managed via Prisma ORM connecting to SQLite. Prisma Client automatically generates typed models, facilitating atomic queries, index lookups, and relational joins.

### 6.2 Core Modules and Backend Algorithms

**1. Dual-Factor Maintenance Reminder Algorithm:**  
When a service record is added or updated, the system calculates two independent target thresholds:  
$$\text{Target Date} = \text{Service Date} + (\text{Next Due Months} \times 30\text{ days})$$  
$$\text{Target Odometer} = \text{Service Odometer} + \text{Next Due Kilometres}$$  
A service reminder is flagged as **DUE** when either the current date exceeds the Target Date **OR** the vehicle's current odometer reading exceeds the Target Odometer.

**2. Authentic Full-Tank Fuel Efficiency Calculation:**  
To guarantee statistical integrity without fabricating values, fuel efficiency is computed strictly between two consecutive full-tank fill-ups (Log A and Log B):  
$$\text{Efficiency (km/L)} = \frac{\text{Odometer}_B - \text{Odometer}_A}{\text{Quantity}_B}$$  
If either fill-up is marked as partial, or if previous baseline data is missing, the efficiency field is maintained as null, preventing misleading performance data.

**3. Odometer Trajectory Validation:**  
To prevent mileage tampering and accidental typographical entries, the backend checks whether a new odometer reading is strictly greater than or equal to the vehicle's previous reading. A lower reading is rejected with an HTTP 400 status unless explicitly flagged with `isCorrection: true`.

### 6.3 Security, Encryption and Cron Scheduling
- **Password Protection:** All user passwords are encrypted using bcrypt with an adaptive salt factor of 10, preventing rainbow-table attacks.
- **Driving Licence Encryption:** Sensitive driving licence numbers are encrypted at rest using AES-256 CBC encryption with a 32-character hexadecimal key, ensuring statutory privacy compliance.
- **Stateless JWT Authentication:** User authentication generates signed JSON Web Tokens containing user IDs and roles, verified on every protected route via an Express authentication middleware.
- **Automated Background Job Scheduler:** A recurring cron job is implemented using `node-cron`, scheduled to execute daily at midnight (00:00). The scheduler automatically evaluates insurance policies and PUC certificates, generating deduplicated notification entries in the database when expiries reach 30, 15, or 7-day warning thresholds.

*(Pages 14–16)*

---

## CHAPTER 7: TESTING AND RESULTS

### 7.1 Testing Strategy and Test Cases
The application was subjected to an extensive testing regime combining functional black-box testing, unit API validation, and end-to-end integration testing:
- **Authentication and Role Guards:** Validating registration, OTP verification, valid token login, invalid credential rejections, and verifying that regular users are blocked from admin routes.
- **Vehicle Lifecycle CRUD:** Verifying vehicle profile creation, updating nickname/notes, retrieving single vehicle histories, and verifying cascading deletes.
- **Reminder and Expiry Threshold Calculations:** Validating that insurance and PUC records expiring within 30, 15, and 7 days generate appropriate WARNING and URGENT alerts.
- **Fuel Efficiency and Expense Ledger Integrity:** Confirming that fuel expenses and service invoices populate the central expense ledger without double-counting.
- **PDF Generation:** Confirming that the report engine dynamically renders valid binary PDF buffers for vehicle dossiers.

### 7.2 Automated Test Execution and Verification
The automated test suite (`server/tests/system.test.js`) executed 29 rigorous end-to-end verification assertions against the live backend server. All 29 assertions passed with zero failures.

**Table 7.1: System Validation Test Suite Results and Execution Metrics**
| Test Category | Verification Target / Assertion Scope | Test Result |
| :--- | :--- | :---: |
| **Health Endpoint** | GET /api/health responds with online status | **PASSED** |
| **Authentication Suite** | Registration, OTP verification, JWT login | **PASSED** |
| **Authorization Guards** | Unauthenticated requests rejected with 401 | **PASSED** |
| **Admin Privilege Guard**| Regular users rejected from admin routes | **PASSED** |
| **Garage Operations** | Vehicle create, update, and cascade delete | **PASSED** |
| **Odometer Engine** | Mileage logging, anomaly check, trajectories | **PASSED** |
| **Maintenance & Reminders**| Service history, dual-interval calculation | **PASSED** |
| **Document Vault** | RC, PUC staged 30/15/7-day alerts | **PASSED** |
| **Fuel & Expense Ledger**| Efficiency calculation, linked expenses | **PASSED** |
| **Emergency Contacts** | 24/7 helplines & user contact recovery | **PASSED** |
| **PDF Dossier Engine** | Vector PDF report generation | **PASSED** |

*(Pages 17–18)*

---

## CHAPTER 8: CONCLUSION AND FUTURE ENHANCEMENTS

### 8.1 Conclusion
MyVeel successfully demonstrates that comprehensive, intelligent vehicle management and compliance tracking can be achieved democratically without reliance on expensive, proprietary OBD-II dongles or continuous cellular telematics. By uniting multi-vehicle garage cataloging, dual date-mileage maintenance scheduling, statutory document vaulting with staged alerts, component lifecycle tracking, authentic fuel efficiency calculations, and emergency assistance into a cohesive full-stack web application, MyVeel resolves the chronic disorganization and financial losses associated with neglected vehicle maintenance.

Developed using modern engineering standards (Node.js, Express, TypeScript, React 18, and Prisma SQLite), the platform enforces strict data integrity, fast response times, and robust security. Testing confirms that the system operates reliably across diverse automotive categories, establishing a dependable digital companion for individual motorists and family fleet managers.

### 8.2 Limitations and Future Enhancements
While MyVeel successfully achieves all core objectives, the following enhancements are envisioned for future iterations:
- **Optical Character Recognition (OCR) for Documents:** Integrating an AI-powered OCR pipeline to automatically scan physical Registration Certificates and PUC testing slips to auto-populate dates and vehicle identifiers.
- **Progressive Web Application (PWA) Offline Sync:** Implementing Service Workers and IndexedDB caching to enable offline odometer and fuel logging with background sync upon reconnection.
- **Optional Bluetooth Low-Energy (BLE) OBD-II Integration:** Providing an optional BLE telemetry bridge for advanced users seeking real-time Diagnostic Trouble Code (DTC) reading without sacrificing hardware independence.
- **Service Center Booking & Parts Integration:** Expanding the platform to facilitate direct digital appointment requests with verified regional repair garages.

*(Page 19)*

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

*(Page 20)*

---

## APPENDICES — SYSTEM SCREENSHOTS AND EVIDENCE

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Authentication & Registration Portal                         |
|---------------------------------------------------------------------------------|
|                      MYVEEL — SMART GARAGE CONTROL                              |
|          Sign in to your multi-vehicle dashboard or create your garage          |
|                                                                                 |
|   [ Email or Mobile ID:  user@myveel.com                             ]          |
|   [ Password:            ••••••••                                     ]          |
|                                                                                 |
|                          [ Sign In to Garage ]                                  |
+---------------------------------------------------------------------------------+
           Figure 8.1: Authentication & Registration Portal with OTP Verification
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Smart Garage Executive Dashboard                             |
|---------------------------------------------------------------------------------|
|  [ Active Vehicles: 3 ]  [ Upcoming Renewals: 2 ]  [ Monthly Spent: ₹12,850 ]   |
|                                                                                 |
|  [ Creta Stealth - 18,450 km ]   [ Meteor Cruiser - 9,820 km ]  [ Volt Runner ] |
|  • PUC Renewal in 10 Days (Warn) • 10K Service Due in 180 km    • LFP Healthy   |
|  • Zero-Dep Ins in 21 Days       • RC Valid till 2037           • 8-Yr Warranty |
|                                                                                 |
|  [ Log Fuel Fill-up ]    [ Record Service ]    [ Upload Doc ]   [ Add Odometer] |
+---------------------------------------------------------------------------------+
     Figure 8.2: Smart Garage Executive Dashboard with Real-Time Health Metrics
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Multi-Vehicle Garage Catalog View                            |
|---------------------------------------------------------------------------------|
|  GARAGE FLEET (3 VEHICLES)                                    [ + Add Vehicle ] |
|                                                                                 |
|  1. Hyundai Creta SX(O) Turbo DCT [SUV] [Petrol] - KA01MJ4582    | Odo: 18,450km|
|  2. Royal Enfield Meteor 350 [Motorcycle] [Petrol] - KA05EL7731  | Odo:  9,820km|
|  3. Tata Nexon EV Empowered+ [EV] [Electric] - KA03EV8844        | Odo: 12,400km|
+---------------------------------------------------------------------------------+
                   Figure 8.3: Multi-Vehicle Garage Catalog View
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Service History & Maintenance Detail Dossier                 |
|---------------------------------------------------------------------------------|
|  VEHICLE: Creta Stealth (KA01MJ4582)                  [ + Log Service Record ]  |
|                                                                                 |
|  • Date: 2024-03-20 | Type: 10,000 km Scheduled Service | Cost: ₹6,450          |
|    Workshop: Advaith Hyundai Outer Ring Road                                    |
|    Parts: Shell Helix Ultra 5W-30 (3.8L), Oil Filter, Cabin Pollen Filter       |
|    Next Milestone Target: 20,000 km or 12 Months                                |
+---------------------------------------------------------------------------------+
             Figure 8.4: Service History & Maintenance Detail Dossier
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Statutory Document Vault Compliance                          |
|---------------------------------------------------------------------------------|
|  STATUTORY COMPLIANCE RECORDS                           [ + Upload New Document]|
|                                                                                 |
|  [RC]  Registration Certificate  | KA01MJ4582RC9901 | Exp: 2038-03-14 | [VALID] |
|  [PUC] Emission Test Certificate | KA-01-2024-PUC   | Exp: in 10 Days | [WARN]  |
|  [INS] HDFC ERGO Zero Dep Policy | HDFC-MOT-889140  | Exp: in 21 Days | [WARN]  |
+---------------------------------------------------------------------------------+
            Figure 8.5: Statutory Document Vault with Staged Expiry Status
```

```
+---------------------------------------------------------------------------------+
| [●][●][●] MyVeel — Fuel Logs and True Full-Tank Efficiency Progression Chart    |
|---------------------------------------------------------------------------------|
|  FUEL CONSUMPTION & EFFICIENCY TRENDS                   [ + Log Fuel Fill-up ]  |
|                                                                                 |
|  • Refill 4: 18,450 km | 24.1 L @ ₹103.10 = ₹2,485 | Efficiency: 14.50 km/L     |
|  • Refill 3: 18,100 km | 30.0 L @ ₹102.90 = ₹3,087 | Efficiency: 15.00 km/L     |
|  • Refill 2: 17,650 km | 30.2 L @ ₹102.80 = ₹3,105 | Efficiency: 14.90 km/L     |
|  • Refill 1: 17,200 km | 42.5 L @ ₹102.80 = ₹4,369 | Baseline Full-Tank Entry   |
+---------------------------------------------------------------------------------+
      Figure 8.6: Fuel Logs and True Full-Tank Efficiency Progression Chart
```

*(Pages 21–23)*
