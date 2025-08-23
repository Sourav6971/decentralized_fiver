import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();
import { upsertUser } from "../utils/db.js";

router.post("/signin", async (req: Request, res: Response) => {
	//add sign verification logic here

	const hardcodedWalletAddress = "GKKRjCYYBD1WDiCGG8BfRN8r5LPvTVrkhuQs9gt5dSSb";
	var token = "";

	const createUserResponse = await upsertUser(hardcodedWalletAddress);
	if (createUserResponse?.success) {
		token = jwt.sign(
			{
				address: createUserResponse?.address,
				userId: createUserResponse?.userId,
			},
			process.env.USER_SECRET ?? ""
		);
		return res.json({
			message: "Sign in successfull",
			token,
		});
	} else
		return res.status(500).json({
			message: "Internal server error",
		});
});

export default router;
