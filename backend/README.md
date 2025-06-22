# Airdrop Compass Backend

This is the backend server for the Advanced Crypto Airdrop Compass application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run start-dev
   ```
   
   This will:
   - Install dependencies if they're missing
   - Start the development server with hot reload
   - The server will run on `http://localhost:3001`

### Alternative Commands

- **Start production server**: `npm start`
- **Start development server**: `npm run dev`

## 🔧 Configuration

The backend uses environment variables for configuration. If no `.env` file is found, it will use default values:

- **PORT**: 3001
- **JWT_SECRET**: Auto-generated (change in production)
- **CORS_ORIGIN**: http://localhost:5173
- **NODE_ENV**: development

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - Logout user (protected)

### Airdrops
- `GET /api/v1/airdrops` - Get all airdrops (protected)
- `POST /api/v1/airdrops` - Create new airdrop (protected)
- `PUT /api/v1/airdrops/:id` - Update airdrop (protected)
- `DELETE /api/v1/airdrops/:id` - Delete airdrop (protected)

### Wallets
- `GET /api/v1/wallets` - Get all wallets (protected)
- `POST /api/v1/wallets` - Create new wallet (protected)
- `PUT /api/v1/wallets/:id` - Update wallet (protected)
- `DELETE /api/v1/wallets/:id` - Delete wallet (protected)

### Health Check
- `GET /api/v1/health/health` - Server health status

## 🔐 Authentication

The backend uses JWT tokens for authentication. All protected routes require a valid Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Data Storage

Currently, the backend uses in-memory storage for development purposes. In production, you should:

1. Set up a PostgreSQL database
2. Update the database configuration in `config/environment.js`
3. Implement proper database models and migrations

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in your `.env` file
   - Or kill the process using the port: `lsof -ti:3001 | xargs kill -9`

2. **CORS errors**
   - Make sure the frontend is running on the correct port
   - Update CORS_ORIGIN in your `.env` file

3. **JWT errors**
   - Make sure JWT_SECRET is set in your `.env` file
   - Restart the server after changing JWT_SECRET

4. **Module not found errors**
   - Run `npm install` to install missing dependencies
   - Check that all dependencies are listed in `package.json`

### Logs

The server logs all requests and errors to the console. Check the terminal output for debugging information.

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong, unique JWT_SECRET
3. Set up a proper database
4. Configure CORS_ORIGIN for your production domain
5. Use a process manager like PM2
6. Set up proper logging and monitoring

## 📝 Development

### Adding New Routes

1. Create a new route file in the `routes/` directory
2. Export the router
3. Import and use it in `server.js`

### Adding Middleware

1. Add middleware functions in the `middleware/` directory
2. Import and use them in `server.js` or individual route files

### Testing

Run tests with:
```bash
npm test
```

## 📄 License

This project is licensed under the ISC License. 