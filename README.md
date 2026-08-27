# SKILLBRIDGE - Complete Authentication System

A production-ready authentication and authorization system built with Next.js, Supabase, and Tailwind CSS.

## Features

✅ **Email/Password Authentication**
- Secure signup and login
- Email verification
- Password reset functionality
- Persistent Supabase authentication

✅ **User Profiles**
- Complete profile management
- User information storage
- Avatar and bio support
- Profile editing capabilities

✅ **Role-Based Access Control**
- User and Admin roles
- Server-side role model
- Protected routes and pages
- Role-based dashboard access

✅ **Protected Pages**
- Dashboard (for all authenticated users)
- Admin panel (admin-only access)
- User profile page
- Automatic redirection for unauthorized access

✅ **Database**
- SQL schema with migrations
- Row-Level Security (RLS) policies
- Optimized indexes
- Automatic timestamp management

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel Ready

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/icessesbiney-glitch/SKILLBRIDGE.git
cd SKILLBRIDGE
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API to get your credentials:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

### 4. Configure Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Set Up Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the SQL from `sql/schema.sql`
4. Run the query

### 6. Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email Provider
3. Configure email settings if needed

### 7. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
SKILLBRIDGE/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── dashboard/            # User dashboard
│   │   ├── profile/              # User profile
│   │   ├── admin/                # Admin dashboard
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── UserProfile/
│   │   │   └── ProfileCard.tsx
│   │   ├── Navigation/
│   │   │   └── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── lib/
│   │   └── supabase.ts           # Supabase client
│   └── styles/
│       └── globals.css           # Global styles
├── sql/
│   └── schema.sql                # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── .env.local                    # Environment variables
└── README.md
```

## Database Schema

### profiles table
```sql
- id (UUID) - Primary key, references auth.users
- email (TEXT) - User email
- full_name (TEXT) - User's full name
- avatar_url (TEXT) - Avatar image URL
- role (TEXT) - 'user' or 'admin'
- created_at (TIMESTAMP) - Account creation date
- updated_at (TIMESTAMP) - Last update date
```

## RLS Policies

**Row Level Security** is enabled to ensure data privacy:

- Users can only view their own profile
- Users can only update their own profile
- Admins can view all profiles
- Admins can update all profiles

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account
- `POST /api/auth/logout` - Logout

### Protected Routes
- `/dashboard` - User dashboard (authenticated only)
- `/profile` - User profile (authenticated only)
- `/admin` - Admin dashboard (admin only)

## Key Features Explained

### AuthContext
Global authentication state management using React Context API. Provides:
- Current user information
- Loading state
- Sign out function

### ProtectedRoute Component
Wrapper component that:
- Checks if user is authenticated
- Redirects to login if not
- Shows loading spinner while checking auth
- Supports optional role-based restrictions

### ProfileCard Component
User profile management component with:
- Display user information
- Edit profile functionality
- Show user role
- Update full name

### Admin Dashboard
Admin-only page with:
- View all users
- Toggle user roles
- User statistics
- Admin-only features list

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Deploy to Other Platforms

The project is compatible with any Node.js hosting:
- AWS Amplify
- Railway
- Heroku
- Netlify
- etc.

## Security Best Practices

✅ Environment variables for sensitive data
✅ Row-Level Security (RLS) on database
✅ Protected routes with authentication checks
✅ Password hashed by Supabase
✅ CORS configured
✅ Session management with Supabase
✅ Input validation and sanitization

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Supabase URL is required"
Check your `.env.local` file has `NEXT_PUBLIC_SUPABASE_URL`

### "User signup not working"
- Check email authentication is enabled in Supabase
- Verify the profiles table RLS policies
- Check browser console for errors

### "Admin page shows regular user"
- Manually update the user role in Supabase dashboard
- User role must be set to 'admin' in profiles table

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal and commercial use.

## Support

For issues and questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Open an issue on GitHub

## Roadmap

- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Email notifications
- [ ] User activity logging
- [ ] Advanced admin features
- [ ] User search and filters
- [ ] Bulk user management

---

Made with ❤️ by SkillBridge Team
