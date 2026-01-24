const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Use DIRECT connection for import (more stable)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || 'postgresql://postgres.wiqbeubcgijznyqchewe:YQbQk8izYm7JpwCt@aws-1-eu-west-1.pooler.supabase.com:5432/postgres'
    }
  }
});

async function importData() {
  console.log('Importing data to Supabase PostgreSQL (using direct connection)...\n');

  try {
    const dataPath = path.join(__dirname, '..', 'data-export.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log('📊 Data to import:');
    console.log(`  - Users: ${data.users.length}`);
    console.log(`  - Plans: ${data.plans.length}`);
    console.log(`  - Credit Purchases: ${data.creditPurchases.length}`);
    console.log(`  - Credit Transactions: ${data.creditTransactions.length}`);
    console.log(`  - Admin Actions: ${data.adminActions.length}`);
    console.log(`  - Security Events: ${data.securityEvents.length}\n`);

    // Import users first (they're referenced by other tables)
    console.log('Importing users...');
    let usersImported = 0;
    let usersSkipped = 0;

    for (const user of data.users) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            passwordResetToken: user.passwordResetToken,
            passwordResetExpires: user.passwordResetExpires ? new Date(user.passwordResetExpires) : null,
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.businessName,
            industry: user.industry,
            country: user.country,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified === 1 || user.emailVerified === true,
            emailVerificationToken: user.emailVerificationToken,
            emailVerificationExpires: user.emailVerificationExpires ? new Date(user.emailVerificationExpires) : null,
            twoFactorEnabled: user.twoFactorEnabled === 1 || user.twoFactorEnabled === true,
            twoFactorSecret: user.twoFactorSecret,
            twoFactorBackupCodes: user.twoFactorBackupCodes,
            twoFactorSetupAt: user.twoFactorSetupAt ? new Date(user.twoFactorSetupAt) : null,
            paystackCustomerId: user.paystackCustomerId || user.stripeCustomerId,
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
            lastLoginIp: user.lastLoginIp,
            lastLoginUserAgent: user.lastLoginUserAgent,
            marketingConsent: user.marketingConsent === 1 || user.marketingConsent === true,
            profileData: user.profileData,
            permissions: user.permissions,
            subscriptionStatus: user.subscriptionStatus || 'free',
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
        });
        usersImported++;
      } catch (error) {
        if (error.code === 'P2002') {
          // User already exists, skip it
          usersSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Users: ${usersImported} imported, ${usersSkipped} already existed\n`);

    // Import credit purchases
    console.log('Importing credit purchases...');
    let purchasesImported = 0;
    let purchasesSkipped = 0;

    for (const purchase of data.creditPurchases) {
      try {
        const createData = {
          id: purchase.id,
          userId: purchase.userId,
          creditsGranted: purchase.creditsGranted,
          creditsRemaining: purchase.creditsRemaining,
          amountPaid: purchase.amountPaid,
          currency: purchase.currency,
          paystackReference: purchase.paystackReference || purchase.stripeSessionId,
          paystackTransactionId: purchase.paystackTransactionId || purchase.stripePaymentId,
          status: purchase.status,
          purchaseDate: new Date(purchase.purchaseDate),
          expiresAt: new Date(purchase.expiresAt),
        };

        // Only add createdAt/updatedAt if they exist in the old data
        if (purchase.createdAt) {
          createData.createdAt = new Date(purchase.createdAt);
        }
        if (purchase.updatedAt) {
          createData.updatedAt = new Date(purchase.updatedAt);
        }

        await prisma.creditPurchase.create({ data: createData });
        purchasesImported++;
      } catch (error) {
        if (error.code === 'P2002') {
          purchasesSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Credit purchases: ${purchasesImported} imported, ${purchasesSkipped} already existed\n`);

    // Import plans
    console.log('Importing plans...');
    let plansImported = 0;
    let plansSkipped = 0;

    for (const plan of data.plans) {
      try {
        await prisma.plan.create({
          data: {
            id: plan.id,
            userId: plan.userId,
            businessContext: plan.businessContext,
            questionnaireResponses: plan.questionnaireResponses,
            claudeAnalysis: plan.claudeAnalysis,
            generatedContent: plan.generatedContent,
            planMetadata: plan.planMetadata,
            status: plan.status,
            completionPercentage: plan.completionPercentage || 0,
            creditsCharged: plan.creditsCharged || 0,
            createdAt: new Date(plan.createdAt),
            updatedAt: new Date(plan.updatedAt),
            completedAt: plan.completedAt ? new Date(plan.completedAt) : null,
          },
        });
        plansImported++;
      } catch (error) {
        if (error.code === 'P2002') {
          plansSkipped++;
        } else {
          console.error(`Error importing plan ${plan.id}:`, error.message);
          throw error;
        }
      }
    }
    console.log(`✅ Plans: ${plansImported} imported, ${plansSkipped} already existed\n`);

    // Import credit transactions
    console.log('Importing credit transactions...');
    let transactionsImported = 0;
    let transactionsSkipped = 0;

    for (const transaction of data.creditTransactions) {
      try {
        await prisma.creditTransaction.create({
          data: {
            id: transaction.id,
            userId: transaction.userId,
            purchaseId: transaction.purchaseId,
            planId: transaction.planId,
            creditAmount: transaction.creditAmount,
            transactionType: transaction.transactionType,
            balanceBefore: transaction.balanceBefore,
            balanceAfter: transaction.balanceAfter,
            description: transaction.description,
            metadata: transaction.metadata,
            createdAt: new Date(transaction.createdAt),
          },
        });
        transactionsImported++;
      } catch (error) {
        if (error.code === 'P2002') {
          transactionsSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Credit transactions: ${transactionsImported} imported, ${transactionsSkipped} already existed\n`);

    // Import admin actions if any
    if (data.adminActions && data.adminActions.length > 0) {
      console.log('Importing admin actions...');
      let actionsImported = 0;
      let actionsSkipped = 0;

      for (const action of data.adminActions) {
        try {
          await prisma.adminAction.create({
            data: {
              id: action.id,
              adminId: action.adminId,
              action: action.action,
              targetUserId: action.targetUserId,
              details: action.details,
              ipAddress: action.ipAddress,
              userAgent: action.userAgent,
              createdAt: new Date(action.createdAt),
            },
          });
          actionsImported++;
        } catch (error) {
          if (error.code === 'P2002') {
            actionsSkipped++;
          } else {
            throw error;
          }
        }
      }
      console.log(`✅ Admin actions: ${actionsImported} imported, ${actionsSkipped} already existed\n`);
    }

    // Import security events if any
    if (data.securityEvents && data.securityEvents.length > 0) {
      console.log('Importing security events...');
      let eventsImported = 0;
      let eventsSkipped = 0;

      for (const event of data.securityEvents) {
        try {
          await prisma.securityEvent.create({
            data: {
              id: event.id,
              userId: event.userId,
              eventType: event.eventType,
              severity: event.severity,
              ipAddress: event.ipAddress,
              userAgent: event.userAgent,
              location: event.location,
              details: event.details,
              resolved: event.resolved === 1 || event.resolved === true,
              resolvedBy: event.resolvedBy,
              resolvedAt: event.resolvedAt ? new Date(event.resolvedAt) : null,
              createdAt: new Date(event.createdAt),
            },
          });
          eventsImported++;
        } catch (error) {
          if (error.code === 'P2002') {
            eventsSkipped++;
          } else {
            throw error;
          }
        }
      }
      console.log(`✅ Security events: ${eventsImported} imported, ${eventsSkipped} already existed\n`);
    }

    console.log('🎉 Import completed successfully!\n');
    console.log('Summary:');
    console.log(`  ✅ Users: ${usersImported} imported, ${usersSkipped} skipped`);
    console.log(`  ✅ Credit purchases: ${purchasesImported} imported, ${purchasesSkipped} skipped`);
    console.log(`  ✅ Plans: ${plansImported} imported, ${plansSkipped} skipped`);
    console.log(`  ✅ Credit transactions: ${transactionsImported} imported, ${transactionsSkipped} skipped`);
    if (data.adminActions && data.adminActions.length > 0) {
      console.log(`  ✅ Admin actions: ${actionsImported} imported, ${actionsSkipped} skipped`);
    }
    if (data.securityEvents && data.securityEvents.length > 0) {
      console.log(`  ✅ Security events: ${eventsImported} imported, ${eventsSkipped} skipped`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error('\nError details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData();
