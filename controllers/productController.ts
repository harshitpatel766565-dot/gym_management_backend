import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Product from "../models/Product";
import { getParam } from "../utils/param";

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true });

    // Seed products if none exist
    if (products.length === 0) {
      const defaultProducts = [
        {
          name: "Adjustable Steel Dumbbells (Pair)",
          category: "Weights",
          description: "Premium heavy duty adjustable dumbbells ranging from 2.5 kg to 24 kg. Easy dial weight selection mechanism.",
          price: 12000,
          discountPrice: 9999,
          brand: "IronForge Gear",
          stock: 15,
          sku: "WT-DB-ADJ",
          images: [
            "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400",
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"
          ],
          features: ["Dial selection mechanism", "Anti-slip steel knurled grip", "Compact storage tray included"],
          specifications: { "Weight Range": "2.5kg - 24kg", "Material": "Chrome Steel & Nylon", "Warranty": "2 Years" },
          isActive: true
        },
        {
          name: "Heavy Resistance Band Set",
          category: "Accessories",
          description: "Set of 5 premium latex resistance bands with handles, ankle straps, and door anchor. Up to 150 lbs stackable tension.",
          price: 1800,
          discountPrice: 1299,
          brand: "IronForge Gear",
          stock: 45,
          sku: "AC-RB-SET",
          images: [
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"
          ],
          features: ["Anti-snap latex tube construction", "Steel carabiners and foam handles", "Carrying bag included"],
          specifications: { "Tension range": "10lbs - 150lbs", "Material": "100% Natural Latex", "Set includes": "5 bands, 2 handles, 2 ankle straps" },
          isActive: true
        },
        {
          name: "Whey Protein Isolate - 2kg chocolate",
          category: "Supplements",
          description: "Ultra-filtered premium whey protein isolate. 26g of clean protein per serving, zero added sugar.",
          price: 5200,
          discountPrice: 4499,
          brand: "IronForge Nutrition",
          stock: 20,
          sku: "NU-WP-ISO-2K",
          images: [
            "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400"
          ],
          features: ["26g Protein per scoop", "Zero sugars, low carbs", "Enriched with digestive enzymes"],
          specifications: { "Servings": "66", "Flavor": "Double Chocolate", "Weight": "2 kg" },
          isActive: true
        }
      ];
      const seeded = await Product.insertMany(defaultProducts);
      res.status(200).json({
        success: true,
        message: "Products catalog seeded",
        data: seeded
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Failed to load product catalog" });
  }
};

// ==========================================
// GET SINGLE PRODUCT BY ID
// ==========================================
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParam(req.params, "id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product details loaded",
      data: product,
    });
  } catch (error) {
    console.error("Get product details error:", error);
    res.status(500).json({ success: false, message: "Failed to load product details" });
  }
};

// ==========================================
// ADMIN: CREATE PRODUCT
// ==========================================
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      category,
      description,
      price,
      discountPrice,
      brand,
      stock,
      sku,
      images,
      features,
      specifications,
    } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      res.status(400).json({ success: false, message: "Name, category, price and stock are required" });
      return;
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      description,
      price,
      discountPrice,
      brand,
      stock,
      sku,
      images: images || [],
      features: features || [],
      specifications: specifications || {},
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Product added to inventory successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

// ==========================================
// ADMIN: EDIT PRODUCT
// ==========================================
export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParam(req.params, "id");
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully in database",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Failed to update product details" });
  }
};

// ==========================================
// ADMIN: DELETE PRODUCT
// ==========================================
export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParam(req.params, "id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid product ID" });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product removed from inventory successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product from database" });
  }
};
