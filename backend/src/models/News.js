import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    url: {
      type: String,
      unique: true, // prevents duplicates
    },
    image: String,
    publishedAt: Date,
    source: String,

    // ML-generated fields
    category: {
      type: String,
      default: "General",
    },
    categoryConfidence: {
      type: Number,
      default: 0,
    },

    // Engagement tracking
    clicks: {
      type: Number,
      default: 0,
    },

    // ML Score (updated by smart ranking)
    aiScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for fallback search
newsSchema.index({ title: "text", description: "text" });

export default mongoose.model("News", newsSchema);