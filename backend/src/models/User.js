import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "News",
  },
  category: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    preferences: [String], // e.g. ["Technology", "Sports"]
    clickedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "News",
      },
    ],

    // Enhanced interaction history for better ML
    interactionHistory: [interactionSchema],

    // Category click counts for weighted preferences
    categoryClickCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);