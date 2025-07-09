// pages/api/search.js (or route handler)
import connectToMongo from "@/db/dbConnect";
import Product from "@/db/models/Products";
import { verify } from "jsonwebtoken";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  await connectToMongo();
  const regex = new RegExp(query, "i"); // case-insensitive search

  const product = await Product.find({
    $or: [{ slug: regex }, { code: regex }],
  });

  return Response.json({ success: true, product });
}
