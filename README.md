# Even Playground 🏟️

**A Comprehensive Institutional Sports Management Platform**

Even Playground is a modern, full-featured sports management platform designed to connect athletes, institutions (schools, clubs, academies), and parents/guardians in a unified ecosystem. Built with React, TypeScript, and Supabase, it provides enterprise-grade tools for athlete development tracking, institutional management, attendance monitoring, performance analytics, and community engagement.

![Platform Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Private-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Features

### For Athletes 🏃‍♂️
- **Performance Tracking**: Log and visualize performance metrics (speed, strength, agility, VO2 max)
- **Match Statistics**: Track wins, losses, draws, and individual match performance
- **Achievement System**: Earn badges and level up through the ranking system (Rookie → Professional)
- **Highlight Reels**: Upload and showcase video highlights and photos
- **Profile Management**: Build comprehensive athletic profiles with federation IDs (MYSAFA, FIFA)
- **Progress Analytics**: View performance trends over time with interactive charts
- **Community Engagement**: Participate in social feeds, groups, and talent discovery zones

### For Institutions (Schools/Clubs/Academies) 🏫
- **Athlete Roster Management**: Create and manage athlete profiles (stub and claimed records)
- **Team Organization**: Multi-squad team management by age groups, skill levels, and seasons
- **Fixture Scheduling**: Schedule and manage matches, competitions, and events
- **Attendance Tracking**: Monitor training sessions, matches, and meetings with detailed reporting
- **Compliance Documents**: Manage medical forms, consent forms, and certifications with expiry tracking
- **Announcements**: Broadcast messages to athletes and parents with read receipt tracking
- **Performance Analytics**: Institution-wide dashboards with KPIs and trend analysis
- **Verification Workflows**: Review and approve athlete documents and credentials
- **Bulk Operations**: Import/export athlete data via CSV (enterprise feature)

### For Parents/Guardians 👨‍👩‍👧‍👦
- **Child Monitoring**: View linked children's athletic progress and performance
- **Attendance Reports**: Track participation in training and matches
- **Announcements**: Receive institution communications and updates
- **Achievement Notifications**: Get alerted when children earn awards or reach milestones
- **Multi-Child Support**: Monitor multiple athletes from a single dashboard

### For Platform Administrators 🛡️
- **Master Admin Dashboard**: Platform-wide oversight and user management
- **Diagnostics Tools**: System health monitoring and troubleshooting
- **Audit Logs**: Complete audit trail of administrative actions
- **User Management**: Role assignments, account management, and support tools
- **Data Integrity**: Deduplication pipelines and data validation

### Platform-Wide Features 🌐
- **Community Buzz**: Social feed for transfers, youth sports, local/international news
- **Talent Discovery Zone**: Scout and discover athletes across the platform
- **POPIA/GDPR Compliance**: Consent management with version tracking
- **Multi-Sport Support**: Football, Rugby, Athletics, Cricket, Basketball, E-Gaming, Wall Climbing, Parkour, Culture - Dancing
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization via Supabase Realtime

---

## 👥 User Roles

### 1. Athlete
- Personal performance dashboard
- Match statistics and achievements
- Media gallery for highlights
- Profile with federation credentials
- Community participation

### 2. Institution (School/Club/Academy/Federation)
- Multi-athlete management
- Team and fixture organization
- Attendance and compliance tracking
- Institutional analytics
- Communication hub

**Institution Types:**
- **School & Educational Institution**: High schools, colleges, universities
- **Club, Academy or Community Center**: Sports clubs, academies, community organizations
- **Federation & Association**: Regional/national sports governing bodies

### 3. Parent/Guardian (Fan Role)
- Child progress monitoring
- Attendance visibility
- Announcement reception
- Multi-child support

### 4. Master Admin
- Full platform access
- User management and diagnostics
- Audit log review
- System configuration
- RLS policy bypass

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 (fast HMR, optimized builds)
- **Routing**: React Router 6.30.1
- **UI Components**: shadcn/ui + Radix UI primitives (accessible, customizable)
- **Styling**: Tailwind CSS 3.4.17 with custom animations
- **State Management**:
  - Server State: TanStack Query 5.83.0 (caching, retries, synchronization)
  - Global State: React Context (AuthContext, ProfileContext)
  - Local State: React hooks (useState, useEffect)
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76 (schema validation)
- **Charts**: Recharts 2.15.4 (interactive data visualization)
- **Animations**: Framer Motion 12.36.0 (smooth transitions)
- **Icons**: Lucide React 0.462.0
- **SEO**: React Helmet Async 3.0.0

### Backend & Infrastructure
- **BaaS Provider**: Supabase (open-source Firebase alternative)
- **Database**: PostgreSQL 15+ with Row-Level Security (RLS)
- **Authentication**: Supabase Auth (email/password, magic links, OAuth)
- **Storage**: Supabase Storage (athlete media, compliance documents)
- **Real-time**: Supabase Realtime (live data subscriptions)
- **Business Logic**: PostgreSQL RPCs and trigger functions
- **API**: Auto-generated RESTful API via Supabase

### Development & Testing
- **Package Manager**: npm / Bun
- **Linting**: ESLint 9.32.0 + TypeScript ESLint
- **Testing**: Vitest 3.2.4 (unit tests), Playwright 1.57.0 (E2E tests)
- **Type Checking**: TypeScript strict mode
- **Code Quality**: Husky pre-commit hooks (planned)

### Deployment
- **CI/CD**: GitHub Actions
- **Hosting**: Hostinger / Vercel (configurable)
- **Environment**: `.env` variables for configuration
- **Database Migrations**: Supabase CLI

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Even Playground                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │   Frontend   │◄────►│   Supabase   │                 │
│  │   (React)    │      │   Backend    │                 │
│  └──────────────┘      └──────────────┘                 │
│         │                       │                        │
│         ▼                       ▼                        │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │  React Query │      │ PostgreSQL   │                 │
│  │  (Caching)   │      │   (RLS)      │                 │
│  └──────────────┘      └──────────────┘                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         User Roles & Permissions                 │  │
│  │  Athlete │ Institution │ Parent │ Master Admin   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: Supabase Auth → JWT tokens → React Context
2. **Data Fetching**: React Query → Supabase Client → PostgreSQL (with RLS)
3. **Real-time Updates**: Supabase Realtime subscriptions → UI re-renders
4. **File Uploads**: Client → Supabase Storage → Public URLs → Database records
5. **Business Logic**: Client RPC calls → PostgreSQL functions → Results

### Security Model

- **Row-Level Security (RLS)**: Every table has RLS policies
- **Role-Based Access Control**: Enforced at application and database layers
- **Master Admin Bypass**: Centralized `is_master_admin()` function
- **Data Isolation**: Institutions can only access their own data
- **Parent Access**: Parents can only view linked children
- **Storage Policies**: Bucket-level RLS for file uploads

---

## 🗄 Database Schema

### Core Tables (35+ tables)

#### User Management
- `profiles` - Base user profiles with POPIA consent
- `user_roles` - Role assignments (athlete, institution, fan, master_admin)
- `athletes` - Athlete records (stub and claimed)
- `institutions` - Organization profiles
- `parents` - Parent/guardian profiles
- `parent_athletes` - Parent-child relationships

#### Performance & Matches
- `performance_metrics` - Physical testing data (speed, strength, etc.)
- `match_stats` - Individual match performance
- `matches` - Team fixtures
- `teams` - Team rosters
- `team_members` - Squad assignments
- `achievements` - Athlete awards and badges
- `coach_feedback` - Coach evaluations
- `media_gallery` - Photos and videos

#### Institutional Operations
- `attendance_sessions` - Training/match sessions
- `attendance_records` - Individual attendance
- `institution_announcements` - Broadcast messages
- `announcement_reads` - Read receipts
- `athlete_documents` - Compliance paperwork
- `verifications` - Document approval workflow

#### Advanced Features (Phase 4)
- `bulk_import_jobs` - CSV import tracking
- `bulk_export_jobs` - Data export jobs
- `integration_configurations` - Third-party integrations
- `institution_branding` - White-label customization
- `query_cache` - Query result caching
- `api_rate_limits` - Rate limiting configuration
- `system_health_metrics` - Health tracking
- `admin_notes` - Administrative notes

### Row-Level Security (RLS)

Every table implements RLS policies with the following patterns:

```sql
-- Example: Athletes table
CREATE POLICY "Institutions can view their athletes"
ON athletes FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Master admin full access"
ON athletes FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));
```

### Materialized Views (Performance Optimization)

- `mv_daily_institution_stats` - Daily KPI snapshots
- `mv_weekly_performance_trends` - Weekly aggregations
- `mv_monthly_attendance` - Monthly attendance rates

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** or **Bun** package manager
- **Supabase Account** ([sign up](https://supabase.com))
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EvenPlay-LQ/even-play-data.git
   cd even-play-data
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or with Bun
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_project_id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```
   
   Get these values from your Supabase Dashboard:
   - Go to [Supabase](https://app.supabase.com) → Your Project → Settings → API

4. **Set up Supabase database**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your Supabase project
   npx supabase link --project-ref your_project_id
   
   # Apply all migrations
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### First-Time Setup

1. **Create Master Admin Account**
   - Sign up via the application
   - Email must match the hardcoded master admin email in the codebase
   - Or manually add to `user_roles` table with `master_admin` role

2. **Configure Institution Types**
   - School & Educational Institution
   - Club, Academy or Community Center
   - Federation & Association

3. **Set up Sports Categories**
   - Football, Rugby, Athletics, Cricket, Basketball
   - E-Gaming, Wall Climbing, Parkour, Culture - Dancing

---

## 💻 Development Workflow

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
even-play-data/
├── public/                      # Static assets
│   ├── images/                  # Images
│   └── favicon.ico              # Favicon
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── DashboardLayout.tsx  # Dashboard layout
│   │   ├── ProtectedRoute.tsx   # Route guards
│   │   └── FileUpload.tsx       # File upload component
│   ├── pages/                   # Page components
│   │   ├── athlete/             # Athlete dashboard pages
│   │   ├── institution/         # Institution dashboard pages
│   │   ├── admin/               # Admin pages
│   │   ├── SignupWizard.tsx     # Multi-step signup
│   │   ├── AthleteDashboard.tsx
│   │   ├── InstitutionDashboard.tsx
│   │   └── ParentDashboard.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.tsx          # Authentication context
│   │   ├── useProfile.tsx       # Profile management
│   │   └── useMasterAdmin.ts    # Admin utilities
│   ├── integrations/            # Third-party integrations
│   │   └── supabase/            # Supabase client & types
│   ├── lib/                     # Utilities
│   │   ├── queryHelpers.ts      # Query error handling
│   │   ├── validations.ts       # Zod schemas
│   │   └── utils.ts             # Helper functions
│   ├── config/                  # Configuration
│   │   └── constants.ts         # App constants
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── supabase/
│   ├── migrations/              # Database migrations
│   └── config.toml              # Supabase configuration
├── .env                         # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
└── tailwind.config.ts           # Tailwind config
```

### Database Migrations

Migrations are located in `supabase/migrations/` and follow a timestamp naming convention:

```
20260412000000_update_institution_types_and_sports.sql
20260412000001_setup_organizations.sql
```

**Apply migrations:**
```bash
npx supabase db push
```

**Create new migration:**
```bash
npx supabase migration add description_of_change
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforces best practices
- **Prettier**: Code formatting (configured via Tailwind)
- **Naming**: 
  - Components: PascalCase (`SignupWizard.tsx`)
  - Functions: camelCase (`handleCompleteSetup`)
  - Constants: UPPER_SNAKE_CASE (`SPORT_OPTIONS`)

---

## 🌐 Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview locally
npm run preview
```

### Deploy to Hostinger

The project includes GitHub Actions workflow for automated FTP deployment:

1. Push to `main` branch
2. GitHub Actions builds the project
3. Files are deployed via FTP to Hostinger

Configure secrets in GitHub:
- `FTP_HOST`
- `FTP_USERNAME`
- `FTP_PASSWORD`

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Supabase Production Setup

1. **Create production project** on Supabase
2. **Update `.env`** with production credentials
3. **Apply migrations**:
   ```bash
   npx supabase db push --db-url your_production_db_url
   ```
4. **Configure Auth**: Set up email templates, redirects
5. **Set up Storage**: Create buckets with RLS policies

---

## 📚 Documentation

### Detailed Guides

- **[Organization Setup Guide](ORGANIZATION_SETUP_GUIDE.md)** - Complete setup for M-Power Elite and Izinsele Academy
- **[Platform Update Summary](PLATFORM_UPDATE_SUMMARY.md)** - Recent changes and updates
- **[Comprehensive Audit Report](COMPREHENSIVE_AUDIT_REPORT.md)** - Full platform audit (85% production-ready)
- **[Phase 4 Complete](PHASE_4_COMPLETE.md)** - Enterprise features documentation
- **[Institutional Client Roadmap](INSTITUTIONAL_CLIENT_ROADMAP.md)** - Development roadmap

### API Documentation

Supabase auto-generates RESTful APIs. Access via:
```
https://your-project.supabase.co/rest/v1/
```

Use the Supabase JavaScript client:
```typescript
import { supabase } from "@/integrations/supabase/client";

// Query athletes
const { data: athletes } = await supabase
  .from("athletes")
  .select("*")
  .eq("institution_id", institutionId);
```

### Database Documentation

- **Schema**: See migrations in `supabase/migrations/`
- **RLS Policies**: Documented in migration files
- **RPCs**: PostgreSQL functions for business logic

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# E2E tests (requires Playwright)
npx playwright test
```

### Test Coverage

Current coverage: <10% (improvement needed)

**Priority areas for testing:**
1. SignupWizard workflows
2. Authentication flows
3. RLS policy enforcement
4. Data validation (Zod schemas)
5. Dashboard data fetching

---

## 🤝 Contributing

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Commit Message Convention

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] ESLint has no errors
- [ ] Tests pass (if applicable)
- [ ] No console.log statements
- [ ] RLS policies considered
- [ ] Responsive design tested
- [ ] Accessibility checked

---

## 🔐 Security

### Best Practices

- ✅ Row-Level Security on all tables
- ✅ Environment variables for secrets
- ✅ Input validation with Zod
- ✅ XSS protection via React
- ✅ CSRF protection via Supabase
- ✅ HTTPS enforced in production

### Known Issues

- ⚠️ Master admin hardcoded by email (planned: database role)
- ⚠️ Password strength requirements (minimum 6 chars, should be 8+)
- ⚠️ No MFA implementation yet

### Reporting Vulnerabilities

Contact: lqlake215@gmail.com

---

## 📊 Performance

### Benchmarks

| Metric | Value |
|--------|-------|
| Initial Page Load | ~2s |
| Time to Interactive | ~3.5s |
| API Response Time (p95) | ~400ms |
| Database Query Time (p95) | ~150ms |
| Bundle Size (main.js) | ~1.2MB |

### Optimizations

- ✅ Materialized views for analytics
- ✅ React Query caching
- ✅ Database indexes (50+)
- ✅ Query result caching
- ✅ Code splitting with lazy loading
- ✅ Debounced search inputs

---

## 🎯 Roadmap

### Completed ✅
- Phase 1: Attendance & Communication (100%)
- Phase 2: Team & Fixture Management (100%)
- Phase 3: Analytics & Insights (80%)
- Phase 4: Enterprise Infrastructure (100% DB, 70% UI)

### In Progress 🚧
- Bulk Import Wizard UI
- Integration Settings UI
- E2E Test Suite
- Production Monitoring (Sentry)

### Planned 📋
- Mobile Apps (iOS/Android)
- AI Insights Engine
- Live Match Tracking
- Multi-region Deployment
- Payment Integration (Stripe)
- Video Platform Integration (Hudl)

---

## 📞 Support

- **Email**: lqlake215@gmail.com
- **Issues**: [GitHub Issues](https://github.com/EvenPlay-LQ/even-play-data/issues)
- **Documentation**: See `/docs` and markdown files in root

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

## 🙏 Acknowledgments

- **Supabase** for the incredible BaaS platform
- **shadcn/ui** for beautiful, accessible components
- **Vite** for blazing-fast builds
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessibility primitives

---

## 📈 Project Stats

- **Database Tables**: 35+
- **Frontend Pages**: 20+
- **Migration Files**: 24
- **Lines of Code**: ~8,500+ (frontend), ~2,000+ (SQL)
- **Completion**: 85% production-ready

---

**Built with ❤️ for the sports community**

*Even Playground - Empowering Athletes, Institutions, and Parents*
