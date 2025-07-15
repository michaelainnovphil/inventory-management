import connectToMongo from '../../../db/dbConnect';
import Product from "@/db/models/Products";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const requestHeaders = new Headers(request.headers);
    const token = requestHeaders.get("auth-token");
    const data = verify(token, process.env.JWT_SECRET);

    await connectToMongo();
    const { action, slug, initialQuantity } = await request.json();

    let newQuantity =
      action === "plus"
        ? parseInt(initialQuantity) + 1
        : parseInt(initialQuantity) - 1;

    if (newQuantity < 0) {
      return NextResponse.json({
        success: false,
        message: "Quantity cannot be negative.",
      });
    }

    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: "Product not found.",
      });
    }

    product.quantity = newQuantity;
    const savedProduct = await product.save();

    return NextResponse.json({ success: true, savedProduct });
  } catch (error) {
    console.error("Error updating quantity:", error.message);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
