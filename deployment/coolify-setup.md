# Coolify.io Setup Guide for Geek Mail Pro

## Step 1: Prepare Your Repository

1. **Fork or clone** this repository to your Git provider (GitHub, GitLab, etc.)
2. **Ensure all files are committed** including deployment configurations

## Step 2: Create New Resource in Coolify

1. **Log into Coolify.io** dashboard
2. **Click "New Resource"**
3. **Select "Application"**
4. **Choose "Docker Compose"** as deployment method
5. **Connect your Git repository**

## Step 3: Repository Configuration

1. **Repository URL**: Point to your forked repository
2. **Branch**: Select `main` or your preferred branch
3. **Build Pack**: Select "Docker Compose"
4. **Docker Compose File**: Use `docker-compose.yml` (or `deployment/coolify-docker-compose.yml` for advanced setup)

## Step 4: Environment Variables

Configure these required environment variables in Coolify:

### Database Configuration
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/geek_mail_pro
PGHOST=postgres
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-secure-password
PGDATABASE=geek_mail_pro
```

### Authentication
```bash
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-domain.com,www.your-domain.com
ISSUER_URL=https://replit.com/oidc
```

### Email Configuration
```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Application
```bash
NODE_ENV=production
PORT=5000
CUSTOM_DOMAIN=thegeektrepreneur.com
```

## Step 5: Domain Configuration

1. **Add your domain** in Coolify dashboard
2. **Configure DNS** to point to Coolify's servers
3. **Enable SSL** (automatic with Let's Encrypt)

## Step 6: Deploy

1. **Click "Deploy"** in Coolify dashboard
2. **Monitor build logs** for any errors
3. **Wait for deployment** to complete
4. **Test the application** at your domain

## Step 7: Post-Deployment Setup

### Database Migration
Once deployed, run database migrations:
```bash
# In Coolify terminal or SSH
npm run db:push
```

### Health Check
Verify deployment:
```bash
curl https://your-domain.com/api/health
```

### Email Testing
Test email functionality through the application dashboard.

## Advanced Configuration

### Using Advanced Docker Compose

For more control, use `deployment/coolify-docker-compose.yml`:

1. **Change Docker Compose file** to `deployment/coolify-docker-compose.yml`
2. **Includes Redis** for session storage
3. **Includes Nginx** for reverse proxy
4. **Includes backup volumes**

### Custom Nginx Configuration

If using the advanced setup:
1. **Nginx config** is in `deployment/nginx.conf`
2. **Includes rate limiting**
3. **Security headers**
4. **Gzip compression**

## Monitoring

### Application Logs
- Check logs in Coolify dashboard
- Monitor application performance
- Track email delivery

### Health Monitoring
- Health endpoint: `/api/health`
- Database connectivity check
- Application uptime monitoring

## Backup Configuration

### Automated Backups
```bash
# Schedule in Coolify cron jobs
0 2 * * * /app/deployment/backup-script.sh
```

### Manual Backup
```bash
# Run backup script
./deployment/backup-script.sh

# Restore from backup
./deployment/restore-script.sh 20241209_143000
```

## Troubleshooting

### Common Issues

1. **Build Failed**
   - Check Docker image compatibility
   - Verify environment variables
   - Check build logs

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Verify network connectivity

3. **Email Not Working**
   - Check SMTP credentials
   - Verify app password (Gmail)
   - Check spam/firewall settings

### Debug Steps

1. **Check health endpoint**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Check application logs**
   - Use Coolify dashboard
   - Look for error messages
   - Check database connections

3. **Test email manually**
   - Use application dashboard
   - Send test campaigns
   - Check delivery status

## Support

### Documentation
- Main README: `/README.md`
- Deployment guide: `/deployment/README.md`
- Production checklist: `/deployment/production-checklist.md`

### Getting Help
1. Check Coolify documentation
2. Review application logs
3. Test individual components
4. Contact support if needed

## Updates

### Automatic Updates
- Push to Git repository
- Coolify automatically redeploys
- Monitor deployment status

### Manual Updates
1. **Update code** in repository
2. **Push changes** to Git
3. **Deploy** in Coolify dashboard
4. **Monitor** deployment progress
5. **Test** functionality

## Security Considerations

### Environment Variables
- Never commit secrets to repository
- Use Coolify's environment management
- Rotate secrets regularly

### Access Control
- Secure Coolify dashboard access
- Use strong passwords
- Enable 2FA if available

### Database Security
- Use strong database passwords
- Enable SSL connections
- Regular security updates