const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../authMiddleware');
const storage = require('../utils/storage');

const router = express.Router();

// Conceptual token blacklist for demo. In production, use a more robust solution like Redis.
let tokenBlacklist = new Set();

// GET /api/v1/auth/users (Admin route for debugging - remove in production)
router.get('/users', async (req, res) => {
  try {
    const users = await storage.getUsers();
    // Don't return passwords in the response
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    }));
    res.json({ 
      count: safeUsers.length, 
      users: safeUsers 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    // Check for existing user
    const existingUser = await storage.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' }); // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Salt rounds: 12 is generally recommended
    const newUser = { 
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
      email, 
      username: username || email.split('@')[0], // Default username from email prefix
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await storage.addUser(newUser);

    console.log('User registered (persistent storage):', { id: newUser.id, email: newUser.email, username: newUser.username });
    res.status(201).json({ 
        message: 'User registered successfully. Please login.', 
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Error registering user. Please try again later.' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('Login Error: JWT_SECRET is not defined.');
    return res.status(500).json({ message: 'Authentication configuration error on server.' });
  }

  try {
    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Generic message for security
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Generic message
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    console.log('User logged in:', { id: user.id, email: user.email });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ 
        message: 'Login successful!', 
        token, 
        userId: user.id,
        email: user.email,
        username: user.username 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Error logging in. Please try again later.' });
  }
});

// GET /api/v1/auth/me (Protected route example)
router.get('/me', authMiddleware, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  // Check against conceptual blacklist
  if (token && tokenBlacklist.has(token)) {
    console.warn(`Attempt to use blacklisted token by user ${req.user.id}`);
    return res.status(401).json({ message: 'Unauthorized: Token has been logged out/invalidated' });
  }

  try {
    const user = await storage.findUserById(req.user.id);

    if (!user) {
      console.error(`/me: User ID ${req.user.id} from token not found in store.`);
      return res.status(404).json({ message: 'User not found.' });
    }
    
    console.log('/me endpoint accessed by user:', { id: user.id, email: user.email });
    res.json({ 
      id: user.id, 
      email: user.email, 
      username: user.username,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data.' });
  }
});

// POST /api/v1/auth/logout (Conceptual)
router.post('/logout', authMiddleware, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    tokenBlacklist.add(token); // Add token to blacklist (conceptual for stateless JWTs)
    console.log(`Token for user ${req.user.id} added to conceptual blacklist. Blacklist size: ${tokenBlacklist.size}`);
  }
  // Simulate DB write if any session data was stored server-side
  await new Promise(resolve => setTimeout(resolve, 20));
  res.status(200).json({ message: 'Logout successful (conceptual server-side action completed).' });
});

module.exports = router;