const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token (Reduced lifespan to 1 day for security)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Register a new Customer or Driver
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, driverDetails } = req.body;

    // Type checking to prevent NoSQL Injection attacks
    if (
      typeof fullName !== 'string' ||
      typeof email !== 'string' || 
      typeof phone !== 'string' ||
      typeof password !== 'string' 
    ) {
      return res.status(400).json({ message: 'Invalid input types' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const userExists = await User.findOne({ 
      $or: [{ email: cleanEmail }, { phone: cleanPhone }] 
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 

    const allowedRoles = ['customer', 'driver'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    if (userRole === 'driver' && (!driverDetails || typeof driverDetails !== 'object')) {
      return res.status(400).json({ message: 'Driver details are required for driver registration' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: userRole, 
      driverDetails: userRole === 'driver' ? driverDetails : undefined
    });

    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Type checking to prevent NoSQL Injection attacks
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid credentials format' });
    }
    if (!email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
      
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};