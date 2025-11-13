# Since On Earth - Flight Tracking Application

## Overview
A full-stack flight and travel tracking application built with React, Express, and PostgreSQL. Users can log flights, accommodations, and visualize their travel history.

**Official Domain:** sinceonearth.com

## Current Status
✅ **Running on Replit with Neon Database**
- Frontend: React + Vite on port 5000
- Backend: Express with JWT authentication
- Database: Neon PostgreSQL (ep-holy-recipe-aed2z25m-pooler)
- Authentication: Working (register/login)
- **Invite-Only Access:** Hybrid system with invite codes and admin approval
- **Data:** 74 flights, 67 stay-ins, 47,566 airports, 122 airlines, 1 user

## Project Structure
```
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Main server file
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication routes
│   ├── db.ts            # Database connection
│   └── storage.ts       # Database queries
└── shared/              # Shared types and schemas
    └── schema.ts        # Drizzle ORM schemas
```

## Database Schema
All 8 tables with complete data:
- **users** (13 columns): User accounts with authentication
- **flights** (21 columns): Flight records with departure/arrival details
- **stayins** (10 columns): Accommodation records
- **airports** (15 columns): Airport reference data (47,566 records)
- **airlines** (6 columns): Airline reference data (122 records)
- **invite_codes** (9 columns): Invite system for registration
- **contact_messages** (7 columns): Contact form submissions
- **sessions** (3 columns): User session management

## Environment Configuration
### Required Secrets (Already Configured):
- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key

## Development Workflow
The app runs in development mode with:
- Vite dev server integrated via Express middleware
- Hot Module Replacement (HMR) enabled
- Port 5000 for all traffic (frontend + backend)

## Key Configuration
### Vite (client/vite.config.ts)
- Configured for Replit proxy with `allowedHosts: true`
- HMR client port set to 443 for HTTPS
- API proxy: `/api` routes to backend

### Backend (server/index.ts)
- Binds to `0.0.0.0:5000`
- CORS enabled with credentials
- Session management with PostgreSQL store

## API Endpoints
### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user (requires auth)

### Flights
- `GET /api/flights` - List user's flights
- `POST /api/flights` - Add new flight

### Stay-ins
- `GET /api/stayins` - List accommodations
- `POST /api/stayins` - Add accommodation

## Deployment
Configured for Replit Autoscale deployment:
- Build: `npm run build`
- Start: `npm run start`

## Test Account
- Email: test@example.com
- Password: password123

## Invite-Only Access System 🎟️

The app uses a **hybrid invite system**:

### Option 1: Invite Code (Instant Access)
- Users enter a valid invite code during registration
- Account is automatically approved
- Can start using the app immediately

### Option 2: Manual Approval
- Users register without an invite code
- Account created but set to "pending approval"
- Admin must approve before user can login

### Admin Features
Admins can access `/admin` dashboard to:
- Generate invite codes (one-time or multi-use, with optional expiry)
- View pending user registrations
- Approve or reject pending users
- View all invite codes and their usage

### API Endpoints
**Admin Only:**
- `POST /api/admin/invite-codes` - Create new invite code
- `GET /api/admin/invite-codes` - List all codes
- `GET /api/admin/pending-users` - View pending approvals
- `POST /api/admin/approve-user/:userId` - Approve user
- `DELETE /api/admin/reject-user/:userId` - Reject/delete user

## Database Schema Updates
Added tables and fields:
- **invite_codes table**: Stores invite codes with usage tracking
- **users.approved**: Boolean flag for account approval status
- **users.invite_code_used**: Tracks which code was used

## Database Connection Files
All files correctly use `DATABASE_URL` environment variable:
- **server/db.ts**: Drizzle ORM connection (Neon HTTP client)
- **server/storage.ts**: PostgreSQL Pool for raw SQL queries
- **drizzle.config.ts**: Drizzle migrations configuration
- **server/index.ts**: Environment validation

## Recent Changes (Nov 4, 2025)
**Database Migration Completed:**
- ✅ Migrated to new Neon database (ep-holy-recipe-aed2z25m-pooler)
- ✅ All 8 tables created with correct schemas
- ✅ Complete data migration: 74 flights, 67 stay-ins, 47,566 airports, 122 airlines, 1 user
- ✅ All API routes verified and working with new database
- ✅ Frontend and backend connected successfully

## Previous Changes (Nov 2, 2025)
1. Configured Vite for Replit proxy environment
2. Connected to user's Neon database
3. Fixed allowedHosts configuration
4. Improved GetStarted page UI with animations and gradients
5. Set up deployment configuration
6. Implemented hybrid invite-only access system
7. Added admin dashboard endpoints for user/invite management
8. Updated registration flow to support invite codes
9. Added contact form system with database and admin panel
10. Created Account/Settings page with profile editing and password change
11. Updated navigation: Settings in FooterNav, simplified Header
12. Applied consistent capsule button theme across all forms
13. Fixed Settings save changes - added `name` field to `/api/auth/user` endpoint
14. Increased spacing in Achievements page title
15. **Fixed country count discrepancy**: Both stats dashboard and Achievements now check IATA and ICAO codes
16. Made all action buttons (Save Changes, Change Password, Send Message) full width in Settings page
17. **Hidden Places capsule** in stats dashboard (showing only Countries, Flights, Airports, Stay Ins)
18. **PWA splash screen fix**: Changed manifest background_color from white to black (#000000) to prevent white flash on app launch
19. **Alien loading screen**: Blinking alien icon (96px) shows for all users during auth check with black background
20. **Login/Register form positioning**: Centered forms vertically on mobile devices for better UX (min-h-screen with items-center)
21. **GetStarted page enhancements**:
    - Changed bottom card to green gradient background with white button
    - Simplified to only "Create new account" button and "I already have an account" link
    - Updated slide headings to match CompanyPage green gradient (from-green-400 via-emerald-500 to-green-600)

## Known Issues
- Google Fonts CDN may show ERR_NAME_NOT_RESOLVED (non-blocking)
- Stayins form working correctly - verified ✅

## Next Steps
- Create admin dashboard UI for managing invites
- Set up custom domain (sinceonearth.com)
- Import flight/airport data if needed
- Test complete invite flow
