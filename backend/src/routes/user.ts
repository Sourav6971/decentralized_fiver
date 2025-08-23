import {
	Router,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import jwt from "jsonwebtoken";

const router = Router();
import { upsertUser } from "../utils/db.js";
import {
	userMiddleware,
	type userMiddlewareRequest,
} from "../middlewares/index.js";
import { getSignedUrl } from "../utils/bucket.js";

router.post("/signin", async (req: Request, res: Response) => {
	//add sign verification logic here

	const hardcodedWalletAddress = "GKKRjCYYBD1WDiCGG8BfRN8r5LPvTVrkhuQs9gt5dSSb";
	var token = "";

	const createUserResponse = await upsertUser(hardcodedWalletAddress);
	if (createUserResponse?.success) {
		token = jwt.sign(
			{
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

router.get(
	"/presignedUrl",
	userMiddleware,
	async (req: userMiddlewareRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req?.userId ?? "";
			const fileName = req?.query.fileName ?? "";
			if (!fileName) throw new Error("File name is empty");
			const response = await getSignedUrl(fileName as string, userId);
			if (response.success) {
				return res.json({
					message: "Fetched signed url succesfully",
					url: response.url,
				});
			} else {
				throw new Error("Google Cloud error");
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				message: "Failed to generate presigned url",
			});
		}
	}
);

export default router;
