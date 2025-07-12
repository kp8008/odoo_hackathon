// const mongoose = require("mongoose");

// const SwapRequestSchema = new mongoose.Schema({
//   senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   skillOffered: { type: String, required: true },
//   skillWanted: { type: String, required: true },
//   message: { type: String, default: "" },
//   status: { 
//     type: String, 
//     enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'],
//     default: "Pending" 
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
//   completedAt: { type: Date },
//   rating: { type: Number, min: 1, max: 5 },
//   feedback: { type: String }
// });

// module.exports = mongoose.model("SwapRequest", SwapRequestSchema);

