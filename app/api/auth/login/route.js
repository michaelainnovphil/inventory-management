import connectToMongo from "@/db/dbConnect";
import User from "@/db/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(request) {
  let success = true;
  try {
    await connectToMongo();
    const { email, password } = await request.json();
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      success = false;

      return new Response(
        JSON.stringify({ success, error: "Invalid credentials!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      success = false;
      return new Response(
        JSON.stringify({ success, error: "Invalid credentials!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = sign(data, process.env.JWT_SECRET);

    return new Response(JSON.stringify({ authtoken, success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
