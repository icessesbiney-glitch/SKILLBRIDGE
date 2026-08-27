# SKILLBRIDGE

**A Secure, Full-Stack Authentication & Role-Based Access Control Platform**

---

## 📋 Overview

SKILLBRIDGE is a modern, production-ready web application that provides comprehensive user authentication, profile management, and role-based access control. Built with industry best practices, it features persistent Supabase authentication, protected routes, and a sophisticated server-side database architecture with Row-Level Security (RLS) policies.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Email/Password Sign-Up & Login** - Secure user registration and authentication
- **Persistent Supabase Authentication** - Enterprise-grade auth with persistent sessions
- **Row-Level Security (RLS) Policies** - Database-level access control for maximum security
- **Protected Routes** - Authenticated dashboard and admin pages with role-based access

### 👤 User Management
- **User Profiles** - Customizable user profiles with profile information
- **Role-Based Access Control** - Hierarchical permission system (Admin, User, etc.)
- **Server-Side Role Model** - Backend validation and enforcement of user roles

### 🏗️ Architecture
- **Supabase Database** - PostgreSQL-backed relational database
- **SQL Schema** - Normalized database design with proper relationships
- **RLS Policies** - Fine-grained access control at the database level
- **Protected Dashboard** - User-specific authenticated area
- **Protected Admin Page** - Administrative functionality with permission checks

---

## 🛠️ Tech Stack

- **Frontend**: [Framework/Libraries - to be updated]
- **Backend**: Node.js / Supabase Functions
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Hosting**: [Platform - to be updated]

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/icessesbiney-glitch/SKILLBRIDGE.git
   cd SKILLBRIDGE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

---

## 📚 Database Schema

### Tables

#### `users`
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `role` (ENUM: admin, user)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `profiles`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `full_name` (VARCHAR)
- `avatar_url` (VARCHAR)
- `bio` (TEXT)
- `updated_at` (TIMESTAMP)

### Row-Level Security Policies

- **Users** can only access their own profile data
- **Admins** have full access to all user data
- **Public** data is accessible without authentication where specified

---

## 🔒 Security Features

- ✅ Supabase Auth with JWT tokens
- ✅ Secure password hashing
- ✅ Row-Level Security (RLS) at database level
- ✅ Protected API endpoints with role verification
- ✅ CORS configuration for authorized domains
- ✅ Secure session management

---

## 📖 API Routes

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/reset-password` - Password reset

### User
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/me` - Get authenticated user details

### Admin
- `GET /api/admin/users` - List all users (Admin only)
- `PUT /api/admin/users/:id/role` - Update user role (Admin only)

---

## 🎯 Usage Examples

### Sign Up
```javascript
// Register a new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

### Protected Dashboard
The dashboard automatically redirects unauthenticated users to login and displays user-specific data.

### Admin Functions
Admins can manage users, assign roles, and access administrative features through the protected admin page.

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 📦 Deployment

### Deploy to Production

1. Build the application
   ```bash
   npm run build
   ```

2. Deploy to your hosting platform (Vercel, Netlify, etc.)

3. Set production environment variables

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Documentation

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 🐛 [Report Issues](https://github.com/icessesbiney-glitch/SKILLBRIDGE/issues)
- 💬 [Discussions](https://github.com/icessesbiney-glitch/SKILLBRIDGE/discussions)

---

## 🎓 Learn More

- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row-Level Security in PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Made with ❤️ by the SKILLBRIDGE Team**
