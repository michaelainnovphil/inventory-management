import connectToMongo from "@/db/dbConnect";
import Product from "@/db/models/Products";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

// GET: Fetch all products for the user
export async function GET(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");
  const data = verify(token, process.env.JWT_SECRET);
  request.user = data.user;

  try {
    await connectToMongo();
    const products = await Product.find(); // No filter – returns everything

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error.message);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

// POST: Add new product
export async function POST(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");
  const data = verify(token, process.env.JWT_SECRET);
  request.user = data.user;

  // ✅ Restrict to admin only
   if (request.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ success: false, message: "Access denied. Admins only." }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  } 

  try {
    await connectToMongo();
    const body = await request.json();
    const { code, slug, serial, category, branch, issued, status, purchaseDate, quantity, price } = body;

    const existing = await Product.findOne({ code });
    if (existing) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Product code already exists." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const newProduct = new Product({
      user: request.user.id,
      code, slug, serial, category, branch, issued, status, purchaseDate, quantity, price,
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error(error.message);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}


// PUT: Update existing product
export async function PUT(request) {
  const requestHeaders = new Headers(request.headers);
  const token = requestHeaders.get("auth-token");

if (!token) {
  return new NextResponse(
    JSON.stringify({ success: false, message: "No token provided" }),
    { status: 400, headers: { "content-type": "application/json" } }
  );
}

let data;
try {
  data = verify(token, process.env.JWT_SECRET);
} catch (err) {
  return new NextResponse(
    JSON.stringify({ success: false, message: "Invalid or expired token" }),
    { status: 401, headers: { "content-type": "application/json" } }
  );
}

request.user = data.user;


  

  if (request.user.role !== "admin") {
  return new NextResponse(
    JSON.stringify({ success: false, message: "Access denied. Admins only." }),
    { status: 403, headers: { "content-type": "application/json" } }
  );
} 


  try {
    await connectToMongo();
    const body = await request.json();
    const { _id, code, slug, serial, category, branch, issued, status, purchaseDate, quantity, price } = body;

    const existingProduct = await Product.findOne({ _id });


    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Product not found." }),
        { status: 404, headers: { "content-type": "application/json" } }
      );
    }

    existingProduct.code = code;
    existingProduct.slug = slug;
    existingProduct.serial = serial;
    existingProduct.category = category;
    existingProduct.branch = branch;
    existingProduct.issued = issued;
    existingProduct.status = status;
    existingProduct.purchaseDate = purchaseDate;
    existingProduct.quantity = quantity;
    existingProduct.price = price;

    await existingProduct.save();

    return new NextResponse(JSON.stringify({ success: true, product: existingProduct }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT route:", error.message);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

// DELETE: Remove product by ID
export async function DELETE(request) {
  try {
    const requestHeaders = new Headers(request.headers);
    const token = requestHeaders.get("auth-token");
    const data = verify(token, process.env.JWT_SECRET);
    request.user = data.user;

    
    
    if (request.user.role !== "admin") {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Access denied. Admins only." }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
    

    await connectToMongo();

    let ID;
    try {
      const requestBody = await request.json();
      ID = requestBody;
    } catch (jsonError) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message:
            jsonError instanceof Object && jsonError.message
              ? jsonError.message
              : jsonError || "Invalid JSON input",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const product = await Product.findById(ID);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Product not found" }),
        { status: 404, headers: { "content-type": "application/json" } }
      );
    }

    const result = await Product.findByIdAndDelete(ID);

    if (!result) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Failed to delete product" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    return new NextResponse(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Error in DELETE route:", error.message);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
