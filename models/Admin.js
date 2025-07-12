const mongoose = require("mongoose");

const AdminMessageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'update', 'alert'],
    default: 'info'
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const ReportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['user_activity', 'feedback_logs', 'swap_stats'],
    required: true 
  },
  data: mongoose.Schema.Types.Mixed,
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = {
  AdminMessage: mongoose.model("AdminMessage", AdminMessageSchema),
  Report: mongoose.model("Report", ReportSchema)
}; 