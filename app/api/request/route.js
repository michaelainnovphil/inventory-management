import connectToMongo from "@/db/dbConnect";
import Request from "@/db/models/Request";
import Product from "@/db/models/Products";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";
import User from "@/db/models/User";


// GET: Get all requests (admin) or user's own requests
export async function GET(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
  }

  const data = verify(token, process.env.JWT_SECRET);
  request.user = data.user;

  try {
    await connectToMongo();
    const filter = request.user.role === "admin" ? {} : { user: request.user.id };
    const requests = await Request.find(filter).populate({ path: "user", model: "user" }).populate({ path: "productId", model: "product" });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("GET /api/request error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: User submits a new request
export async function POST(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
  }

  const data = verify(token, process.env.JWT_SECRET);
  request.user = data.user;

  try {
    await connectToMongo();
    const { category, productId, quantity } = await request.json();

    const newRequest = await Request.create({
      user: request.user.id,
      category,
      productId,
      quantity,
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("POST /api/request error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Admin approves or declines a request
export async function PUT(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
  }

  let data;
  try {
    data = verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
  }

  request.user = data.user;

  if (request.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Access denied. Admins only." }, { status: 403 });
  }

  try {
    await connectToMongo();
    const { requestId, status } = await request.json();

    const existingRequest = await Request.findById(requestId).populate("productId");

    if (!existingRequest) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    existingRequest.status = status;
    await existingRequest.save();

    if (status === "approved") {
      const product = await Product.findById(existingRequest.productId);
      if (!product || product.quantity < existingRequest.quantity) {
        return NextResponse.json({ success: false, message: "Not enough items in stock." }, { status: 400 });
      }

      product.quantity -= existingRequest.quantity;
      await product.save();
    }

    return NextResponse.json({ success: true, request: existingRequest });
  } catch (error) {
    console.error("PUT /api/request error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Admin deletes a request
export async function DELETE(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
  }

  const data = verify(token, process.env.JWT_SECRET);
  request.user = data.user;

  if (request.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Access denied. Admins only." }, { status: 403 });
  }

  try {
    await connectToMongo();

    let requestId;
    try {
      const requestBody = await request.json();
      requestId = requestBody;
    } catch (jsonError) {
      return NextResponse.json(
        {
          success: false,
          message: jsonError instanceof Object && jsonError.message ? jsonError.message : jsonError,
        },
        { status: 400 }
      );
    }

    const existing = await Request.findById(requestId);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    await Request.findByIdAndDelete(requestId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/request error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
