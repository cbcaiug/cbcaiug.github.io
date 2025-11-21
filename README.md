# CBC AI Tool - Educational Assistant Suite

AI-powered educational tools for Uganda's Competency-Based Curriculum (CBC).

## 🎯 Overview

A suite of specialized AI assistants designed for Ugandan educators, featuring:
- Lesson plan generation (NCDC templates)
- Assessment item writing
- Scheme of work development
- Essay grading assistance
- Biblical integration options
- Multi-model AI support (Google Gemini, OpenAI, Claude, etc.)

## 🚀 Quick Start

### For Users
Visit: `https://cbc-ai-tool.netlify.app/`

### For Developers
1. Clone repository
2. Open `ai-suite-assets/app.html` in browser
3. Use Live Server for local development

## 📁 Project Structure

```
cbc-ai-tool/
├── ai-suite-assets/          # Main application
│   ├── js/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   └── utils/            # Helper functions
│   ├── css/                  # Stylesheets
│   ├── app.html              # Main app entry
│   ├── index.html            # Landing page
│   └── GAS.js                # Google Apps Script backend
├── .amazonq/rules/           # AI coding assistant rules
├── CART_WORKFLOW_GUIDE.md    # Cart system documentation
├── DEV_ADMIN_LINKS.md        # Testing links
└── DEPLOYMENT.md             # Deployment guide
```

## 🔑 Key Features

- **50 Free Trial Generations** with shared API keys
- **Multi-Model Support**: Gemini, GPT, Claude, Llama, Deepseek, Qwen
- **Vision Support**: Upload images for analysis
- **Google Search Grounding**: Real-time web search integration
- **Document Export**: Save to Google Docs (DOCX/PDF)
- **Session Persistence**: Chat history auto-saves
- **Mobile Optimized**: Works on phones and tablets

## 🛠️ Tech Stack

- **Frontend**: React 18 (via CDN), Tailwind CSS
- **Backend**: Google Apps Script
- **Hosting**: Netlify
- **Analytics**: Google Analytics, Custom event tracking
- **AI APIs**: Google Gemini, OpenAI, Anthropic, Groq, Deepseek, Qwen

## 📚 Available Assistants

1. **Coteacher** - General teaching assistant
2. **Item Writer** - Assessment item generation
3. **Lesson Plans (NCDC)** - Standard lesson plans
4. **Lesson Plans (Biblical)** - Faith-integrated plans
5. **Scheme of Work (NCDC)** - Curriculum planning
6. **Scheme of Work (Biblical)** - Faith-integrated schemes
7. **UACE SoW NCDC** - Advanced level schemes
8. **Lesson Notes Generator** - Lecture notes
9. **UCE Project Assistant** - Student project guidance
10. **AI in Education Coach** - AI integration guidance
11. **Essay Grading Assistant** - Automated grading
12. **Data & Document Analyst** - Data analysis
13. **UCE BIO Item Writer** - Biology assessments
14. **Prompt Assistant** - Prompt engineering

## 🔧 Configuration

### API Keys
Users can add their own API keys in Settings, or use the shared trial keys (50 free uses).

### Backend URL
Located in `js/services/api.js`:
```javascript
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/.../exec';
```

## 📖 Documentation

- [Cart Workflow Guide](CART_WORKFLOW_GUIDE.md) - Payment and cart system
- [Dev/Admin Links](DEV_ADMIN_LINKS.md) - Testing URLs
- [Mobile Download Fix](MOBILE_DOWNLOAD_FIX.md) - Download implementation
- [Deployment Guide](DEPLOYMENT.md) - How to deploy

## 🧪 Testing

### Admin Mode
Add `?admin=true` to URL for testing:
```
https://cbc-ai-tool.netlify.app/app.html?admin=true
```

### Specific Assistant
```
https://cbc-ai-tool.netlify.app/app.html?assistant=Coteacher
```

## 🤝 Contributing

1. Follow the coding rules in `.amazonq/rules/`
2. Test on both desktop and mobile
3. Update documentation for new features
4. Use admin mode for testing

## 📝 License

Proprietary - All rights reserved

## 👤 Author

Derrick Musamali
- WhatsApp: +256726654714
- Email: derrickmusamali@gmail.com

## 🙏 Support

If you find this tool helpful, consider supporting via the gift page:
`https://cbc-ai-tool.netlify.app/gift.html`
