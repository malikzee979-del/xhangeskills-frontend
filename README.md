# Frontend - XchangeSkills User Application

A Next.js-based web application for users to browse, discover, and exchange professional skills on the XchangeSkills platform.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Backend API running** on http://localhost:1337

### Installation & Setup

```bash
# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:1337/api" > .env.local

# Start development server
npm run dev
```

Access at: **http://localhost:3000**

---

## 📱 Features

### User Authentication
- User registration and login
- Email verification
- Password reset functionality
- Profile management

### Skill Discovery
- Browse all available skills
- Filter by category
- View skill details and pricing
- See reviews and ratings

### Skill Management
- Create new skills
- Edit skill information
- Upload cover images
- Set pricing and delivery time

### Service Requests
- Request services from skill providers
- Track request status
- Communicate with providers

### Marketplace
- Browse marketplace skills
- View skill availability
- Check provider ratings

### User Reviews
- Submit reviews for completed services
- View reviews from other users
- Rate service providers

### Notifications
- Receive notifications for new requests
- Track service request updates
- Message notifications

---

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Backend API URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:1337/api
```

---

## 🔧 npm Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── dashboard/              # User dashboard
│   ├── skills/                 # Skill pages
│   ├── marketplace/            # Marketplace
│   ├── profile/                # User profile
│   └── ...
├── components/
│   ├── Navbar.tsx             # Navigation bar
│   ├── SkillCard.tsx          # Skill card component
│   ├── Button.tsx             # Button component
│   ├── Input.tsx              # Input component
│   └── ...
├── services/
│   ├── apiClient.ts           # Axios HTTP client
│   ├── authApi.ts             # Auth API calls
│   ├── skillApi.ts            # Skill API calls
│   ├── categoryApi.ts         # Category API calls
│   └── ...
├── hooks/
│   └── useAuth.ts             # useAuth hook
├── providers/
│   └── AuthProvider.tsx       # Auth context provider
├── public/
│   └── ...                     # Static assets
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js config
├── postcss.config.mjs          # PostCSS config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## 🔐 Authentication

### Login Flow
1. User submits email/password
2. POST `/api/auth/local` 
3. Receive JWT token
4. Store token in localStorage
5. Redirect to dashboard

### Protected Routes
- Dashboard pages require authentication
- Auto-redirect to login if not authenticated

### Token Management
- JWT token stored in `localStorage`
- Token sent in `Authorization: Bearer <token>` header
- Auto-logout on token expiration

---

## 📡 Key API Endpoints

### Authentication
```
POST /api/auth/local          # Login
POST /api/auth/register       # Register
POST /api/auth/forgot-password # Request password reset
POST /api/auth/reset-password  # Reset password
```

### Skills
```
GET /api/skills               # List all skills
GET /api/skills/:id           # Get skill details
POST /api/skills              # Create skill
PUT /api/skills/:id           # Update skill
DELETE /api/skills/:id        # Delete skill
```

### Categories
```
GET /api/categories           # List categories
```

### Service Requests
```
GET /api/service-requests     # List requests
POST /api/service-requests    # Create request
PUT /api/service-requests/:id # Update request
```

### Reviews
```
GET /api/reviews              # List reviews
POST /api/reviews             # Submit review
```

---

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Dark mode support** (if enabled)

---

## 🧪 Testing

### 1. Start Backend
```bash
cd backend
docker compose up -d
docker compose exec -T backend npm run seed:data
```

### 2. Start Frontend
```bash
npm install
npm run dev
```

### 3. Access Application
- URL: http://localhost:3000
- Register a new account or use seeded user credentials

---

## 🚨 Troubleshooting

### "Failed to fetch" errors
- Ensure backend is running: `docker compose up -d`
- Check `.env.local` has correct API URL
- Verify CORS is enabled on backend

### Port 3000 already in use
```bash
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force

# Or use different port:
npm run dev -- -p 3002
```

### Authentication not working
- Check token is stored in localStorage
- Verify JWT is valid
- Try logging out and logging back in

---

## 📦 Dependencies

### Core
- **next** (16.1.4) - React framework
- **react** (19.2.3) - UI library
- **typescript** - Type safety

### Styling
- **tailwindcss** - Utility CSS
- **postcss** - CSS processing

### API & State
- **axios** (1.13.6) - HTTP client
- **lucide-react** - Icons

### Development
- **eslint** - Code quality

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment for Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Docker Deployment
```bash
docker build -t xchangeskills-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
  xchangeskills-frontend
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [XchangeSkills Backend API Docs](../backend/README.md)
- [XchangeSkills Admin Panel Docs](../admin-frontend/README.md)

---

## 📄 License

Proprietary - All rights reserved

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
