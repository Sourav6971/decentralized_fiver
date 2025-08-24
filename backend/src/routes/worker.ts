import { Router, type Request, type Response } from "express";
import { upsertWorker } from "../utils/db.js";
import jwt from "jsonwebtoken";
import {
	workerMiddleware,
	type middlewareRequest,
} from "../middlewares/index.js";

const router = Router();

router.post("/signin", async (req: Request, res: Response) => {
	//add sign verification logic here

	const hardcodedWalletAddress =
		"workerjCYYBD1WDiCGG8BfRN8r5LPvTVrkhuQs9gt5dSSb";
	var token = "";

	const createUserResponse = await upsertWorker(hardcodedWalletAddress);
	if (createUserResponse?.success) {
		token = jwt.sign(
			{
				workerId: createUserResponse?.workerId,
			},
			process.env.WORKER_SECRET ?? ""
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

router.get("/nextTask", workerMiddleware, async (req: middlewareRequest) => {});

export default router;
