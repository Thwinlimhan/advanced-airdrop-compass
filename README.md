# Advanced Crypto Airdrop Compass

A comprehensive Progressive Web Application (PWA) for tracking, managing, and strategizing crypto airdrops with AI-powered insights and portfolio management capabilities.

## 🚀 Features

- **Airdrop Tracking**: Monitor ongoing and upcoming airdrops with detailed project information
- **Wallet Management**: Multi-wallet support with transaction and gas tracking
- **AI Strategy**: AI-powered airdrop strategy recommendations using Google Gemini
- **Portfolio Analytics**: Comprehensive portfolio tracking and reporting
- **Task Automation**: Recurring task scheduling and notifications
- **Learning Platform**: Educational resources and guides
- **PWA Support**: Install as desktop/mobile app
- **Multi-language**: Internationalization support

## 🛠️ Tech Stack

**Frontend:**
- React 19.1 with TypeScript
- Vite for build tooling
- React Router for navigation
- Chart.js for data visualization
- Lucide React for icons
- Zustand for state management

**Backend:**
- Node.js with Express
- JWT authentication
- bcryptjs for password hashing
- CORS support

**AI Integration:**
- Google Gemini API for strategy recommendations

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (for AI features)

## 🔧 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Double-click start-dev.bat or run:
start-dev.bat
```

**macOS/Linux:**
```bash
# Make script executable and run:
chmod +x start-dev.sh
./start-dev.sh
```

This will automatically:
- Install all dependencies
- Start both frontend and backend servers
- Open the application in your browser

### Option 2: Manual Setup

#### 1. Clone and Install Dependencies

```bash
git clone [your-repo-url]
cd advanced-crypto-airdrop-compass

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Environment Configuration

Create `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
API_BASE_URL=http://localhost:3001/api/v1
```

#### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run start-dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/v1/health/health

## 🔨 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
```

### Backend Scripts
```bash
cd backend
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run start-dev    # Install dependencies and start dev server
```

## 📁 Project Structure

```
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   └── charts/         # Chart components
├── features/           # Feature-based modules
│   ├── dashboard/      # Dashboard functionality
│   ├── airdrops/       # Airdrop tracking
│   ├── wallets/        # Wallet management
│   ├── ai/            # AI-powered features
│   └── ...
├── stores/            # Zustand state stores
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types.ts           # TypeScript type definitions
├── constants.ts       # Application constants
├── backend/           # Backend API server
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── config/        # Configuration files
│   └── server.js      # Main server file
├── start-dev.sh       # Unix startup script
├── start-dev.bat      # Windows startup script
└── README.md          # This file
```

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes | - |
| `API_BASE_URL` | Backend API base URL | No | http://localhost:3001/api/v1 |

### Backend Environment Variables

The backend will use default values if no `.env` file is present:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `NODE_ENV` | Environment mode | development |

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting platform

### Backend (Railway/Heroku)

1. Set environment variables on your hosting platform
2. Deploy the `backend` folder
3. Update `API_BASE_URL` in frontend environment

## 📱 PWA Installation

The application supports Progressive Web App installation:
- **Desktop**: Look for install prompt in address bar
- **Mobile**: Use "Add to Home Screen" option

## 🔧 Configuration

### Customizing Features

Edit `constants.ts` to modify:
- Default settings
- Navigation items
- Supported networks
- Notification preferences

### Adding New Features

1. Create feature module in `features/` directory
2. Add route in `App.tsx`
3. Update navigation in `constants.ts`
4. Add types in `types.ts`

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes using ports 3001 and 5173
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Build Errors:**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run type-check`

**API Connection Issues:**
- Verify backend is running on port 3001
- Check API_BASE_URL configuration
- Ensure CORS is properly configured
- Test health endpoint: http://localhost:3001/api/v1/health/health

**Authentication Issues:**
- Clear localStorage: `localStorage.clear()`
- Check JWT token validity
- Verify backend authentication middleware

**Functions Not Working:**
- Make sure both frontend and backend are running
- Check browser console for errors
- Verify you're logged in (register/login first)
- Check backend console for API errors

### Debug Steps

1. **Check Backend Status:**
   ```bash
   curl http://localhost:3001/api/v1/health/health
   ```

2. **Check Frontend Console:**
   - Open browser developer tools
   - Look for network errors in Console tab

3. **Check Backend Logs:**
   - Look at the backend terminal output
   - Check for error messages

4. **Verify Authentication:**
   - Register a new account first
   - Login with the registered account
   - Check if JWT token is stored in localStorage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the comprehensive project review report

---

**Note**: This application is for educational and portfolio tracking purposes. Always verify airdrop information independently and never share private keys or sensitive information.
