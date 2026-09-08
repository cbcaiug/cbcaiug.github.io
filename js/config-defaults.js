/**
 * The CBC AI Projects — Default Configuration
 */

window.CBC_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkileHkaS3AymxvNnNAA_c0peWaL8RLTI",
  authDomain: "cbcaiug-auth.firebaseapp.com",
  projectId: "cbcaiug-auth",
  storageBucket: "cbcaiug-auth.firebasestorage.app",
  messagingSenderId: "570813240478",
  appId: "1:570813240478:web:d6b177bca3e291f25ed78f"
};

window.CBC_DEFAULT_CONFIG = {
  announcement: {
    enabled: false,
    badge: "New",
    text: "",
    url: ""
  },
  projects: [
    {
      id: "cbc-ai-tool",
      title: "The CBC AI Tool",
      subtitle: "AI Educational Assistant",
      category: "Teaching & Planning",
      url: "https://teachwithai.vercel.app/",
      description: "Generate NCDC-aligned lesson plans, schemes of work, assessment items, and essay grading — all tailored to Uganda's Lower Secondary CBC framework.",
      tags: ["Lesson Plans", "Schemes of Work", "Assessment Items", "Free Tier"],
      badge: "Flagship",
      status: "Live",
      icon: "sparkles",
      enabled: true,
      highlight: true
    },
    {
      id: "timetable-ai",
      title: "CBC AI Timetable Scheduler",
      subtitle: "Clash-Free School Scheduling",
      category: "School Operations",
      url: "https://teachwithai.vercel.app/",
      description: "Upload existing timetables as PDF, photos, or Excel. AI detects conflicts, balances teacher loads, and generates clean schedules you can edit and export.",
      tags: ["AI Scheduling", "Conflict Detection", "PDF/Photo Import", "Excel Export"],
      badge: "",
      status: "Live",
      icon: "calendar",
      enabled: true,
      highlight: false
    },
    {
      id: "sms",
      title: "Student Management System",
      subtitle: "Records, Marks & Report Cards",
      category: "Academic Records",
      url: "https://teachwithai.vercel.app/",
      description: "Manage student profiles, record continuous assessment marks with an inline marksheet editor, auto-compute grades, and generate batch report cards.",
      tags: ["Student Profiles", "Marksheets", "Grade Computation", "Report Cards"],
      badge: "",
      status: "Live",
      icon: "users",
      enabled: true,
      highlight: false
    },
    {
      id: "score-sheet",
      title: "CAI & AoI Score Sheet Manager",
      subtitle: "UNEB Continuous Assessment",
      category: "Assessment",
      url: "https://github.com/cbcaiug/cbc-cai-score-sheet.git",
      description: "Record and standardize Continuous Assessment Items (CAI) and Activities of Integration (AoI) using official UNEB criterion descriptors.",
      tags: ["CAI Scoring", "AoI Rubrics", "UNEB Standards"],
      badge: "",
      status: "Live",
      icon: "clipboard",
      enabled: true,
      highlight: false
    },
    {
      id: "valence-game",
      title: "Chemistry Puzzle Game",
      subtitle: "Valence & Chemical Bonding",
      category: "Interactive Learning",
      url: "https://github.com/cbcaiug/valence-game.git",
      description: "A puzzle game that helps students master chemical formulas, valency, and ionic bonding through interactive challenges.",
      tags: ["Chemistry", "Gamified Learning", "Valency"],
      badge: "",
      status: "Live",
      icon: "atom",
      enabled: true,
      highlight: false
    },
    {
      id: "attendance",
      title: "CBC AI Attendance Tracker",
      subtitle: "Real-Time Monitoring & Alerts",
      category: "Institutional",
      url: "https://teachwithai.vercel.app/",
      description: "Track student attendance across classes with dedicated portals for students, parents, teachers, and administrators. Instant missed-class alerts and calendar sync.",
      tags: ["4 User Roles", "Parent Alerts", "Calendar Sync", "Installable PWA"],
      badge: "",
      status: "Live",
      icon: "check-circle",
      enabled: true,
      highlight: false
    }
  ],
  contacts: [
    {
      id: "whatsAppChannel",
      label: "WhatsApp Updates",
      sublabel: "News, tips & feature updates",
      url: "https://whatsapp.com/channel/0029Vb6cj6J5vKAGEYH1Fk1d",
      icon: "whatsapp",
      enabled: true
    },
    {
      id: "supportWhatsApp",
      label: "Direct WhatsApp",
      sublabel: "Instant direct chat",
      url: "https://wa.me/256750470234",
      icon: "whatsapp",
      enabled: true
    },
    {
      id: "supportGroup",
      label: "Educators Community",
      sublabel: "CBC Teachers Group Chat",
      url: "https://chat.whatsapp.com/HMKYpOlNO1OFIImNZzJCrJ",
      icon: "users",
      enabled: false
    },
    {
      id: "supportPhone",
      label: "Phone Call",
      sublabel: "Voice inquiries",
      url: "tel:+256750470234",
      icon: "phone",
      enabled: true
    },
    {
      id: "supportEmail",
      label: "Email",
      sublabel: "Send official inquiry",
      url: "mailto:cbcaitool@gmail.com",
      icon: "mail",
      enabled: true
    },
    {
      id: "youtube",
      label: "YouTube Tutorials",
      sublabel: "Video guides & walkthroughs",
      url: "https://youtube.com/@derrickmusamali?si=Uj9cP9L93dSTLIMc",
      icon: "youtube",
      enabled: true
    },
    {
      id: "facebook",
      label: "Facebook",
      sublabel: "",
      url: "",
      icon: "facebook",
      enabled: false
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      sublabel: "",
      url: "",
      icon: "x-twitter",
      enabled: false
    },
    {
      id: "instagram",
      label: "Instagram",
      sublabel: "",
      url: "",
      icon: "instagram",
      enabled: false
    }
  ],
  customLinks: [
    {
      id: "training-reg",
      label: "Teacher Training Registration",
      sublabel: "Sign up for workshops",
      url: "register.html",
      icon: "graduation-cap",
      enabled: true,
      badge: "Workshop"
    }
  ]
};
