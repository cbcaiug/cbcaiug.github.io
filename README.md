# The CBC AI Projects — Uganda

> Official unified web portal and administrative hub for **The CBC AI Projects**, an ecosystem of specialized AI-powered tools built specifically for Ugandan educators, administrators, and secondary schools implementing the **Competency-Based Curriculum (CBC)**.

<div align="center">

[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-10B981?style=for-the-badge&logo=github&logoColor=white)](https://cbcaiug.github.io)
[![Firebase Spark Tier](https://img.shields.io/badge/Firebase-Spark%20Tier-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6?style=for-the-badge)](https://opensource.org/licenses/MIT)

🚀 **[Visit Portal](https://cbcaiug.github.io)** • 🔐 **[Admin Console](https://cbcaiug.github.io/admin.html)** • 📱 **[WhatsApp Channel](https://whatsapp.com/channel/0029Vb6cj6J5vKAGEYH1Fk1d)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The CBC AI Projects Suite](#-the-cbc-ai-projects-suite)
- [Zero-Hosting-Cost Architecture](#-zero-hosting-cost-architecture)
- [Dynamic Admin Portal](#-dynamic-admin-portal)
- [Firestore Read & Write Optimization (Spark Plan)](#-firestore-read--write-optimization-spark-plan)
- [Local Development & Deployment](#-local-development--deployment)
- [Data Privacy & Responsible AI](#-data-privacy--responsible-ai)
- [Contact & Community](#-contact--community)

---

## 🎯 Overview

Uganda's lower secondary Competency-Based Curriculum demands significant shifts in pedagogy: competency scoring descriptors, continuous assessment items (CAI), activities of integration (AoI), and learner-centered schemes of work. 

**The CBC AI Projects** delivers purpose-built, accessible software tools tailored to Ugandan teachers and schools, minimizing administrative overhead so educators can invest their time directly into student learning.

---

## 🚀 The CBC AI Projects Suite

| Project | Category | Deployment / Repo | Core Capabilities |
|---|---|---|---|
| **The CBC AI Tool** | Curriculum & Lesson Planning | [teachwithai.vercel.app](https://teachwithai.vercel.app/) | NCDC-aligned lesson plans, schemes of work, scenario assessment generation, UCE Bio, interactive canvas editor. |
| **The CBC AI Timetable Scheduler** | School Operations | [timetable-ai](https://github.com/cbcaiug) | Gemini AI conflict-free scheduling engine, PDF/photo syllabus OCR, elective subject pools (Luganda, PE, Art), and Excel export. |
| **Student-Data Management System (SMS)** | Academic Records | [sms](https://github.com/cbcaiug) | Serverless student records on Google Sheets + Drive, continuous assessment marksheets, batch terminal report card generation. |
| **CAI & AoI Score Sheet Manager** | Grading & UNEB Assessment | [cbc-cai-score-sheet](https://github.com/cbcaiug/cbc-cai-score-sheet.git) | Automated computation of UNEB 20% Continuous Assessment Items (CAI) and Activities of Integration (AoI) 3-point descriptors. |
| **Valence Chemistry Puzzle Game** | Interactive STEM | [valence-game](https://github.com/cbcaiug/valence-game.git) | Gamified web learning app for chemical bonding, valency calculation, cation/anion balance, and electron sharing. |
| **The CBC AI Attendance Tracker** | Institutional Monitoring | [attendance](https://github.com/cbcaiug) | Installable PWA with 4 user roles (Student, Parent, Teacher, Administrator), instant notification channels, and webcal schedule feeds. |

---

## 🏗️ Zero-Hosting-Cost Architecture

All systems in the ecosystem are engineered to run reliably without recurring monthly hosting fees:
- **Landing & Directory Portal**: Hosted free via **GitHub Pages** (`cbcaiug.github.io`) with zero build dependencies.
- **Data & Synchronization**: Uses **Firebase Spark Tier** (Cloud Firestore + Firebase Authentication) for live link and project directory updates.
- **Institutional Records**: Google Apps Script, Google Sheets, and Google Drive serve as durable, zero-cost databases for school documents and marksheets.
- **Client Footprint**: Pure HTML5, modern Vanilla CSS, and lightweight Vanilla JavaScript (~60 KB total uncompressed). Loads in under 150ms even on 2G/3G mobile networks.

---

## 🛠️ Dynamic Admin Portal (`admin.html`)

The portal features an authenticated administrative console accessible at [`https://cbcaiug.github.io/admin.html`](https://cbcaiug.github.io/admin.html).

### Key Admin Capabilities
1. **Authentication**: Secure Firebase Auth using admin email credentials (`cbcaitool@gmail.com`) or Google Sign-In. Protected by Firestore security rules (`allow write: if isAdmin()`).
2. **Project Management**:
   - Add new projects instantly (automatically prepended to the top).
   - Reorder projects on the landing page using `⇈ Top`, `↑`, and `↓` buttons.
   - Edit deployment status: `Live`, `In Development`, `Beta`, or `Discontinued`.
   - Enable or disable the "Launch Application" button with automatic "Coming Soon" state rendering.
   - Update target URLs, categories, feature tags, and badges.
3. **Custom Channels & Social Links**: Add or toggle any link (WhatsApp, Phone, Email, YouTube, Facebook, X, etc.) with custom labels and icons.
4. **Announcement Bar**: Broadcast real-time announcements across the entire site header.
5. **In-App Confirmation Modals**: Native app dialogs replace all intrusive browser alert/confirm popups.
6. **One-Click Cloud Sync**: Writes directly to Firestore `settings/app_links` with local JSON backup export and import.

---

## ⚡ Firestore Read & Write Optimization (Spark Plan)

Because this portal shares the Firebase project (`cbcaiug-auth`) with **The CBC AI Tool**, preserving the free **Spark Tier daily quota (50,000 reads / 20,000 writes / resets at 10:00 AM EAT / Midnight Pacific)** is critical.

### How Read/Write Consumption Is Minimized:
1. **No Realtime `onSnapshot` Listeners**: Eliminates persistent WebSocket connections that consume read quotas on every reconnect or network drop.
2. **15-Minute Client-Side Cache**: Responses are cached in `localStorage` with a 15-minute TTL. Repeat visits and page refreshes cost **0 Firestore reads**.
3. **Single Consolidated Document Schema**: All projects, custom channels, and announcements are stored in a single document (`settings/app_links`). Fetching the entire directory costs exactly **1 read**.
4. **Offline Baseline Fallback (`js/config-defaults.js`)**: If the Firestore quota is reached or network connectivity is lost, the portal falls back seamlessly to embedded default data with **0 reads**.
5. **Batch Publishing**: Admin edits are staged locally and only written to Firestore when clicking **Publish to Cloud**, consuming exactly **1 write** per update.

---

## 💻 Local Development & Deployment

### Does This Project Need `npm install` or `npm run build`?
**No.** There are no Node.js dependencies, npm packages, or build pipelines.

### Running Locally
You can run any static web server in this directory:

```bash
# Using Python 3
python3 -m http.server 8080

# Or using PHP
php -S localhost:8080
```

Open `http://localhost:8080` in your browser.

### Deploying Changes
Simply commit and push to the `main` branch on GitHub:
```bash
git add .
git commit -m "Update portal showcase"
git push origin main
```
GitHub Pages automatically deploys the latest files within seconds.

---

## 🔒 Data Privacy & Responsible AI

- **No User Data for Model Training**: None of the educator inputs, lesson plans, or student data are ever used to train AI models.
- **Local Browser Storage**: Configurations and sessions remain stored securely on the educator's device or their own Google Drive storage.

---

## 📞 Contact & Community

- **Email**: [cbcaitool@gmail.com](mailto:cbcaitool@gmail.com)
- **WhatsApp Support**: [+256 750 470 234](https://wa.me/256750470234)
- **WhatsApp Community Channel**: [Join 1,000+ Teachers](https://whatsapp.com/channel/0029Vb6cj6J5vKAGEYH1Fk1d)
- **YouTube Channel**: [@cbcaiug](https://youtube.com/@cbcaiug)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.