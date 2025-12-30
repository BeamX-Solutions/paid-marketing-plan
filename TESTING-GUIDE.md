# Quick Testing Guide

## 🎯 Critical Path Testing (15 minutes)

### 1. Authentication (3 min)
```
✓ Register new user
✓ Verify email sent
✓ Login with credentials
✓ Admin login at /admin/login
✓ Logout works
```

### 2. User Flow (5 min)
```
✓ View dashboard
✓ Check credit balance
✓ Create a plan
✓ View plan details
✓ Purchase credits (test mode)
```

### 3. Admin Flow (7 min)
```
✓ Access admin dashboard at /admin
✓ View user management
✓ Search for a user
✓ View user details
✓ Add credits to user
✓ Deduct credits from user
✓ View audit logs
✓ Filter audit logs
✓ Check activity log pagination
✓ Test dashboard filters (DATE, COUNTRY, INDUSTRY)
```

## 🔍 What to Check in Browser Console

1. **Admin Dashboard Filters**:
   - Go to `/admin` (Dashboard)
   - Open Console (F12)
   - Change "Time Period" filter
   - Look for: `Fetching dashboard with filters:`
   - Look for: `Dashboard data received:`
   - Verify numbers change in the UI

2. **Credit Operations**:
   - Go to user detail page
   - Manage Credits
   - Check for any errors
   - Verify audit log entry created

3. **Network Tab**:
   - Watch API calls
   - Check for 500 errors
   - Verify response times

## 🚀 Pre-Production Verification

### Environment Setup
```bash
# Verify environment variables
echo $NEXTAUTH_URL
# Should be: https://marketingplan.beamxsolutions.com

# Check database
sqlite3 dev.db ".tables"
# Should include: notifications, users, plans, etc.
```

### Build Test
```bash
# Test production build
npm run build

# Should complete without errors
# Check for:
# - No TypeScript errors
# - No ESLint errors
# - Successful build output
```

### Database Check
```bash
# Verify all tables exist
DATABASE_URL="file:./dev.db" npx prisma studio

# Visual check in Prisma Studio:
# - Users table
# - Plans table
# - CreditPurchase table
# - CreditTransaction table
# - AdminAction table (audit logs)
# - Notification table
# - SecurityEvent table
```

## 🐛 Known Issues to Test

1. **Dashboard Filters** (CRITICAL - Not working)
   - [ ] Date filter changes data
   - [ ] Country filter works
   - [ ] Industry filter works

2. **Credit System** (FIXED - Verify)
   - [x] Credits can be added
   - [x] Credits can be deducted
   - [x] Audit logs created
   - [x] Transaction is atomic

3. **Pagination** (FIXED - Verify)
   - [x] Audit logs pagination
   - [x] Activity log pagination
   - [x] User management pagination

## 📊 Performance Benchmarks

### Page Load Times (Target)
- Homepage: < 2 seconds
- Dashboard: < 2 seconds
- Admin Dashboard: < 3 seconds
- User Management: < 2 seconds

### API Response Times (Target)
- GET /api/admin/users: < 500ms
- GET /api/admin/dashboard: < 1000ms
- POST /api/admin/users/[id]/credits: < 500ms
- GET /api/admin/audit-logs: < 500ms

## 🔐 Security Checklist

- [ ] Admin routes require authentication
- [ ] Admin routes require ADMIN role
- [ ] API routes have rate limiting
- [ ] Sensitive data not in console logs (production)
- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] SQL injection prevented (Prisma handles this)
- [ ] XSS prevention in place

## 📝 Test Results Template

```
Date: _______________
Tester: _______________

AUTHENTICATION:
[ ] Registration: _______________
[ ] Login: _______________
[ ] Admin Login: _______________

USER FEATURES:
[ ] Dashboard: _______________
[ ] Plan Creation: _______________
[ ] Credit Purchase: _______________

ADMIN FEATURES:
[ ] User Management: _______________
[ ] Credit Management: _______________
[ ] Audit Logs: _______________
[ ] Dashboard Filters: _______________

ISSUES FOUND:
1. _______________
2. _______________
3. _______________

STATUS: [ ] Ready for Production [ ] Needs Fixes
```

## 🆘 If Something Breaks

1. **Check console for errors**
2. **Check network tab for failed requests**
3. **Check server logs** (in your terminal)
4. **Verify database** (Prisma Studio)
5. **Check environment variables**

## 🎓 Tips

- Test with different browsers (Chrome, Firefox, Safari)
- Test mobile responsiveness
- Test with slow 3G network (Chrome DevTools)
- Clear cache between tests
- Use incognito mode for clean state

---

**Start Testing**: Check items as you complete them
**Report Issues**: Note any problems in the Test Results section
