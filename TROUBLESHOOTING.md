# Troubleshooting Guide

## Common Issues and Solutions

### Database Connection Issues

**Error: `Can't reach database server`**
```bash
# Check if PostgreSQL is running
# Windows: Check Services for PostgreSQL
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql

# Test connection manually
psql -d your_database_url_here
```

**Error: `Database does not exist`**
```bash
# Create the database
createdb marketing_plans
# Or using SQL
psql -c "CREATE DATABASE marketing_plans;"
```

**Error: `Schema sync issues`**
```bash
# Reset and sync schema
npx prisma db push --force-reset
npx prisma generate
```

### API Key Issues

**Error: `Anthropic API key invalid`**
- Verify key starts with `sk-ant-api03-`
- Check Anthropic Console for usage limits
- Ensure key has proper permissions

**Error: `Resend API key invalid`**
- Verify key starts with `re_`
- Check domain verification in Resend dashboard
- Ensure you're within API limits

### Runtime Errors

**Error: `Module not found`**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: `Build failed`**
```bash
# Check TypeScript errors
npm run build
# Fix any type issues
```

**Error: `PDF generation failed`**
- Check React-PDF dependencies
- Verify large content doesn't exceed limits
- Check browser PDF viewer settings

**Error: `Email sending failed`**
- Verify Resend domain verification
- Check recipient email validity
- Monitor Resend dashboard for errors

### Performance Issues

**Slow Claude AI responses:**
- Check Anthropic API status
- Monitor rate limits
- Verify prompt size isn't too large

**Large PDF files:**
- Optimize image assets
- Reduce font loading
- Check content length

### Development Issues

**Hot reload not working:**
```bash
# Restart dev server
npm run dev
```

**Environment variables not loading:**
- Ensure `.env.local` is in root directory
- Restart development server
- Check variable names match exactly

## Testing Checklist

### Before Testing
- [ ] Database connected and schema synced
- [ ] All required API keys configured
- [ ] Dependencies installed
- [ ] Development server running

### Core Features
- [ ] User registration/authentication works
- [ ] Questionnaire loads and saves progress
- [ ] All 9 marketing squares accessible
- [ ] Plan generation completes successfully
- [ ] Generated content displays correctly

### Advanced Features
- [ ] PDF generation and download works
- [ ] Email completion notification sent
- [ ] Email sharing functionality works
- [ ] Analytics events tracking properly
- [ ] Mobile interface responsive

### Production Readiness
- [ ] Build completes without errors
- [ ] No console errors in browser
- [ ] Performance acceptable (< 3s load times)
- [ ] Error handling graceful
- [ ] Security headers present