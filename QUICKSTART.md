# Quick Start Guide for Testing GigifyPro

## 🚀 How to Preview and Test the Application

### Option 1: Run on Replit (Recommended - Easiest)

If you're on Replit, simply:

1. **Click the "Run" button** at the top of the Replit workspace
   - This will automatically start the development server
   - The app will be available at the Replit preview URL

2. **Access the preview**:
   - Look for the webview panel that opens automatically
   - Or click the "Open in new tab" button in the webview
   - The URL will be something like: `https://your-repl-name.your-username.repl.co`

3. **Set up the database** (if not already done):
   - Go to Replit Secrets and add `DATABASE_URL` with your Neon/Supabase PostgreSQL URL
   - The app will automatically connect when you run it

### Option 2: Run Locally

If you're running locally, follow these steps:

#### Initial Setup (one-time)

```bash
# 1. Set up environment variables
cp .env.example .env

# 2. Edit .env and add your database URL:
#    DATABASE_URL=postgresql://user:password@host:port/database
#    SESSION_SECRET=your_secure_random_string_here

# 3. Install dependencies
npm install

# 4. Set up the database
npm run db:push

# 5. (Optional) Seed with sample data
npm run seed
```

#### Start the Development Server

```bash
npm run dev
```

The application will start on **http://localhost:5000**

Open your browser and navigate to:
- **Home page**: http://localhost:5000
- **Login**: http://localhost:5000/auth/login
- **Register**: http://localhost:5000/auth/register
- **Feed**: http://localhost:5000/feed

## 🧪 Testing Checklist

Use the comprehensive **TESTING.md** file for detailed testing, but here's a quick checklist to get started:

### Quick Smoke Test (5 minutes)

1. **Landing Page** (http://localhost:5000)
   - [ ] Page loads without errors
   - [ ] Hero image displays
   - [ ] CTA buttons work
   - [ ] Navigation links work

2. **Registration** (http://localhost:5000/auth/register)
   - [ ] Form displays correctly
   - [ ] Can create a new account
   - [ ] Redirects after signup

3. **Login** (http://localhost:5000/auth/login)
   - [ ] Can log in with created account
   - [ ] User menu appears in navbar

4. **Browse Feed** (http://localhost:5000/feed)
   - [ ] Listings display (or empty state)
   - [ ] Can click on listings

5. **Post a Task** (http://localhost:5000/post)
   - [ ] Form displays correctly
   - [ ] Can submit a task/service

6. **Responsive Design**
   - [ ] Open DevTools (F12)
   - [ ] Toggle device toolbar (Ctrl+Shift+M)
   - [ ] Test mobile view (375px width)
   - [ ] Mobile menu works

### Full Testing

For comprehensive testing, follow **TESTING.md** which includes:
- 200+ test cases
- 15 major categories
- Authentication flows
- UI components
- Accessibility
- Security
- Performance

## 🔍 Debugging Tips

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for any errors (red text)
4. Check Network tab for failed requests

### Check Server Logs

The terminal where you ran `npm run dev` will show:
- Server startup messages
- API requests
- Database queries
- Any errors

### Common Issues

**"DATABASE_URL must be set" error:**
- Make sure you've created `.env` file
- Add your PostgreSQL connection string to `DATABASE_URL`

**Port 5000 already in use:**
- Stop any other apps using port 5000
- Or change PORT in `.env` to a different value

**Build errors:**
- Run `npm install` to ensure dependencies are installed
- Try `rm -rf node_modules dist && npm install`

## 📱 Mobile Testing

### On Your Phone

1. **Find your local IP**: 
   ```bash
   # On Linux/Mac
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. **Access from phone**: 
   - Make sure phone is on same WiFi network
   - Open browser to: `http://YOUR_IP:5000`
   - Example: `http://192.168.1.100:5000`

### Browser DevTools

1. Press F12 to open DevTools
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select a device from dropdown (iPhone, Pixel, etc.)
4. Test all features in mobile view

## 📊 Performance Testing

### Check Bundle Size

The build output shows bundle sizes:
```bash
npm run build
```

Look for:
- Main bundle: ~1.1 MB (224 KB gzipped) ✅
- React vendor: ~142 KB (46 KB gzipped) ✅
- UI vendor: ~103 KB (34 KB gzipped) ✅

### Lighthouse Audit

1. Open the app in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Click "Analyze page load"
5. Check scores for Performance, Accessibility, SEO

## 🎯 Key Features to Test

### For Clients (Task Posters)
- [ ] Register/Login
- [ ] Post a task request
- [ ] Browse service providers
- [ ] View worker profiles
- [ ] Send booking requests

### For Workers (Service Providers)
- [ ] Register/Login
- [ ] Create service offerings
- [ ] View task requests
- [ ] Manage dashboard
- [ ] Track earnings

### For Everyone
- [ ] Browse Knowledge Hub articles
- [ ] Participate in Community discussions
- [ ] View and filter services
- [ ] Check store products (if enabled)

## 🆘 Need Help?

1. **Check Documentation**:
   - DEPLOYMENT.md - Setup and deployment
   - TESTING.md - Comprehensive test cases
   - SUMMARY.md - Overview of changes

2. **Check Console Logs**:
   - Browser console (F12)
   - Server terminal output

3. **Common URLs**:
   - Home: http://localhost:5000
   - Login: http://localhost:5000/auth/login
   - Feed: http://localhost:5000/feed
   - Knowledge: http://localhost:5000/knowledge
   - Community: http://localhost:5000/community

## ✅ Quick Validation

After starting the app, verify these basics:

```bash
# 1. Check TypeScript
npm run check
# Should complete with no errors

# 2. Check build
npm run build
# Should complete successfully

# 3. Access the app
# Open http://localhost:5000 in browser
# Should see the landing page
```

---

**You're all set!** 🎉

The application is production-ready. Start with the quick smoke test above, then use TESTING.md for comprehensive testing before launching to production.
