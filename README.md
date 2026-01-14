# 🏗️ Vijako ERP - Construction Management System

**Version**: 2.0.0  
Live Demo: [Coming Soon on Vercel]  
Documentation: [See `.agent/` folder]

---

## 📋 Overview

Vijako ERP is a comprehensive enterprise resource planning system specifically designed for construction companies. Built with modern web technologies and cloud infrastructure.

### Key Features:
- 📊 **Project Management** - Track all construction projects
- 📄 **Contract Management** - Manage contracts, bidding, guarantees
- 💰 **Finance & Payments** - Invoices, payments, cash flow
- 📦 **Supply Chain** - Inventory, procurement
- 👥 **HR Management** - Employees, recruitment
- 📁 **Document Management** - CDE (Common Data Environment)
- 🤖 **AI Features** - Invoice scanning, financial insights

---

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+ and npm
- Supabase account (free tier OK)
- Gemini API key (for AI features)

### Installation:

```bash
# Clone the repository
git clone https://github.com/anhnq-lab/Vijako.erp.git
cd Vijako.erp

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Visit `http://localhost:5173`

---

## 🗄️ Database Setup

### Supabase Setup:

1. Create a Supabase project at https://supabase.com
2. Run the migration SQL:
   ```sql
   -- Copy content from:
   supabase/migrations/20260114_finance_contracts_schema.sql
   -- Paste into Supabase SQL Editor and run
   ```
3. (Optional) Run seed data:
   ```sql
   -- Copy from supabase/seed/finance_contracts_seed.sql
   ```

See detailed guide: `.agent/DEPLOYMENT-GUIDE.md`

---

## 🏗️ Architecture

### Tech Stack:
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + Material Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **AI**: Google Gemini API
- **Maps**: Leaflet
- **Charts**: Recharts
- **3D**: Three.js (BIM Viewer)

### Project Structure:
```
vijako-erp/
├── .agent/                    # Documentation & guides
│   ├── KE-HOACH-CAI-TIEN.md  # Development roadmap
│   ├── DEPLOYMENT-GUIDE.md   # Deployment instructions
│   └── COMPLETE-SUMMARY.md   # Project summary
├── pages/                     # Page components
│   ├── Dashboard.tsx
│   ├── Contracts.tsx         # Contract management
│   ├── Finance.tsx           # Finance & payments
│   └── ...
├── src/
│   ├── components/           # Reusable components
│   │   ├── ui/              # UI components
│   │   ├── layout/          # Layout components
│   │   └── forms/           # Form components
│   ├── services/            # API services
│   └── lib/                 # Utilities
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed/                # Seed data
└── ...
```

---

## 📊 Modules

### 1. Dashboard
- Executive summary
- Key metrics
- Charts & analytics
- Project map

### 2. Contracts & Bidding
- Contract management (A-B, B-C)
- Bidding packages
- Bank guarantees
- Export capabilities

### 3. Finance & Payments
- Invoice management
- Payment processing
- Cash flow tracking
- AR/AP reporting

### 4. Project Management
- Project tracking
- WBS & Gantt charts
- BIM viewer
- Progress monitoring

### 5. Supply Chain
- Inventory management
- Procurement
- Vendor management

### 6. HR & Recruitment
- Employee management
- Recruitment
- Training & development

### 7. Document Management (CDE)
- Document storage
- Version control
- Access management

---

## 🚀 Deployment

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

Or use Vercel Dashboard:
1. Import from GitHub
2. Add environment variables
3. Deploy

See: `.agent/DEPLOYMENT-GUIDE.md`

---

## 🔐 Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_key

# App Config
VITE_APP_NAME=Vijako ERP
VITE_APP_ENV=production
```

---

## 🧪 Testing

### Run locally:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
npm run preview
```

### Test database:
```typescript
import { supabase } from './src/lib/supabase';

const { data } = await supabase.from('contracts').select('*');
console.log(data);
```

---

## 📚 Documentation

- **Kế hoạch phát triển**: `.agent/KE-HOACH-CAI-TIEN.md`
- **Deployment Guide**: `.agent/DEPLOYMENT-GUIDE.md`
- **Module Separation**: `.agent/MODULE-SEPARATION.md`
- **Phase 1 & 2 Updates**: `.agent/GIAI-DOAN-*.md`
- **Quick Start**: `.agent/QUICK-START-GUIDE.md`
- **Complete Summary**: `.agent/COMPLETE-SUMMARY.md`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software owned by Vijako Construction Company.

---

## 👥 Team

- **Product Owner**: Nguyễn Quốc Anh
- **Lead Developer**: Antigravity AI Agent
- **Company**: Vijako Construction

---

## 📧 Contact

For support or inquiries:
- Email: contact@vijako.com
- GitHub: https://github.com/anhnq-lab/Vijako.erp
- Documentation: See `.agent/` folder

---

## 🎯 Roadmap

### ✅ Completed (v2.0):
- Modern UI with responsive design
- Global search (Cmd+K)
- Contract & Bidding management
- Supabase database integration
- Export features
- Deployment ready

### 🔄 In Progress:
- Finance module refactor
- Payment approval workflow
- Cash flow dashboard

### 📅 Planned:
- Mobile app (React Native)
- Advanced analytics & AI
- Third-party integrations
- Offline support

---

## 📊 Stats

- **Lines of Code**: 15,000+
- **Components**: 50+
- **Pages**: 10+
- **Database Tables**: 20+
- **API Services**: 15+

---

## 🏆 Features

- ✅ Responsive design (mobile-first)
- ✅ Dark mode ready
- ✅ Export to Excel/CSV/PDF
- ✅ AI-powered invoice scanning
- ✅ Real-time updates
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Multi-language ready (Vietnamese/English)

---

## 💡 Tips

### Performance:
- Code is lazy-loaded for faster initial load
- Images are optimized
- Database queries are indexed
- Frontend uses React 18 concurrent features

### Development:
- Use TypeScript for type safety
- Follow component structure in existing files
- Check `.agent/QUICK-START-GUIDE.md` for examples
- Run linter before committing

### Deployment:
- Always test locally before deploying
- Check environment variables are set
- Monitor Vercel/Supabase dashboards
- Keep database backups

---

*Built with ❤️ using React, TypeScript, Supabase, and Vercel*

**Version**: 2.0.0  
**Last Updated**: January 14, 2026  
**Status**: ✅ Production Ready
