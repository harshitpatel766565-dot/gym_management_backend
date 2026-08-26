import mongoose, { Schema, Document } from "mongoose";

export interface IHomepageContent extends Document {
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText: string;
  heroBackgroundImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const homepageContentSchema = new Schema<IHomepageContent>(
  {
    heroTitle: {
      type: String,
      required: true,
      default: "BUILD YOUR STRONGEST SELF",
    },
    heroSubtitle: {
      type: String,
      required: true,
      default: "Train harder. Live stronger. Become unstoppable.",
    },
    heroBadgeText: {
      type: String,
      required: true,
      default: "New Summer Transformation Protocols Live",
    },
    heroBackgroundImage: {
      type: String,
      required: true,
      default: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop&q=85",
    },
  },
  {
    timestamps: true,
  }
);

const HomepageContent = mongoose.model<IHomepageContent>(
  "HomepageContent",
  homepageContentSchema
);

export default HomepageContent;
