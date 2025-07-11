# 🚀 Deploy Geek Mail Pro to Coolify.io

## Quick Deploy Button

[![Deploy to Coolify](https://img.shields.io/badge/Deploy_to-Coolify-0066CC?style=for-the-badge&logo=docker&logoColor=white)](https://coolify.io)

## Step-by-Step Deployment Guide

### 1. Prerequisites
- ✅ Coolify.io account
- ✅ Git repository (GitHub, GitLab, Bitbucket)
- ✅ Domain name (optional but recommended)

### 2. Prepare Repository
1. **Fork or clone** this repository to your Git provider
2. **Ensure all files are committed** including:
   - `Dockerfile`
   - `coolify.yml` or `docker-compose.yml`
   - All deployment files in `/deployment/` folder

### 3. Create New Resource in Coolify

#### Option A: Using Docker Compose (Recommended)
1. **Login to Coolify** dashboard
2. **Click "New Resource"**
3. **Select "Application"**
4. **Choose "Docker Compose"**
5. **Connect your Git repository**
6. **Select branch** (usually `main`)
7. **Docker Compose file**: Use `coolify.yml`

#### Option B: Using Simple Dockerfile
1. **Login to Coolify** dashboard
2. **Click "New Resource"**
3. **Select "Application"**
4. **Choose "Docker"**
5. **Connect your Git repository**

### 4. Configure Environment Variables

In Coolify dashboard, add these environment variables:

#### Database Configuration
```bash
DATABASE_URL=postgresql://postgres:password@postgres:5432/geek_mail_pro
PGHOST=postgres
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-secure-password  # Generate a strong password
PGDATABASE=geek_mail_pro
```

#### Authentication (Required)
```bash
SESSION_SECRET=your-super-secret-32-char-key  # Generate with crypto.randomBytes(32).toString('hex')
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-domain.com,www.your-domain.com
ISSUER_URL=https://replit.com/oidc
```

#### Email Configuration (Required)
```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Gmail app password (16 characters)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### Application Settings
```bash
NODE_ENV=production
PORT=5000
CUSTOM_DOMAIN=thegeektrepreneur.com
```

### 5. Configure Domain (Optional)

1. **Add domain** in Coolify dashboard
2. **Point DNS** to Coolify servers:
   ```
   A record: @ → [Coolify IP]
   CNAME: www → [Your Domain]
   ```
3. **SSL certificate** will be automatically generated

### 6. Deploy Application

1. **Click "Deploy"** in Coolify dashboard
2. **Monitor build logs** for any errors
3. **Wait for deployment** to complete (usually 5-10 minutes)

### 7. Post-Deployment Setup

#### Initialize Database
Once deployed, run database migrations:
```bash
# In Coolify terminal/SSH or via API
npm run db:push
```

#### Verify Deployment
Test your deployment:
```bash
# Health check
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-07-11T19:47:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "database": "connected"
}
```

### 8. Configuration Verification

#### Test Email Functionality
1. **Login to your application**
2. **Create a test campaign**
3. **Send test email**
4. **Verify email delivery**

#### Test Database
1. **Create contact lists**
2. **Import contacts**
3. **Verify data persistence**

## Environment Variable Generation

### Generate SESSION_SECRET
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Gmail App Password Setup
1. **Enable 2FA** on Gmail account
2. **Go to**: Google Account → Security → 2-Step Verification
3. **Click**: App passwords
4. **Select**: Mail
5. **Generate** 16-character password
6. **Use** as SMTP_PASS

### Replit Authentication Setup
1. **Go to** your Replit account
2. **Find your** REPL_ID in app settings
3. **Set** REPLIT_DOMAINS to your actual domain(s)

## Troubleshooting

### Build Issues
```bash
# Check build logs in Coolify
# Common issues:
- Missing environment variables
- Node.js version compatibility
- Package dependency issues
```

### Database Connection Issues
```bash
# Verify database is running
# Check DATABASE_URL format
# Ensure network connectivity
```

### Email Issues
```bash
# Verify SMTP credentials
# Check Gmail app password
# Test with curl: POST /api/test-email
```

### Authentication Issues
```bash
# Verify REPL_ID and REPLIT_DOMAINS
# Check SESSION_SECRET is set
# Ensure ISSUER_URL is correct
```

## Monitoring & Maintenance

### Health Monitoring
- **Health endpoint**: `https://your-domain.com/api/health`
- **Monitor logs** in Coolify dashboard
- **Set up alerts** for downtime

### Backup Configuration
```bash
# Schedule backup job in Coolify cron
0 2 * * * /app/deployment/backup-script.sh
```

### Updates
1. **Push changes** to Git repository
2. **Coolify auto-deploys** on push
3. **Monitor deployment** in dashboard
4. **Test functionality** after update

## Support

### Documentation
- [Main README](../README.md)
- [Full Deployment Guide](README.md)
- [Production Checklist](production-checklist.md)

### Getting Help
1. **Check health endpoint** first
2. **Review Coolify logs**
3. **Test individual components**
4. **Open issue** in repository

---

**🎉 Congratulations!** Your Geek Mail Pro platform is now deployed and ready for production use!

**Next Steps:**
1. Configure your email forwarding
2. Import your contact lists
3. Create your first campaign
4. Set up analytics tracking