import express from "express";
import { z } from "zod";
import db from "@repo/db/client";

const app = express();

app.use(express.json());

// Define the schema for request validation
const paymentSchema = z.object({
  token: z.string(),
  user_identifier: z.number().int(), // Ensure this is an integer
  amount: z.string().transform((value) => {
    const num = parseFloat(value);
    if (isNaN(num)) throw new Error("Invalid amount");
    return num;
  }), // Transform to number and validate
});

app.post("/hdfcWebhook", async (req, res) => {
  // Log the incoming request body to ensure it's being received correctly
  console.log("Request body:", req.body);

  // Validate request body
  const result = paymentSchema.safeParse(req.body);
  if (!result.success) {
    console.error("Validation error:", result.error);
    return res
      .status(400)
      .json({ message: "Invalid request data", errors: result.error.issues });
  }

  const paymentInformation = result.data;

  // Ensure the amount and userId are valid numbers
  const userId = paymentInformation.user_identifier;
  const amount = paymentInformation.amount;

  if (isNaN(userId) || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid userId or amount" });
  }

  try {
    await db.$transaction([
      db.balance.updateMany({
        where: {
          userId: userId,
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      }),
      db.onRampTransaction.updateMany({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.json({ message: "Captured" });
  } catch (e) {
    console.error("Database error:", e);
    res.status(500).json({ message: "Error while processing webhook" });
  }
});

app.listen(3003, () => {
  console.log("Server is running on port 3003");
});
