const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Direct SQLite connection without Prisma
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath, { readonly: true });

async function exportData() {
  console.log('Exporting SQLite data...\n');

  try {
    // Get all users
    const users = db.prepare('SELECT * FROM users').all();

    // Get all plans
    const plans = db.prepare('SELECT * FROM plans').all();

    // Get all credit purchases
    const creditPurchases = db.prepare('SELECT * FROM credit_purchases').all();

    // Get all credit transactions
    const creditTransactions = db.prepare('SELECT * FROM credit_transactions').all();

    // Get admin actions if table exists
    let adminActions = [];
    try {
      adminActions = db.prepare('SELECT * FROM admin_actions').all();
    } catch (e) {
      console.log('⚠️  admin_actions table not found, skipping...');
    }

    // Get security events if table exists
    let securityEvents = [];
    try {
      securityEvents = db.prepare('SELECT * FROM security_events').all();
    } catch (e) {
      console.log('⚠️  security_events table not found, skipping...');
    }

    const data = {
      users,
      plans,
      creditPurchases,
      creditTransactions,
      adminActions,
      securityEvents,
      exportedAt: new Date().toISOString()
    };

    const outputPath = path.join(__dirname, '..', 'data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`- Users: ${users.length}`);
    console.log(`- Plans: ${plans.length}`);
    console.log(`- Credit Purchases: ${creditPurchases.length}`);
    console.log(`- Credit Transactions: ${creditTransactions.length}`);
    console.log(`- Admin Actions: ${adminActions.length}`);
    console.log(`- Security Events: ${securityEvents.length}`);
    console.log(`\nData saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

exportData();
