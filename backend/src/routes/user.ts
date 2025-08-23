import { PrismaClient } from "@prisma/client";
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { createUser, findUser } from "../db/index.js";

const router = Router();
const prisma = new PrismaClient();

router.post("/signin", async (req: Request, res: Response) => {
	//add sign verification logic here

	const hardcodedWalletAddress = "GKKRjCYYBD1WDiCGG8BfRN8r5LPvTVrkhuQs9gt5dSSb";
	var token = "";

	const existingUserResponse = await findUser(hardcodedWalletAddress);
	if (existingUserResponse?.success) {
		token = jwt.sign(
			{
				address: existingUserResponse?.address,
				userId: existingUserResponse?.userId,
			},
			process.env.USER_SECRET ?? ""
		);
		return res.json({
			message: "Sign in successfull",
			token,
		});
	}

	const createUserResponse = await createUser(hardcodedWalletAddress);
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
	}

	return res.status(500).json({
		message: "Internal server error",
	});
});

export default router;
