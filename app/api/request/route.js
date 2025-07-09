// app/api/request/route.js
import connectToMongo from "@/db/dbConnect";
import Request from "@/db/models/Request";
import User from "@/db/models/User"; // Assuming this is your user model

export async function POST(req) {
  try {
    await connectToMongo();

    const body = await req.json();

    const request = await Request.create({
      product: body.productId,
      quantity: body.quantity,
      reason: body.reason,
      requestedBy: body.requestedBy,
    });

    return Response.json({ success: true, request });
  } catch (err) {
    console.error("Request creation error:", err);
    return Response.json({ message: "Failed to submit request" }, { status: 400 });
  }
}

export async function GET(req) {
  try {
    await connectToMongo();

    const url = new URL(req.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    if (!isAdmin) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requests = await Request.find().populate("product").sort({ createdAt: -1 });

return Response.json({ success: true, requests }); // ← requests must be an array

  } catch (err) {
    console.error("Fetching requests error:", err);
    return Response.json({ message: "Error fetching requests" }, { status: 500 });
  }
}


