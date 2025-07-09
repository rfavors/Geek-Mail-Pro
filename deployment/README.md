# Geek Mail Pro Deployment Guide

This guide covers deployment of Geek Mail Pro on Coolify.io and other platforms.

## Prerequisites

- PostgreSQL database
- Node.js 20+ runtime
- Required environment variables (see `.env.example`)

## Coolify.io Deployment

### Quick Start

1. **Fork/Clone the repository** to your Git provider
2. **Create a new resource** in Coolify.io
3. **Select "Docker Compose"** as the deployment method
4. **Point to your repository** and select the root directory
5. **Set environment variables** (see configuration section below)
6. **Deploy** - Coolify will automatically build and deploy

### Configuration Files

- `coolify.yml` - Main Coolify configuration
- `deployment/coolify-docker-compose.yml` - Advanced Docker Compose setup
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Local development setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (Required)
SESSION_SECRET=your-session-secret-key
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.com

# Email (Required)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional
ISSUER_URL=https://replit.com/oidc
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Database Setup

The application uses Drizzle ORM for database management:

```bash
# Push schema to database
npm run db:push

# Alternative: Use migrations
npm run db:migrate
```

### Health Monitoring

The application includes a health check endpoint at `/api/health` that monitors:
- Application uptime
- Database connectivity
- Environment status

## Alternative Deployment Platforms

### Railway
- Use `deployment/railway.toml`
- Automatic deployments from Git
- Built-in PostgreSQL addon

### Render
- Use `deployment/render.yaml`
- Automatic deployments from Git
- Built-in PostgreSQL database

### Vercel
- Use `deployment/vercel.json`
- Serverless deployment
- Connect external PostgreSQL database

## Production Optimizations

### Nginx Configuration
- Use `deployment/nginx.conf` for reverse proxy
- Includes rate limiting and security headers
- Gzip compression enabled

### Backup & Restore
- `deployment/backup-script.sh` - Automated backups
- `deployment/restore-script.sh` - Restore from backup
- Includes database and file backups

### Security Features
- Session-based authentication
- HTTPS redirect
- Security headers
- Rate limiting
- Input validation

## Building for Production

```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

## Docker Deployment

```bash
# Build image
docker build -t geek-mail-pro .

# Run with Docker Compose
docker-compose up -d

# Or use Coolify's Docker Compose
docker-compose -f deployment/coolify-docker-compose.yml up -d
```

## Monitoring and Logs

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Status
The health endpoint includes database connectivity checks.

### Application Logs
- Check container logs in Coolify dashboard
- Monitor database connections
- Track email sending status

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check network connectivity

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check SMTP_USER and SMTP_PASS
   - Ensure app passwords are enabled (Gmail)

3. **Authentication Issues**
   - Verify REPL_ID and REPLIT_DOMAINS
   - Check SESSION_SECRET is set
   - Ensure ISSUER_URL is correct

### Debug Mode

Set `NODE_ENV=development` for detailed logs:

```bash
NODE_ENV=development npm start
```

## Scaling

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Redis for session storage (configured in Docker Compose)
- Separate database server

### Database Scaling
- Use connection pooling (already configured)
- Consider read replicas for high traffic
- Regular database maintenance

## Security Considerations

### Environment Variables
- Never commit secrets to version control
- Use Coolify's environment variable management
- Rotate secrets regularly

### Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Access control

### Application Security
- Rate limiting enabled
- Input validation
- XSS protection
- CSRF protection

## Support

For deployment issues:
1. Check the health endpoint
2. Review application logs
3. Verify environment variables
4. Check database connectivity
5. Consult Coolify.io documentation

## Updates

To update the application:
1. Push changes to Git repository
2. Coolify will automatically redeploy
3. Monitor health endpoint after deployment
4. Run database migrations if needed

## Backup Strategy

### Automated Backups
- Daily database backups
- File storage backups
- 7-day retention policy

### Manual Backup
```bash
# Run backup script
./deployment/backup-script.sh

# Restore from backup
./deployment/restore-script.sh 20241209_143000
```