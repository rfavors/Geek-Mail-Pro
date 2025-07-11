# Geek Mail Pro - Email Marketing SaaS Platform

<div align="center">
  <img src="attached_assets/GeekMailProImage_1752066258236.png" alt="Geek Mail Pro" width="200" />
  
  [![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)](https://coolify.io)
  [![Deploy on Coolify](https://img.shields.io/badge/Deploy-Coolify-blue)](https://coolify.io)
  [![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://postgresql.org)
</div>

## 🚀 Overview

Geek Mail Pro is a modern, full-featured email marketing SaaS platform built as a self-hosted alternative to services like Mailchimp. It provides comprehensive email campaign management, contact list management, domain configuration, and analytics capabilities.

### ✨ Key Features

- **🎯 Email Campaigns**: Visual campaign builder with drag-and-drop interface
- **👥 Contact Management**: Advanced segmentation and list management
- **🔄 Email Sequences**: No-code automation builder with templates
- **📊 Analytics Dashboard**: Real-time metrics and performance tracking
- **🌐 Custom Domains**: Full domain management with DNS verification
- **📧 Email Forwarding**: Intelligent email routing and forwarding
- **🎨 Template Library**: Professional email templates
- **📈 Lead Generation**: Forms, campaigns, and conversion tracking

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 20, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Email**: SMTP integration with Nodemailer
- **Deployment**: Docker, Coolify.io

## 🚀 Quick Start with Coolify.io

### Prerequisites

- Coolify.io account
- Git repository (GitHub, GitLab, etc.)
- Domain name (optional)

### 1. Deploy to Coolify

[![Deploy to Coolify](https://img.shields.io/badge/Deploy_to-Coolify-0066CC?style=for-the-badge&logo=docker&logoColor=white)](https://coolify.io)

1. **Fork this repository** to your Git provider
2. **Create new resource** in Coolify dashboard
3. **Select "Docker Compose"** deployment
4. **Connect your repository**
5. **Configure environment variables** (see below)
6. **Deploy** - Coolify handles the rest!

### 2. Environment Variables

Configure these in Coolify dashboard:

```bash
# Database (Auto-configured by Coolify)
DATABASE_URL=postgresql://user:password@postgres:5432/geek_mail_pro

# Authentication (Required)
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-domain.com
ISSUER_URL=https://replit.com/oidc

# Email Configuration (Required)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Application
NODE_ENV=production
PORT=5000
```

### 3. Post-Deployment Setup

After successful deployment:

```bash
# Run database migrations
npm run db:push

# Verify deployment
curl https://your-domain.com/api/health
```

## 🛠️ Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Git

### Setup

```bash
# Clone repository
git clone <your-repo-url>
cd geek-mail-pro

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables in .env
# (See Environment Variables section above)

# Setup database
npm run db:push

# Start development server
npm run dev
```

Application will be available at `http://localhost:5000`

## 📁 Project Structure

```
geek-mail-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # React hooks
│   │   └── lib/           # Utilities
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database layer
│   ├── auth.ts           # Authentication
│   └── emailForwarding.ts # Email services
├── shared/                 # Shared types
│   └── schema.ts          # Database schema
├── deployment/            # Deployment configs
│   ├── coolify-setup.md   # Coolify guide
│   ├── nginx.conf         # Nginx config
│   └── backup-script.sh   # Backup utilities
├── Dockerfile             # Container config
├── docker-compose.yml     # Local orchestration
└── coolify.yml           # Coolify config
```

## 🔧 Configuration

### Database Schema

The application uses 21 tables for comprehensive functionality:

- **Users & Authentication**: Session management, user profiles
- **Domain Management**: Custom domains, DNS verification
- **Email System**: Aliases, forwarding rules, logs
- **Contact Management**: Lists, segments, contacts
- **Campaign System**: Campaigns, sequences, analytics
- **Lead Generation**: Sources, leads, conversion tracking

### Email Configuration

#### SMTP Setup (Gmail Example)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Configure Environment**:
   ```bash
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

#### Custom Domain Email

1. **Configure DNS records** for your domain
2. **Set up email forwarding** with Mailgun/SendGrid
3. **Configure webhook** endpoint: `/api/webhook/email`

## 📊 Features Overview

### Campaign Management
- Visual email builder with drag-and-drop
- Template library with professional designs
- A/B testing capabilities
- Scheduled and immediate sending
- Performance analytics

### Contact Management
- CSV import/export
- Advanced segmentation
- Custom fields and properties
- List membership management
- Behavior tracking

### Automation
- Email sequence builder
- Trigger-based automation
- Conditional logic
- Template library
- Analytics tracking

### Analytics
- Real-time campaign metrics
- Open and click tracking
- Conversion tracking
- Revenue attribution
- Exportable reports

## 🔒 Security Features

- **Authentication**: Session-based with OpenID Connect
- **Data Protection**: Encrypted connections, input validation
- **Security Headers**: Helmet.js with CSP
- **Rate Limiting**: API and login protection
- **Access Control**: User-based permissions

## 📋 API Endpoints

### Health Check
```bash
GET /api/health
```

### Authentication
```bash
GET /api/auth/user
GET /api/login
GET /api/logout
```

### Campaigns
```bash
GET /api/campaigns
POST /api/campaigns
PUT /api/campaigns/:id
DELETE /api/campaigns/:id
```

### Contacts
```bash
GET /api/contacts
POST /api/contacts
PUT /api/contacts/:id
DELETE /api/contacts/:id
```

[Full API documentation available in `/docs`]

## 🚀 Deployment Options

### Coolify.io (Recommended)
- One-click deployment
- Automatic SSL certificates
- Built-in monitoring
- Easy scaling

### Alternative Platforms
- **Railway**: Use `deployment/railway.toml`
- **Render**: Use `deployment/render.yaml`
- **Vercel**: Use `deployment/vercel.json`
- **Docker**: Use `docker-compose.yml`

## 🔄 Backup & Maintenance

### Automated Backups
```bash
# Database and files backup (scheduled in Coolify)
./deployment/backup-script.sh

# Restore from backup
./deployment/restore-script.sh 20241209_143000
```

### Health Monitoring
- Health endpoint: `/api/health`
- Database connectivity checks
- Performance monitoring
- Error tracking

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:studio    # Open database studio
npm run check        # Type checking
```

### Database Management

```bash
# Push schema changes
npm run db:push

# Open database studio
npm run db:studio

# Generate migrations
npm run db:migrate
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

### Documentation
- [Deployment Guide](deployment/README.md)
- [Coolify Setup](deployment/coolify-setup.md)
- [Production Checklist](deployment/production-checklist.md)

### Getting Help
1. Check the [deployment guide](deployment/README.md)
2. Review application logs in Coolify
3. Test health endpoint: `/api/health`
4. Open issue in repository

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Express](https://expressjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database management with [Drizzle ORM](https://orm.drizzle.team/)
- Deployment powered by [Coolify.io](https://coolify.io/)

---

<div align="center">
  <strong>Ready to launch your email marketing platform? Deploy to Coolify.io now!</strong>
  
  [![Deploy to Coolify](https://img.shields.io/badge/Deploy_Now-Coolify-0066CC?style=for-the-badge&logo=docker&logoColor=white)](https://coolify.io)
</div>