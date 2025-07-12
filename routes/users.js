const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication required" });
  }
};

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, location, skillsOffered, skillsWanted, availability } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    if (!Array.isArray(skillsOffered) || skillsOffered.length === 0) {
      return res.status(400).json({ message: "At least one skill offered is required" });
    }
    
    if (!Array.isArray(skillsWanted) || skillsWanted.length === 0) {
      return res.status(400).json({ message: "At least one skill wanted is required" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      location: location ? location.trim() : '',
      skillsOffered: skillsOffered.map(s => s.trim()).filter(s => s),
      skillsWanted: skillsWanted.map(s => s.trim()).filter(s => s),
      availability: availability || 'Weekends'
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret-key', { expiresIn: '7d' });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ message: "Account has been banned" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret-key', { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, location, profilePhoto, skillsOffered, skillsWanted, availability, profileVisible } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, location, profilePhoto, skillsOffered, skillsWanted, availability, profileVisible },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Search users by skill
router.get("/search", async (req, res) => {
  try {
    const { skill } = req.query;
    const users = await User.find({
      profileVisible: true,
      isBanned: false,
      $or: [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
router.get("/all", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Ban/Unban user (admin only)
router.put("/ban/:userId", auth, isAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Rate a user
router.post("/rate/:userId", auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const newTotalRatings = user.totalRatings + 1;
    const newRating = ((user.rating * user.totalRatings) + rating) / newTotalRatings;
    
    user.rating = newRating;
    user.totalRatings = newTotalRatings;
    await user.save();
    
    res.json({ rating: newRating, totalRatings: newTotalRatings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;