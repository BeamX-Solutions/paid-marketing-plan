# 🚀 MarketingPlan.ai Deployment Guide

Complete deployment guide for MarketingPlan.ai - from development to production on multiple platforms.

## 📋 Pre-Deployment Checklist

### Required Services & API Keys
- [ ] **Database**: PostgreSQL (recommended) or SQLite for testing
- [ ] **Claude AI API**: Anthropic API key (required for AI features)
- [ ] **Email Service**: Resend API key (required for email features)
- [ ] **Domain**: Custom domain configured (optional but recommended)
- [ ] **SSL Certificate**: HTTPS enabled (automatic on most platforms)

### Environment Variables Setup
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] API keys validated
- [ ] Security secrets generated

---

## 🏗️ Platform-Specific Deployment

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel:**
- Built specifically for Next.js applications
- Automatic deployments from Git
- Global CDN and edge functions
- Zero-config setup
- Excellent performance

#### **Step 1: Prepare Repository**

```bash
# Ensure your code is in a Git repository
git init
git add .
git commit -m "Initial commit for deployment"

# Push to GitHub (recommended)
# Create repository on GitHub first, then:
git remote add origin https://github.com/yourusername/marketing-plan-generator.git
git branch -M main
git push -u origin main
```

#### **Step 2: Deploy to Vercel**

1. **Visit [vercel.com](https://vercel.com)** and sign up/sign in
2. **Connect GitHub** account and select your repository
3. **Configure project:**
   - Framework: Next.js (auto-detected)
   - Root directory: `./` (keep default)
   - Build command: `npm run build` (auto-detected)
   - Output directory: `.next` (auto-detected)

#### **Step 3: Environment Variables**

In Vercel dashboard → Settings → Environment Variables, add:

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# NextAuth (Required)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-string-min-32-chars

# Claude AI (Required for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-your-claude-key-here

# Email Service (Required for email features)
RESEND_API_KEY=re_your-resend-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### **Step 4: Database Setup**

For production database, choose one:

**Option A: Supabase (Recommended)**
```bash
# 1. Visit https://supabase.com
# 2. Create new project
# 3. Go to Settings → Database
# 4. Copy connection string
# 5. Add to Vercel environment variables as DATABASE_URL
```

**Option B: Neon**
```bash
# 1. Visit https://neon.tech
# 2. Create new project
# 3. Copy connection string
# 4. Add to Vercel environment variables as DATABASE_URL
```

**Option C: Railway**
```bash
# 1. Visit https://railway.app
# 2. Create PostgreSQL database
# 3. Copy connection string
# 4. Add to Vercel environment variables as DATABASE_URL
```

#### **Step 5: Deploy and Configure**

```bash
# Vercel will automatically deploy on git push
# Or manually trigger deployment in Vercel dashboard

# After deployment, run database migrations:
# Connect to your deployed app's build logs and verify:
# "npx prisma db push" ran successfully during build
```

#### **Step 6: Custom Domain (Optional)**

```bash
# In Vercel Dashboard:
# 1. Go to Domains tab
# 2. Add your custom domain
# 3. Configure DNS records as instructed
# 4. Update NEXTAUTH_URL environment variable
```

### Option 2: Railway (Full-Stack Platform)

**Why Railway:**
- Includes database hosting
- Git-based deployments
- Environment management
- Good for full-stack apps

#### **Step 1: Deploy Database**

```bash
# 1. Visit https://railway.app
# 2. Create new project
# 3. Add PostgreSQL database
# 4. Note connection details
```

#### **Step 2: Deploy Application**

```bash
# 1. Connect GitHub repository
# 2. Select repository
# 3. Railway auto-detects Next.js
# 4. Add environment variables (same as Vercel list above)
# 5. Deploy
```

#### **Custom Configuration (Optional)**

Create `railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Option 3: DigitalOcean App Platform

**Why DigitalOcean:**
- Predictable pricing
- Managed databases
- Good performance
- Simple configuration

#### **Step 1: Prepare App Spec**

Create `.do/app.yaml`:
```yaml
name: marketingplan-ai
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/marketing-plan-generator
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: NEXTAUTH_URL
    value: ${APP_URL}
  - key: NEXTAUTH_SECRET
    type: SECRET
  - key: ANTHROPIC_API_KEY
    type: SECRET
  - key: RESEND_API_KEY
    type: SECRET

databases:
- name: db
  engine: PG
  version: "13"
  size: db-s-dev-database
```

#### **Step 2: Deploy**

```bash
# 1. Install doctl CLI
# 2. Authenticate: doctl auth init
# 3. Deploy: doctl apps create --spec .do/app.yaml
```

### Option 4: Self-Hosted (VPS/Server)

**For advanced users who want full control**

#### **Step 1: Server Setup**

```bash
# Ubuntu/Debian server setup
sudo apt update
sudo apt install nodejs npm postgresql nginx certbot

# Install PM2 for process management
npm install -g pm2
```

#### **Step 2: Application Setup**

```bash
# Clone repository
git clone https://github.com/yourusername/marketing-plan-generator.git
cd marketing-plan-generator

# Install dependencies
npm install

# Build application
npm run build

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your production values
```

#### **Step 3: Database Setup**

```bash
# Create PostgreSQL database
sudo -u postgres createdb marketing_plans
sudo -u postgres createuser marketingplan_user
sudo -u postgres psql -c "ALTER USER marketingplan_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE marketing_plans TO marketingplan_user;"

# Run migrations
npx prisma db push
```

#### **Step 4: Process Management**

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'marketingplan-ai',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **Step 5: Nginx Configuration**

Create `/etc/nginx/sites-available/marketingplan.ai`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/marketingplan.ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🛠️ Production Configuration

### Database Optimization

#### **Connection Pooling**

For high-traffic deployments, add to `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

Environment variables:
```env
# Main connection with pooling
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true&connection_limit=5"

# Direct connection for migrations
DIRECT_URL="postgresql://user:pass@host:port/db"
```

#### **Database Indexes**

Add to your database for better performance:
```sql
-- User lookup optimization
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);

-- Plan queries optimization
CREATE INDEX CONCURRENTLY idx_plans_user_id ON plans(user_id);
CREATE INDEX CONCURRENTLY idx_plans_status ON plans(status);
CREATE INDEX CONCURRENTLY idx_plans_created_at ON plans(created_at);

-- Analytics optimization
CREATE INDEX CONCURRENTLY idx_claude_interactions_plan_id ON claude_interactions(plan_id);
CREATE INDEX CONCURRENTLY idx_claude_interactions_type ON claude_interactions(interaction_type);
```

### Security Configuration

#### **Environment Variables Security**

```env
# Generate secure secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Use connection pooling URLs
DATABASE_URL="postgresql://..."

# Restrict CORS if needed
ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"
```

#### **Content Security Policy**

Add to `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
          }
        ]
      }
    ]
  }
}
```

### Performance Optimization

#### **Caching Strategy**

Add Redis for caching (optional):
```bash
# Install Redis
npm install redis

# Add to environment
REDIS_URL="redis://localhost:6379"
```

Create `src/lib/cache.ts`:
```typescript
import { Redis } from 'redis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedPlan(planId: string) {
  const cached = await redis.get(`plan:${planId}`)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedPlan(planId: string, data: any) {
  await redis.setex(`plan:${planId}`, 3600, JSON.stringify(data)) // 1 hour cache
}
```

#### **Image Optimization**

Add to `next.config.ts`:
```typescript
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
}
```

### Monitoring & Logging

#### **Health Check Endpoint**

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, { status: 503 })
  }
}
```

#### **Error Monitoring**

Add Sentry (optional):
```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

