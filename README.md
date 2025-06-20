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
- Context API for state management

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

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

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

### 2. Environment Configuration

Create `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
API_BASE_URL=http://localhost:3001/api/v1
```

### 3. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🔨 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
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
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types.ts           # TypeScript type definitions
├── constants.ts       # Application constants
└── backend/           # Backend API server
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `API_BASE_URL` | Backend API base URL | No (defaults to localhost) |

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

**Build Errors:**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run type-check`

**API Connection Issues:**
- Verify backend is running on port 3001
- Check API_BASE_URL configuration
- Ensure CORS is properly configured

**Authentication Issues:**
- Clear localStorage: `localStorage.clear()`
- Check JWT token validity
- Verify backend authentication middleware

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
