import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
  description?: string;
  price: number;
  discountPrice?: number;
  brand?: string;
  stock: number;
  sku?: string;
  images: string[];
  features?: string[];
  specifications?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
