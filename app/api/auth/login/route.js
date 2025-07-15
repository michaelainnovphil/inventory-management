import connectToMongo from "../../../../db/dbConnect";
import User from "../../../../db/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectToMongo();
    const { email, password } = await request.json();
    const user = await User.findOne({ email }).select("+password role");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), { status: 400 });
    }

    const authtoken = sign({ user: { id: user.id, role: user.role, } }, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ success: true, authtoken }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
