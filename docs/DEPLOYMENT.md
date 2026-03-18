# Deployment Guide 🚀

This guide covers deploying the Olive Marketplace to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [AWS Deployment](#aws-deployment)
- [Docker Deployment](#docker-deployment)
- [Database Setup](#database-setup)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

Before deploying, ensure you have:

- A Supabase project set up
- Environment variables configured
- Domain name (optional)
- SSL certificate (handled automatically by most platforms)

## Environment Setup

### 1. Create Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.production
```

### 2. Fill in Required Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional (for future features)
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
RESEND_API_KEY=your_resend_key
```

### 3. Supabase Configuration

Ensure your Supabase project has:

1. **Authentication providers** configured
2. **Database tables** created (run migrations)
3. **Storage buckets** for images
4. **Row Level Security (RLS)** policies
5. **CORS settings** for your domain

## Vercel Deployment (Recommended)

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### 2. Configure Project

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SITE_URL": "https://yourdomain.vercel.app"
    }
  }
}
```

### 3. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Environment Variables in Vercel

Add environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Select appropriate environments (Production, Preview, Development)

## Netlify Deployment

### 1. Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_SITE_URL = "https://yourdomain.netlify.app"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Deploy via Git

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### 3. Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next
```

## AWS Deployment

### 1. Using AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### 2. Using EC2 with Docker

See [Docker Deployment](#docker-deployment) section.

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_SITE_URL=${SITE_URL}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 3. Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

## Database Setup

### 1. Supabase Migrations

Run migrations in Supabase dashboard:

```sql
-- Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer',
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE producers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  certification TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  stock INTEGER DEFAULT 0,
  olive_variety TEXT NOT NULL,
  harvest_year INTEGER NOT NULL,
  origin_region TEXT,
  origin_country TEXT NOT NULL,
  organic BOOLEAN DEFAULT FALSE,
  intensity TEXT CHECK (intensity IN ('mild', 'medium', 'intense')),
  volume_ml INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add more policies as needed...
```

### 2. Storage Setup

Create storage buckets in Supabase:

```sql
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow public access to product images
CREATE POLICY "Public images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');
```

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Site loads correctly
- [ ] All pages are accessible
- [ ] Authentication works
- [ ] Database connections work
- [ ] Image uploads work
- [ ] Forms submit correctly

### 2. Performance Check

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify image optimization
- [ ] Test on mobile devices

### 3. Security Check

- [ ] HTTPS is working
- [ ] Environment variables are secure
- [ ] RLS policies are active
- [ ] CORS is configured correctly
- [ ] No sensitive data in client-side code

### 4. Monitoring Setup

- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Configure backup strategies

### 5. SEO Check

- [ ] Meta tags are correct
- [ ] Sitemap is accessible
- [ ] Robots.txt is configured
- [ ] Structured data is valid
- [ ] Open Graph tags work

## Environment-Specific Notes

### Production

- Use production Supabase project
- Enable all security features
- Set up monitoring and alerts
- Configure backup strategies
- Use CDN for static assets

### Staging

- Use staging Supabase project
- Test all features before production
- Use test data, not real customer data
- Configure staging-specific domains

### Development

- Use local development environment
- Hot reload enabled
- Debug mode on
- Use mock data when needed

## Troubleshooting

### Common Issues

1. **Build fails on Vercel**
   - Check environment variables
   - Verify Node.js version compatibility
   - Review build logs

2. **Database connection errors**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure CORS is configured

3. **Image upload failures**
   - Check storage bucket permissions
   - Verify file size limits
   - Check CORS settings

4. **Authentication issues**
   - Verify auth providers are configured
   - Check redirect URLs
   - Ensure JWT secrets match

### Getting Help

- Check deployment platform logs
- Review Next.js documentation
- Consult Supabase documentation
- Check GitHub issues

## Maintenance

### Regular Tasks

- Update dependencies
- Monitor database performance
- Review security policies
- Backup important data
- Update SSL certificates

### Scaling Considerations

- Database optimization
- CDN configuration
- Load balancing
- Caching strategies
- Monitoring and alerting

---

For additional support, refer to the [main documentation](../README.md) or create an issue in the repository.
