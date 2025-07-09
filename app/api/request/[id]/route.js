import connectToMongo from "@/db/dbConnect";
import Request from "@/db/models/Request";
import Product from "@/db/models/Products";

// PATCH /api/request/:id
export async function PATCH(req, { params }) {
  await connectToMongo();

  const { id } = params;
  const body = await req.json();
  const { action } = body;

  const request = await Request.findById(id).populate("productId");
  if (!request) {
    return Response.json({ message: "Request not found" }, { status: 404 });
  }

  if (action === "approve") {
    const product = await Product.findById(request.productId._id);

    if (!product) {
      return Response.json({ message: "Product not found" }, { status: 404 });
    }

    if (product.quantity < request.quantity) {
      return Response.json({ message: "Not enough stock" }, { status: 400 });
    }

    // Subtract quantity and update issuedTo
    product.quantity -= request.quantity;
    product.issuedTo.push(request.requestedBy); // Adjust field name if needed
    await product.save();

    // Update request status
    request.status = "approved";
    request.approvedAt = new Date();
    request.approvedBy = "admin"; // Replace with real admin name if available
    await request.save();
  } else if (action === "deny") {
    request.status = "denied";
    await request.save();
  } else {
    return Response.json({ message: "Invalid action" }, { status: 400 });
  }

  return Response.json({ success: true });
}
