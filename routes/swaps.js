const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication required" });
  }
};

// Create swap request
router.post("/request", auth, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message } = req.body;
    
    // Check if receiver exists and is not banned
    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.isBanned) {
      return res.status(404).json({ message: "User not found or banned" });
    }
    
    // Check if sender has the skill they're offering
    const sender = await User.findById(req.user.id);
    if (!sender.skillsOffered.includes(skillOffered)) {
      return res.status(400).json({ message: "You don't have this skill listed" });
    }
    
    const swap = new SwapRequest({
      senderId: req.user.id,
      receiverId,
      skillOffered,
      skillWanted,
      message
    });
    
    await swap.save();
    res.status(201).json(swap);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get swap requests for a user
router.get("/by-user/:id", auth, async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ senderId: req.params.id }, { receiverId: req.params.id }]
    }).populate('senderId', 'name email').populate('receiverId', 'name email');
    
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Accept swap request
router.put("/accept/:swapId", auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }
    
    if (swap.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (swap.status !== 'Pending') {
      return res.status(400).json({ message: "Swap request already processed" });
    }
    
    swap.status = 'Accepted';
    swap.updatedAt = new Date();
    await swap.save();
    
    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject swap request
router.put("/reject/:swapId", auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }
    
    if (swap.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (swap.status !== 'Pending') {
      return res.status(400).json({ message: "Swap request already processed" });
    }
    
    swap.status = 'Rejected';
    swap.updatedAt = new Date();
    await swap.save();
    
    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel swap request (sender only)
router.put("/cancel/:swapId", auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }
    
    if (swap.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (swap.status !== 'Pending') {
      return res.status(400).json({ message: "Cannot cancel processed request" });
    }
    
    swap.status = 'Cancelled';
    swap.updatedAt = new Date();
    await swap.save();
    
    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Complete swap and add rating
router.put("/complete/:swapId", auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const swap = await SwapRequest.findById(req.params.swapId);
    
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }
    
    if (swap.status !== 'Accepted') {
      return res.status(400).json({ message: "Swap must be accepted first" });
    }
    
    // Check if user is part of this swap
    if (swap.senderId.toString() !== req.user.id && swap.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    swap.status = 'Completed';
    swap.rating = rating;
    swap.feedback = feedback;
    swap.completedAt = new Date();
    swap.updatedAt = new Date();
    await swap.save();
    
    // Update user rating
    const otherUserId = swap.senderId.toString() === req.user.id ? swap.receiverId : swap.senderId;
    const otherUser = await User.findById(otherUserId);
    
    const newTotalRatings = otherUser.totalRatings + 1;
    const newRating = ((otherUser.rating * otherUser.totalRatings) + rating) / newTotalRatings;
    
    otherUser.rating = newRating;
    otherUser.totalRatings = newTotalRatings;
    await otherUser.save();
    
    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all swaps (admin only)
router.get("/all", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const swaps = await SwapRequest.find()
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');
    
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get swap statistics (admin only)
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const stats = await SwapRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalSwaps = await SwapRequest.countDocuments();
    const completedSwaps = await SwapRequest.countDocuments({ status: 'Completed' });
    const avgRating = await SwapRequest.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    res.json({
      statusBreakdown: stats,
      totalSwaps,
      completedSwaps,
      avgRating: avgRating[0]?.avgRating || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;