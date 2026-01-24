# Supabase Migration Guide

This guide will help you migrate from SQLite to Supabase (PostgreSQL).

## 🎯 Why Migrate to Supabase?

- ✅ **Production-ready** - PostgreSQL is robust for production
- ✅ **Scalable** - Handles millions of rows easily
- ✅ **Real-time** - Built-in real-time subscriptions
- ✅ **Auth** - Can replace NextAuth if needed
- ✅ **Storage** - File storage included
- ✅ **Backups** - Automatic daily backups
- ✅ **Free tier** - 500MB database, 2GB bandwidth/month

## 📋 Prerequisites

1. **Supabase Account**: [Sign up at supabase.com](https://supabase.com)
2. **Create Project**: Create a new project in Supabase dashboard
3. **Get Connection String**: You'll need the PostgreSQL connection string

## 🚀 Step-by-Step Migration

### Step 1: Install PostgreSQL Driver

```bash
npm install @prisma/adapter-postgresql
```

### Step 2: Get Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection String**, select **Connection pooling**
5. Copy the **Connection string** (starts with `postgresql://`)
6. **Mode**: Use **Transaction** mode for Prisma

Example format:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Step 3: Update Environment Variables

Add to your `.env.local` or `.env`:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase Project (optional - for future use)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

**Important Notes:**
- `DATABASE_URL`: Use port **6543** (connection pooling via PgBouncer)
- `DIRECT_URL`: Use port **5432** (direct connection for migrations)
- Replace `[YOUR-PASSWORD]` with your actual database password

### Step 4: Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Rest of your schema remains the same...
```

**Key Changes:**
- `provider = "postgresql"` (was "sqlite")
- Added `directUrl` for migrations
- Added `previewFeatures = ["driverAdapters"]`

### Step 5: Handle SQLite to PostgreSQL Differences

Some types need adjustment:

#### Before (SQLite):
```prisma
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  // JSON stored as String
  profileData String?
}
```

#### After (PostgreSQL):
```prisma
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  // Can use native JSON type
  profileData Json?
}
```

**Optional:** Keep JSON as String (safer migration) or change to `Json` type.

### Step 6: Export SQLite Data (If You Have Important Data)

If you have existing users/plans in SQLite:

```bash
# Export SQLite data
node scripts/export-sqlite-data.js
```

Create `scripts/export-sqlite-data.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function exportData() {
  console.log('Exporting SQLite data...\n');

  try {
    const users = await prisma.user.findMany();
    const plans = await prisma.plan.findMany();
    const creditPurchases = await prisma.creditPurchase.findMany();
    const creditTransactions = await prisma.creditTransaction.findMany();

    const data = {
      users,
      plans,
      creditPurchases,
      creditTransactions,
      exportedAt: new Date().toISOString()
    };

    fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`- Users: ${users.length}`);
    console.log(`- Plans: ${plans.length}`);
    console.log(`- Credit Purchases: ${creditPurchases.length}`);
    console.log(`- Credit Transactions: ${creditTransactions.length}`);
    console.log('\nData saved to: data-export.json\n');

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
```

### Step 7: Create Fresh Migration

```bash
# Generate Prisma client with PostgreSQL
npx prisma generate

# Create initial migration for PostgreSQL
npx prisma migrate dev --name init_postgresql

# This will:
# 1. Create migration files
# 2. Apply migration to Supabase
# 3. Generate Prisma client
```

### Step 8: Import Data (If You Exported)

Create `scripts/import-to-supabase.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient(); // Uses DATABASE_URL from .env

async function importData() {
  console.log('Importing data to Supabase...\n');

  try {
    const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'));

    console.log('Creating users...');
    for (const user of data.users) {
      await prisma.user.create({
        data: user
      });
    }
    console.log(`✅ Created ${data.users.length} users`);

    console.log('Creating credit purchases...');
    for (const purchase of data.creditPurchases) {
      await prisma.creditPurchase.create({
        data: purchase
      });
    }
    console.log(`✅ Created ${data.creditPurchases.length} credit purchases`);

    console.log('Creating plans...');
    for (const plan of data.plans) {
      await prisma.plan.create({
        data: plan
      });
    }
    console.log(`✅ Created ${data.plans.length} plans`);

    console.log('Creating credit transactions...');
    for (const transaction of data.creditTransactions) {
      await prisma.creditTransaction.create({
        data: transaction
      });
    }
    console.log(`✅ Created ${data.creditTransactions.length} credit transactions`);

    console.log('\n✅ Import completed successfully!\n');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
```

Run import:
```bash
node scripts/import-to-supabase.js
```

### Step 9: Test the Connection

Create `scripts/test-supabase.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Supabase connection...\n');

    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Connection successful!`);
    console.log(`📊 Users in database: ${userCount}`);

    // Test write
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'test-password-hash',
        role: 'USER',
        status: 'ACTIVE',
      }
    });
    console.log(`✅ Write test successful! Created user: ${testUser.email}`);

    // Cleanup
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log(`✅ Cleanup successful!\n`);

  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run test:
```bash
node scripts/test-supabase.js
```

### Step 10: Update Application Code

No code changes needed! Prisma abstracts the database. Your existing code will work as-is.

### Step 11: Deploy and Verify

1. **Update production environment variables** with Supabase URLs
2. **Run migrations on production:**
   ```bash
   npx prisma migrate deploy
   ```
3. **Verify in Supabase Dashboard:**
   - Go to Table Editor
   - You should see all your tables
   - Check that data is present

## 🔧 Troubleshooting

### "Can't reach database server"
- Check if Supabase project is active
- Verify connection string is correct
- Check if IP is whitelisted (Supabase allows all by default)

### "Migration failed"
- Make sure `DIRECT_URL` uses port 5432
- Check database password is correct
- Ensure database is not in read-only mode

### "Unique constraint failed"
- Data already exists in database
- Drop tables and re-run migration:
  ```bash
  npx prisma migrate reset
  ```

### Performance Issues
- Enable connection pooling (use port 6543)
- Set `connection_limit=1` in DATABASE_URL
- Consider using Prisma Accelerate for caching

## 📊 Supabase Dashboard Features

Once migrated, you can use:

1. **Table Editor** - View/edit data visually
2. **SQL Editor** - Run custom queries
3. **Database** - Manage tables, indexes, triggers
4. **Auth** - Optional: Replace NextAuth
5. **Storage** - Store user files (logos, etc.)
6. **Logs** - Monitor database queries
7. **Backups** - Automatic daily backups (paid plans)

## 🎯 Performance Optimization

### Add Indexes (if not already present):

```sql
-- Add to Supabase SQL Editor
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_status
  ON credit_purchases(user_id, status, expires_at);
```

### Connection Pooling:

Always use `DATABASE_URL` with port 6543 for application:
```
postgresql://...@....pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔒 Security

1. **Rotate database password** after migration
2. **Use Row Level Security (RLS)** in Supabase for extra protection
3. **Enable SSL** (already enabled by default)
4. **Monitor access logs** in Supabase dashboard

## 💰 Pricing

**Free Tier:**
- 500MB database
- 2GB bandwidth/month
- Unlimited API requests
- Paused after 1 week inactivity

**Pro ($25/month):**
- 8GB database
- 50GB bandwidth
- No pausing
- Daily backups
- Point-in-time recovery

## ✅ Post-Migration Checklist

- [ ] Supabase project created
- [ ] Connection string added to `.env`
- [ ] Schema updated to PostgreSQL
- [ ] Migration run successfully
- [ ] Data imported (if needed)
- [ ] Connection tested
- [ ] Application tested locally
- [ ] Production environment updated
- [ ] First production payment tested
- [ ] Monitoring setup (Supabase dashboard)

## 🚀 Next Steps

After successful migration:

1. Remove SQLite database file (`prisma/dev.db`)
2. Update deployment scripts
3. Setup Supabase alerts
4. Configure backups (Pro plan)
5. Consider using Supabase Auth (optional)

---

**Questions?** Check [Supabase Documentation](https://supabase.com/docs) or [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
