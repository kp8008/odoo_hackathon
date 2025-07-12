const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SwapRequest = require("../models/SwapRequest");
const { AdminMessage, Report } = require("../models/Admin");
const router = express.Router();

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

// Send platform-wide message
router.post("/message", auth, isAdmin, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    const adminMessage = new AdminMessage({
      title,
      message,
      type,
      createdBy: req.user.id
    });
    
    await adminMessage.save();
    res.status(201).json(adminMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all platform messages
router.get("/messages", auth, isAdmin, async (req, res) => {
  try {
    const messages = await AdminMessage.find().populate('createdBy', 'name');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update message status
router.put("/message/:messageId", auth, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const message = await AdminMessage.findByIdAndUpdate(
      req.params.messageId,
      { isActive },
      { new: true }
    );
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Generate user activity report
router.get("/report/user-activity", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBanned).length;
    const bannedUsers = users.filter(u => u.isBanned).length;
    
    const report = new Report({
      type: 'user_activity',
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        users: users.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          isBanned: u.isBanned,
          rating: u.rating,
          totalRatings: u.totalRatings,
          createdAt: u.createdAt
        }))
      },
      generatedBy: req.user.id
    });
    
    await report.save();
    res.json(report.data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Generate feedback logs report
router.get("/report/feedback-logs", auth, isAdmin, async (req, res) => {
  try {
    const completedSwaps = await SwapRequest.find({ 
      status: 'Completed',
      rating: { $exists: true }
    }).populate('senderId', 'name').populate('receiverId', 'name');
    
    const avgRating = completedSwaps.reduce((sum, swap) => sum + swap.rating, 0) / completedSwaps.length;
    
    const report = new Report({
      type: 'feedback_logs',
      data: {
        totalCompletedSwaps: completedSwaps.length,
        averageRating: avgRating || 0,
        feedbacks: completedSwaps.map(swap => ({
          swapId: swap._id,
          sender: swap.senderId.name,
          receiver: swap.receiverId.name,
          skillOffered: swap.skillOffered,
          skillWanted: swap.skillWanted,
          rating: swap.rating,
          feedback: swap.feedback,
          completedAt: swap.completedAt
        }))
      },
      generatedBy: req.user.id
    });
    
    await report.save();
    res.json(report.data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Generate swap statistics report
router.get("/report/swap-stats", auth, isAdmin, async (req, res) => {
  try {
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
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'Pending' });
    const acceptedSwaps = await SwapRequest.countDocuments({ status: 'Accepted' });
    const rejectedSwaps = await SwapRequest.countDocuments({ status: 'Rejected' });
    const cancelledSwaps = await SwapRequest.countDocuments({ status: 'Cancelled' });
    
    const avgRating = await SwapRequest.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const report = new Report({
      type: 'swap_stats',
      data: {
        totalSwaps,
        completedSwaps,
        pendingSwaps,
        acceptedSwaps,
        rejectedSwaps,
        cancelledSwaps,
        averageRating: avgRating[0]?.avgRating || 0,
        statusBreakdown: stats
      },
      generatedBy: req.user.id
    });
    
    await report.save();
    res.json(report.data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all reports
router.get("/reports", auth, isAdmin, async (req, res) => {
  try {
    const reports = await Report.find().populate('generatedBy', 'name').sort({ generatedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard statistics
router.get("/dashboard", auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    const totalSwaps = await SwapRequest.countDocuments();
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'Pending' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'Completed' });
    
    const avgRating = await SwapRequest.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const recentSwaps = await SwapRequest.find().sort({ createdAt: -1 }).limit(5)
      .populate('senderId', 'name').populate('receiverId', 'name');
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers
      },
      swaps: {
        total: totalSwaps,
        pending: pendingSwaps,
        completed: completedSwaps,
        avgRating: avgRating[0]?.avgRating || 0
      },
      recentUsers,
      recentSwaps
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 