---

## 🧪 Testing Deployment

### Pre-Deploy Testing

```bash
# Build test
npm run build
npm start

# Database test
npx prisma db push
npx prisma studio

# Environment test
node -e "console.log(process.env.ANTHROPIC_API_KEY ? 'Claude API: ✅' : 'Claude API: ❌')"
node -e "console.log(process.env.RESEND_API_KEY ? 'Email API: ✅' : 'Email API: ❌')"
```

### Post-Deploy Verification

```bash
# Health check
curl https://your-domain.com/api/health

# API endpoints
curl https://your-domain.com/api/analytics/track -X POST -H "Content-Type: application/json" -d '{"event":"test"}'

# Database connection
# Check via app: create test user and plan
```

### Load Testing (Optional)

```bash
# Install k6
npm install -g k6

# Create load-test.js
import http from 'k6/http'

export default function() {
  http.get('https://your-domain.com')
}

export let options = {
  vus: 10,      // Virtual users
  duration: '30s'
}

# Run test
k6 run load-test.js
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Issues:**
```bash
# Test connection
npx prisma db push --preview-feature
npx prisma studio
```

**Environment Variable Issues:**
```bash
# Verify variables are loaded
node -e "console.log('DB URL:', process.env.DATABASE_URL?.substring(0, 20) + '...')"
```

**Memory Issues:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Performance Issues

**Database Slow Queries:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

**Application Performance:**
```bash
# Enable Next.js profiling
NODE_ENV=production npm run build -- --profile
```

---

## 📊 Monitoring & Maintenance

### Regular Maintenance Tasks

**Daily:**
- [ ] Check application health endpoint
- [ ] Monitor error rates
- [ ] Review Claude API usage

**Weekly:**
- [ ] Database backup verification
- [ ] Performance metrics review
- [ ] Security updates check

**Monthly:**
- [ ] Database optimization
- [ ] Cost analysis
- [ ] User analytics review

### Backup Strategy

**Database Backups:**
```bash
# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/marketingplan_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "marketingplan_backup_*.sql.gz" -mtime +30 -delete
```

**Application Backups:**
```bash
# Code backup (automated via Git)
git push origin main

# Environment backup
cp .env.local .env.backup.$(date +%Y%m%d)
```

---

## 📞 Support & Updates

### Getting Help

1. **Check logs** first in your deployment platform
2. **Review environment variables** for missing/incorrect values
3. **Test API connections** individually
4. **Check GitHub Issues** for similar problems
5. **Contact support** with specific error messages

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Rebuild and redeploy
npm run build

# Run any new migrations
npx prisma db push
```

---

**🎉 Your MarketingPlan.ai application is now ready for production deployment!**

Choose the deployment option that best fits your needs and follow the platform-specific instructions above. For most users, **Vercel** provides the easiest and most reliable deployment experience.