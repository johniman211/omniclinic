# 🏥 OmniClinic SaaS

A high-performance, multi-tenant Clinic Management System (CMS) built for resilience, scalability, and clinical excellence.

## 🚀 Deployment Instructions for John

If you encounter the error `remote origin already exists` or `Repository not found`, follow these steps to reset your connection:

1. **Open Git Bash** and enter your project:
   ```bash
   cd /c/Users/pc/Desktop/omniclinic-saas
   ```

2. **Reset Remote and Push**:
   ```bash
   # Remove any existing incorrect remote
   git remote remove origin
   
   # Add your correct GitHub repository
   git remote add origin https://github.com/johniman211/omniclinic.git
   
   # Push to main branch
   git push -u origin main
   ```

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Recharts.
- **Backend/Database**: Supabase (PostgreSQL, Auth, Real-time).
- **AI Engine**: Google Gemini 3 API (`@google/genai`).
- **Bundler**: Vite 6.
- **PDF Engine**: jsPDF & html2canvas.

## 🔑 Environment Variables
Create a `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON=your_anon_key
NEXT_PUBLIC_SUPABASE_SERVICEROLEKEY=your_service_role_key
API_KEY=your_gemini_api_key
```

---
*Built with precision for modern medical practitioners in South Sudan and beyond.*
