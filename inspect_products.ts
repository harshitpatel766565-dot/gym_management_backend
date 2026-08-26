import "dotenv/config";
import mongoose from "mongoose";
import Product from "./models/Product";
import connectDB from "./config/db";

async function inspect() {
  await connectDB();
  console.log("Fetching products from DB...");
  const products = await Product.find();
  console.log(`Found ${products.length} products:`);
  products.forEach((p) => {
    console.log({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      isActive: p.isActive,
      images: p.images,
    });
  });
  process.exit(0);
}

inspect().catch((err) => {
  console.error("Inspection failed:", err);
  process.exit(1);
});
