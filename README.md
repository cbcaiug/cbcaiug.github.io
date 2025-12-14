# AI Educational Assistant Suite for Uganda's CBC

A suite of specialized AI-powered tools designed to support educators in Uganda with the Competency-Based Curriculum (CBC). This project aims to reduce administrative workload and empower teachers to focus on what matters most: their students.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-brightgreen)](https://cbcaiug.github.io)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](mailto:cbcaitool@gmail.com)

🚀 **[Launch App](https://cbcaiug.github.io)** • 📹 **[Watch Demo](https://youtu.be/KGplNQfdf_w)** • 📱 **[Join WhatsApp](https://whatsapp.com/channel/0029Vb6cj6J5vKAGEYH1Fk1d)**

[Report Bug](mailto:cbcaitool@gmail.com?subject=Bug%20Report) · [Request Feature](mailto:cbcaitool@gmail.com?subject=Feature%20Request) · [WhatsApp Support](https://wa.me/256750470234)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Access Tiers](#-access-tiers)
- [Assistants Available](#️-assistants-available)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
- [Installation as PWA](#-installation-as-pwa)
- [API Providers Supported](#-api-providers-supported)
- [Data Privacy & Security](#-data-privacy--security)
- [Disclaimer](#️-disclaimer)
- [Project Creator](#-project-creator)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The AI Educational Assistant is specifically designed for Ugandan educators adapting to the Competency-Based Curriculum. This platform provides specialized AI assistants with custom-built prompts aligned to Uganda's NCDC framework, helping teachers create lesson plans, assessments, and schemes of work in minutes instead of hours.

**Key Benefits:**
- ⏱️ Reclaim 10+ hours per week
- 📚 NCDC-aligned content generation
- 🔒 Privacy-focused (chat history stored locally)
- 📱 Works on any device (mobile, tablet, desktop)
- 🌐 Progressive Web App (installable)
- 🆓 Generous free tier available

---

## ✨ Core Features

### User Accounts & Quotas
- **Firebase Authentication:** Secure sign-up with email/password or Google Sign-In
- **Three Access Tiers:** Guest, Free, and Pro tiers with different quota limits
- **Real-time Sync:** Quotas sync across all devices via Cloud Firestore
- **Quota Management:** Transparent tracking of messages, downloads, and copy actions

### Specialized AI Assistants
- **14+ AI Assistants:** Each with custom-built prompts designed for Uganda's CBC educational context
- **NCDC-Aligned:** All prompts follow official curriculum guidelines
- **Versatile Use Cases:** Lesson planning, assessment creation, schemes of work, grading assistance

### Backend Prompt Management
- **Google Apps Script Storage:** Core prompts stored securely on backend server
- **Fetched on Demand:** Prompts retrieved when assistant is selected
- **Not Hardcoded:** Prompts not embedded in client-side source files
- **Note:** Prompts are visible in browser Network tab when fetched (standard web architecture)

### Multi-API & Model Support
- **Major Providers:** Google Gemini, Anthropic Claude, OpenAI GPT, Groq Llama, DeepSeek, Qwen
- **Seamless Switching:** Change models based on preference and availability
- **Shared Keys:** Use provided shared keys or bring your own for extended usage

### Real-time Streaming
- **Live Responses:** AI responses stream in real-time for fast, interactive experience
- **Progressive Display:** See content as it's generated
- **Efficient UX:** No waiting for complete responses

### File Uploads
- **Vision Support:** Attach syllabus pages, images, or documents
- **Context-Rich:** Provide AI with visual context for accurate materials
- **Model Compatibility:** Works with vision-enabled models (Gemini, GPT-4 Vision, Claude 3)

### Export Capabilities
- **Multiple Formats:** Copy to clipboard, download as Word/PDF
- **Google Docs Integration:** Save directly to Google Docs with one click
- **Cross-Platform:** Works on any device with browser

### Admin Dashboard
- **Real-time Monitoring:** Track active users and quota usage
- **User Management:** View and manage user accounts
- **Analytics:** Service usage patterns and statistics

### Responsive Design
- **Modern UI:** Clean glass morphism interface
- **Mobile-First:** Works beautifully on all screen sizes
- **Dark Theme:** Easy on the eyes for extended use
- **Accessible:** Designed for users with varying technical skills

---

## 💳 Access Tiers

Three tiers are available to suit different needs:

### 🎭 Guest Access (No Account Required)
Perfect for trying out the platform before creating an account.

- **Messages:** 30 AI conversations
- **Document Saves:** 5 Google Docs exports
- **Copy Actions:** 5 clipboard copies
- **API Key Slots:** 3 custom API keys

### 🆓 Free Account (Sign Up Required)
Ideal for regular use with expanded quotas.

- **Messages:** 50 AI conversations
- **Document Saves:** 20 Google Docs exports
- **Copy Actions:** 20 clipboard copies
- **API Key Slots:** 6 custom API keys

### ⭐ Pro Tier (Contact for Access)
For power users who need maximum capacity.

- **Messages:** 100 AI conversations
- **Document Saves:** 100 Google Docs exports
- **Copy Actions:** 100 clipboard copies
- **Exclusive Features:** Priority support, early access to new assistants

**Want Extended Usage?** Add your own API keys (free from Google Gemini) for usage beyond tier limits.

📄 **Full Comparison:** Visit [cbcaiug.github.io/billing.html](https://cbcaiug.github.io/billing.html)

---

## 🛠️ Assistants Available

| Assistant Name | Description | Best For |
|---|---|---|
| **Item Writer** | Generates scenario-based assessment items with structured scoring guides | Creating tests, quizzes, and exams |
| **UCE BIO Item Writer** | Specialized biology assessment items for Uganda Certificate of Education level | UCE Biology assessments |
| **Lesson Plans (NCDC)** | Creates detailed lesson plans following the official NCDC template | Daily lesson preparation |
| **Lesson Plans (with Biblical Integration)** | NCDC lesson plans with integrated biblical values and Christian worldview | Faith-based schools |
| **UACE SoW NCDC** | Comprehensive schemes of work for Uganda Advanced Certificate of Education level | A-Level planning |
| **Scheme of Work NCDC** | Develops structured schemes of work based on CBC syllabus requirements | Term/year planning |
| **Scheme of Work (with Biblical Integration)** | CBC schemes of work incorporating biblical principles and Christian values | Faith-based curriculum planning |
| **Lesson Notes Generator** | Produces comprehensive and well-structured notes for any topic | Student handouts, study materials |
| **UCE Project Assistant** | Guides students through UCE project planning and execution | Student project supervision |
| **AI in Education Coach** | Provides guidance on integrating AI tools into classroom teaching | Professional development |
| **Essay Grading Assistant** | Helps grade student essays based on specified rubrics and criteria | Marking and feedback |
| **Coteacher** | All-purpose teaching assistant for questions and brainstorming | General teaching support |
| **Data & Document Analyst** | Analyzes educational data, documents, and research materials with AI insights | Data analysis, research |
| **Prompt Assistant** | AI-powered prompt engineering and optimization for educational content | Advanced AI usage |

---

## 💻 Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)

</div>

### Frontend
- **React:** Via CDN for component-based UI
- **Tailwind CSS:** Utility-first styling
- **Marked.js:** Markdown rendering for AI responses
- **Vanilla JavaScript:** Core application logic

### Backend
- **Google Apps Script:** Secure prompt storage and document creation
- **Firebase Authentication:** User account management
- **Cloud Firestore:** Real-time quota tracking and sync

### Deployment
- **GitHub Pages:** Static site hosting
- **Custom Domain:** cbcaiug.github.io

### APIs Integrated
- **Google Gemini API:** Primary AI provider
- **OpenAI API:** GPT-4, GPT-3.5 models
- **Anthropic API:** Claude models
- **Groq API:** Llama models
- **DeepSeek API:** DeepSeek models
- **Qwen API:** Alibaba Cloud Qwen models

---

## 🔧 How It Works

### User Authentication
1. Visit [cbcaiug.github.io](https://cbcaiug.github.io)
2. Sign up with email/password or Google Sign-In
3. Account created with Firebase Authentication
4. Initial quotas assigned automatically

### Quota System
- **Guest Users:** Limited trial quotas without account
- **Free Accounts:** Expanded quotas upon registration
- **Real-time Tracking:** Quotas sync across devices via Firestore
- **Quota Reset:** Based on tier-specific policies

### AI Interaction
1. Select a specialized assistant
2. Backend fetches assistant's custom prompt from Google Apps Script
3. Provide input (text, files, syllabus pages)
4. AI generates content using fetched prompt + your input
5. Review and refine the output
6. Export to Word, PDF, or Google Docs

### API Key Options
- **Shared Keys:** Use provided keys for free tier quotas
- **Bring Your Own Key (BYOK):** Add personal API keys for extended usage
- **Storage:** Keys stored in browser localStorage (visible in DevTools, not sent to backend servers)
- **Privacy:** Keys are sent directly from your browser to AI providers (Google, OpenAI, etc.)

### Data Storage
- **Local (Your Device):** Chat history, API keys, settings (browser localStorage)
- **Cloud (Firestore):** Email, quotas, last active timestamp, tier status
- **Exported Docs:** Google Drive (for quality improvement, no personal info attached)

---

## 🚀 Getting Started

### Quick Start (3 Steps)

1. **Visit the App**
   ```
   https://cbcaiug.github.io
   ```

2. **Create Account**
   - Click "Sign Up"
   - Use email/password or Google Sign-In
   - Receive free quotas automatically

3. **Start Creating**
   - Select an assistant
   - Enter your requirements
   - Review and export content

### Optional: Add Your Own API Key

For extended usage beyond tier limits:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Go to Settings → API Keys
3. Add your key
4. Enjoy extended usage (subject to provider limits)

**Other Providers:**
- [OpenAI](https://platform.openai.com/api-keys) (Paid)
- [Anthropic](https://console.anthropic.com/settings/keys) (Paid)
- [Groq](https://console.groq.com/keys) (Free tier available)
- [DeepSeek](https://platform.deepseek.com/api_keys) (Paid)
- [Qwen](https://dashscope.console.aliyun.com/apiKey) (Paid)

---

## 📱 Installation as PWA

Install the app on your device for quick access and offline viewing of stored chat history.

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Install app" or "Add to Home screen"
4. App icon appears on home screen

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (↑)
3. Select "Add to Home Screen"
4. App icon appears on home screen

### Desktop (Chrome, Edge, Brave)
1. Open the app in browser
2. Click the install icon in address bar
3. Confirm installation
4. App appears in applications

### What Works Offline
- ✅ View previously stored chat history (saved in browser)
- ✅ Browse UI and cached pages
- ✅ Access application settings
- ❌ Send new messages to AI (requires internet connection)
- ❌ Fetch prompts from backend (requires internet)
- ❌ Export to Google Docs (requires internet)

**Note:** AI functionality requires an active internet connection since models are cloud-based. The PWA primarily enables quick access and viewing of stored conversations.

---

## 🔌 API Providers Supported

### Google Gemini
- **Models:** Gemini 1.5 Pro, Gemini 1.5 Flash
- **Free Tier:** Yes (via Google AI Studio)
- **Best For:** General use, Ugandan context understanding
- **Vision Support:** Yes

### OpenAI
- **Models:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Free Tier:** No
- **Best For:** Complex reasoning, creative tasks
- **Vision Support:** Yes (GPT-4 Vision)

### Anthropic Claude
- **Models:** Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Free Tier:** No
- **Best For:** Long-form content, ethical considerations
- **Vision Support:** Yes (Claude 3 models)

### Groq
- **Models:** Llama 3, Mixtral
- **Free Tier:** Yes
- **Best For:** Fast responses, open-source preference
- **Vision Support:** No

### DeepSeek
- **Models:** DeepSeek Chat, DeepSeek Coder
- **Free Tier:** No
- **Best For:** Technical content, coding assistance
- **Vision Support:** No

### Qwen (Alibaba Cloud)
- **Models:** Qwen-Turbo, Qwen-Plus
- **Free Tier:** No
- **Best For:** Multilingual support, technical tasks
- **Vision Support:** Yes

---

## 🔒 Data Privacy & Security

### What's Stored Locally (Your Device)
- ✅ Chat history
- ✅ API keys (visible in browser DevTools, not sent to backend servers, sent directly to AI providers)
- ✅ Application settings
- ✅ User preferences

**You Control:** Clear at any time via browser settings

### What's Stored in Cloud (Firestore)
- ✅ Email address
- ✅ Quota usage (messages, saves, copies)
- ✅ Last active timestamp
- ✅ Tier status (Guest/Free/Pro)

**Security:** Firebase Security Rules restrict access

### What's NOT Stored
- ❌ Chat content (stays on your device)
- ❌ Personal student information
- ❌ Payment card details

### What's Visible in Browser DevTools
- ⚠️ **API Keys:** Stored in localStorage, visible if you open DevTools → Application → Local Storage
- ⚠️ **Prompts:** Visible in Network tab when fetched from backend (standard web architecture)
- ⚠️ **Chat History:** Visible in localStorage

**Security Note:** This is standard web application behavior. Your API keys are sent directly from your browser to AI providers (not to our backend servers). Never share your browser's localStorage data or API keys with others.

### Data Usage
- **Exported Documents:** May be reviewed for quality improvement (no personal info attached)
- **Analytics:** Anonymous usage patterns via Google Analytics
- **Third-Party APIs:** Your prompts sent to selected AI provider only

📄 **Full Details:** [Privacy Policy](https://cbcaiug.github.io/privacy.html)

---

## ⚠️ Disclaimer

### AI-Generated Content Advisory

The content generated by AI is intended as a **draft or starting point**, not a final product. While the models are powerful, they can:

- ❌ Make factual errors
- ❌ Generate culturally inappropriate content
- ❌ Produce biased or incomplete information
- ❌ Misunderstand Ugandan educational context
- ❌ Create content that doesn't align with NCDC standards

### User Responsibilities

Teachers **must**:
- ✅ Review all AI-generated content thoroughly
- ✅ Verify accuracy and appropriateness
- ✅ Adapt content to their specific classroom needs
- ✅ Ensure alignment with NCDC curriculum
- ✅ Consider cultural and local context
- ✅ Use professional judgment before implementation

### Limitation of Liability

The Service accepts no liability for:
- Educational outcomes or student performance
- Inaccuracies in AI-generated content
- Third-party service interruptions (AI providers, Google)
- Data loss due to browser issues

📄 **Full Terms:** [Terms of Service](https://cbcaiug.github.io/terms.html)

---

## 👨💻 Project Creator

<div align="center">

**Derrick Musamali**  
Secondary School Teacher (Biology & Chemistry)  
Kampala, Uganda

[![Email](https://img.shields.io/badge/Email-cbcaitool%40gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:cbcaitool@gmail.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-%2B256750470234-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/256750470234)
[![Channel](https://img.shields.io/badge/Updates-WhatsApp_Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb6cj6J5vKAGEYH1Fk1d)

</div>

### Mission
To empower Ugandan educators with AI tools that reduce administrative burden and allow more time for meaningful student interaction.

### Background
As a practicing teacher, the challenges of adapting to CBC while managing heavy workloads were experienced firsthand. This platform was built to solve real problems faced by teachers every day.

### Support the Project
This tool will always have a free tier available for teachers. For those who wish to support ongoing development:
- 💝 [Support the Creator](https://cbcaiug.github.io/gift.html)
- ⭐ Upgrade to Pro tier for expanded quotas
- 📣 Share with fellow educators

---

## 🤝 Contributing

<div align="center">

[![Report Bug](https://img.shields.io/badge/🐛_Report-Bug-red?style=for-the-badge)](mailto:cbcaitool@gmail.com?subject=Bug%20Report)
[![Request Feature](https://img.shields.io/badge/💡_Request-Feature-blue?style=for-the-badge)](mailto:cbcaitool@gmail.com?subject=Feature%20Request)
[![WhatsApp Support](https://img.shields.io/badge/💬_Get-Support-25D366?style=for-the-badge&logo=whatsapp)](https://wa.me/256750470234)

</div>

### Feedback Welcome
- 🐛 **Bug Reports:** Found an issue? [Report via email](mailto:cbcaitool@gmail.com?subject=Bug%20Report) or [WhatsApp](https://wa.me/256750470234)
- 💡 **Feature Requests:** Have an idea? [Submit a request](mailto:cbcaitool@gmail.com?subject=Feature%20Request)
- 📝 **Content Suggestions:** Know how to improve prompts? Let us know!
- ⭐ **Reviews:** Share your experience with colleagues

### For Developers
This is currently a closed-source project, but feedback and suggestions are always welcome.

### For Educators
The best way to contribute is:
1. Use the tool and provide honest feedback
2. Share with fellow teachers
3. Report any issues or inaccuracies
4. Suggest new assistants or features

---

## 📜 License

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

This project is licensed under the MIT License.

### What This Means
- ✅ Free to use for educational purposes
- ✅ No warranty provided (use at your own risk)
- ✅ Content you generate is yours
- ❌ Service ownership and code remain with creator
- ❌ No commercial use without authorization

See the [LICENSE](LICENSE) file for full details.

---

## 📚 Additional Resources

### Documentation
- [About the Project](https://cbcaiug.github.io/about.html)
- [Frequently Asked Questions](https://cbcaiug.github.io/faq.html)
- [Access Tiers & Plans](https://cbcaiug.github.io/billing.html)
- [Privacy Policy](https://cbcaiug.github.io/privacy.html)
- [Terms of Service](https://cbcaiug.github.io/terms.html)

### Video Guides
- 🎥 [Full Tutorial](https://youtu.be/KGplNQfdf_w)
- 🎥 [Quick Demo](https://youtu.be/YXsOnmAD1Lg)

### Sample Outputs
- 📄 [Generated Lesson Plans](https://cbcaiug.github.io/samples.html)
- 📄 [Assessment Items](https://cbcaiug.github.io/samples.html)
- 📄 [Schemes of Work](https://cbcaiug.github.io/samples.html)

---

## 🌟 Acknowledgments

- **Ugandan Teachers:** For inspiring this project through their dedication
- **NCDC:** For the Competency-Based Curriculum framework
- **AI Providers:** Google, OpenAI, Anthropic, Groq, DeepSeek, Alibaba Cloud
- **Open Source Community:** For the tools and libraries that made this possible
- **Firebase Team:** For authentication and database infrastructure
- **Early Adopters:** For testing and feedback

---

## 📞 Get Help

<div align="center">

### Need Assistance?

[![Email Support](https://img.shields.io/badge/📧_Email-Support-red?style=for-the-badge)](mailto:cbcaitool@gmail.com)
[![WhatsApp Chat](https://img.shields.io/badge/💬_WhatsApp-Chat-25D366?style=for-the-badge&logo=whatsapp)](https://wa.me/256750470234)
[![Updates Channel](https://img.shields.io/badge/📱_Join-Updates-25D366?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/channel/0029Vb6cj6J5vKAGEYH1Fk1d)

**Response Time**
- General Inquiries: Within 48 hours
- Bug Reports: Within 24 hours
- Pro Tier Support: Priority handling

</div>

---

<div align="center">

**Built with ❤️ for Ugandan Educators**

*Empowering teachers to teach smarter, not harder.*

[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://cbcaiug.github.io)

</div>