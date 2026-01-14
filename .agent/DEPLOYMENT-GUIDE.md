# 🚀 SUPABASE & VERCEL DEPLOYMENT GUIDE

## 📋 OVERVIEW

Guide đầy đủ để setup database Supabase và deploy lên Vercel cho Vijako ERP.

---

## 1️⃣ SUPABASE SETUP

### Step 1: Create Supabase Project

1. Truy cập: https://supabase.com
2. Click **"New Project"**
3. Điền thông tin:
   - **Name**: `vijako-erp` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: `Southeast Asia (Singapore)` (gần VN nhất)
   - **Pricing Plan**: Free tier (đủ cho development)
4. Click **"Create new project"**
5. Đợi ~2 phút để Supabase setup database

### Step 2: Get Connection Details

Sau khi project được tạo:

1. Vào **Settings** → **API**
2. Copy các thông tin sau:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbG...
   service_role key: eyJhbG... (KEEP SECRET!)
   ```

3. Vào **Settings** → **Database**
4. Copy **Connection string**:
   ```
   postgres://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Step 3: Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended for first time)

1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **"New query"**
3. Copy toàn bộ nội dung file `supabase/migrations/20260114_finance_contracts_schema.sql`
4. Paste vào editor
5. Click **"Run"** hoặc nhấn `Ctrl+Enter`
6. Kiểm tra kết quả - should see "Success. No rows returned"

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Verify
supabase db diff
```

### Step 4: Seed Sample Data (Optional)

1. Trong **SQL Editor**, tạo query mới
2. Copy nội dung `supabase/seed/finance_contracts_seed.sql`
3. Run để tạo data mẫu
4. Verify bằng cách:
   ```sql
   SELECT * FROM contracts LIMIT 5;
   SELECT * FROM invoices LIMIT 5;
   SELECT * FROM payments LIMIT 5;
   ```

### Step 5: Setup Row Level Security (RLS)

Database schema đã include RLS policies. Để test:

1. Vào **Authentication** → **Policies**
2. Kiểm tra tables đã có policies
3. Tạo test user:
   - Vào **Authentication** → **Users**
   - Click **"Add user"** → **"Create new user"**
   - Email: `test@vijako.com`
   - Password: `Test@123456`
   - Click **"Create user"**

---

## 2️⃣ ENVIRONMENT VARIABLES SETUP

### Create `.env.local` file

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API (for AI features)
VITE_GEMINI_API_KEY=AIzaSy...

# App Config
VITE_APP_NAME=Vijako ERP
VITE_APP_ENV=development
```

### Update `.env.example`

```bash
# Copy to .env.local and fill in your values
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Add to `.gitignore`

```
.env.local
.env.production
.env
```

---

## 3️⃣ VERCEL DEPLOYMENT

### Step 1: Prepare for Deployment

1. **Update `package.json`** scripts:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "vercel-build": "vite build"
     }
   }
   ```

2. **Create `vercel.json`**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

3. **Test build locally**:
   ```bash
   npm run build
   npm run preview
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Truy cập: https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import from GitHub:
   - Connect GitHub account
   - Select repository: `Vijako.erp`
   - Click **"Import"**

4. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables**:
   Click **"Environment Variables"**, add:
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbG...
   VITE_GEMINI_API_KEY = AIzaSy...
   ```

6. Click **"Deploy"**
7. Đợi ~2-3 phút
8. Done! App live tại: `https://vijako-erp.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: vijako-erp
# - Directory: ./
# - Override settings? No

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

### Step 3: Post-Deployment Setup

1. **Update Supabase Auth Settings**:
   - Vào Supabase Dashboard
   - **Authentication** → **URL Configuration**
   - Add site URL: `https://your-app.vercel.app`
   - Add redirect URLs: `https://your-app.vercel.app/**`

2. **Test the deployment**:
   - Visit your Vercel URL
   - Test login
   - Test data loading from Supabase
   - Check browser console for errors

3. **Setup Custom Domain** (Optional):
   - Vào Vercel project settings
   - **Domains** → **Add Domain**
   - Nhập domain của bạn
   - Follow DNS setup instructions

---

## 4️⃣ DATABASE SCHEMA VERIFICATION

### Tables Created:

Run this query to verify all tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should see:
- ✅ contracts
- ✅ bidding_packages
- ✅ bank_guarantees
- ✅ invoices
- ✅ payments
- ✅ cash_flow_records
- ✅ payment_requests

### Check Indexes:

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Check RLS Policies:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies;
```

---

## 5️⃣ TESTING

### Test Supabase Connection

Create `test-connection.ts`:

```typescript
import { supabase } from './src/lib/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('contracts')
    .select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connected! Contracts count:', data);
  }
}

testConnection();
```

Run: `npx tsx test-connection.ts`

### Test API Endpoints

```bash
# Get contracts
curl https://your-project.supabase.co/rest/v1/contracts \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get invoices
curl https://your-project.supabase.co/rest/v1/invoices \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 6️⃣ MONITORING & MAINTENANCE

### Supabase Monitoring

1. **Database**:
   - Vào **Database** → **Database**
   - Monitor size, connections, queries

2. **API**:
   - **API** → **Logs**
   - Check for errors, slow queries

3. **Authentication**:
   - **Authentication** → **Users**
   - Monitor user activity

### Vercel Monitoring

1. **Analytics**:
   - Vercel Dashboard → **Analytics**
   - Page views, performance

2. **Logs**:
   - **Deployments** → Select deployment → **Functions**
   - Check for runtime errors

3. **Performance**:
   - **Speed Insights**
   - Monitor Core Web Vitals

---

## 7️⃣ BACKUP & RECOVERY

### Database Backups

Supabase Free tier includes:
- ✅ Daily backups (kept for 7 days)
- ✅ Point-in-time recovery (PITR) - Pro plan only

Manual backup:
```bash
# Using pg_dump
pg_dump "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" \
  > backup_$(date +%Y%m%d).sql

# Restore
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" \
  < backup_20260114.sql
```

---

## 8️⃣ TROUBLESHOOTING

### Common Issues:

#### ❌ "Invalid API key"
- Check `.env.local` file exists
- Verify VITE_SUPABASE_ANON_KEY is correct
- Restart dev server

#### ❌ "Row Level Security policy violation"
- Check RLS policies in Supabase
- Ensure user is authenticated
- Verify policy conditions

#### ❌ "Table does not exist"
- Run migrations again
- Check table name spelling
- Verify schema is `public`

#### ❌ Build fails on Vercel
- Check environment variables are set
- Verify `vercel.json` configuration
- Check build logs for errors

---

## 9️⃣ SECURITY CHECKLIST

- [ ] Never commit `.env.local` to Git
- [ ] Use `anon` key for client, `service_role` key for server only
- [ ] Enable RLS on all tables
- [ ] Use HTTPS only
- [ ] Rotate API keys periodically
- [ ] Monitor auth logs for suspicious activity
- [ ] Set up CORS properly in Supabase
- [ ] Use strong database passwords
- [ ] Enable 2FA on Supabase & Vercel accounts

---

## 🎉 DONE!

Your Vijako ERP should now be:
- ✅ Database running on Supabase
- ✅ App deployed on Vercel
- ✅ Fully functional Finance & Contracts modules
- ✅ Secure with RLS
- ✅ Ready for production use!

---

## 📞 SUPPORT

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev

---

*Last updated: 2026-01-14*
*Version: 1.0*
