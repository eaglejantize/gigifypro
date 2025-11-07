# GigifyPro Deployment Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
- npm or yarn package manager

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Generate a secure random string (use `openssl rand -base64 32`)
   - `PORT`: Server port (default: 5000)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (if using payments)
   - `NODE_ENV`: Set to `production` for production deployments

## Database Setup

1. Run database migrations:
   ```bash
   npm run db:push
   ```

2. (Optional) Seed the database with initial data:
   ```bash
   npm run seed
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the development server with hot-reloading on port 5000 (or your configured PORT).

### Production Mode
```bash
npm start
```
This will start the production server using the built files.

## Deployment Platforms

### Replit
The application is already configured for Replit. Simply:
1. Set up environment variables in the Replit Secrets panel
2. Click "Run" to start the application

### Vercel/Netlify
For serverless deployments:
1. Configure the build command: `npm run build`
2. Configure the start command: `npm start`
3. Set environment variables in the platform dashboard
4. Ensure your PostgreSQL database is accessible from the platform

### Docker
A Dockerfile can be added if needed. Basic setup:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Post-Deployment Checklist

- [ ] Verify DATABASE_URL is correctly set
- [ ] Verify SESSION_SECRET is a secure random string (not the default)
- [ ] Verify NODE_ENV is set to "production"
- [ ] Test user registration and login
- [ ] Test posting tasks/services
- [ ] Test community features
- [ ] Test store/payment functionality (if enabled)
- [ ] Check application logs for errors
- [ ] Verify all static assets load correctly
- [ ] Test responsive design on mobile devices

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format is correct
- Ensure database is accessible from your deployment platform
- Check firewall rules allow connections
- For Neon database, ensure HTTP driver is being used (already configured)

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Verify Node.js version is 20+

### Runtime Errors
- Check application logs for specific error messages
- Verify all required environment variables are set
- Ensure database migrations have been run

## Monitoring

Recommended monitoring:
- Set up error tracking (e.g., Sentry)
- Monitor database performance
- Track API response times
- Monitor bundle size and load times

## Security Notes

- Never commit `.env` file to version control
- Use strong, randomly generated SESSION_SECRET in production
- Keep dependencies up to date: `npm audit fix`
- Review and address security advisories regularly
- Use HTTPS in production
- Configure proper CORS settings for your domain
- Enable rate limiting for API endpoints if needed

## Performance Optimization

The application includes:
- Code splitting for vendor bundles
- Optimized React context to prevent unnecessary re-renders
- Production build optimizations via Vite
- Lazy loading can be added for large components if needed

## Support

For issues or questions:
1. Check the repository issues
2. Review the code documentation
3. Contact the development team
