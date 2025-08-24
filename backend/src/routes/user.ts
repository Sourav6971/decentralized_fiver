import {
	Router,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import jwt from "jsonwebtoken";

const router = Router();
import { createTask, upsertUser } from "../utils/db.js";
import {
	userMiddleware,
	type userMiddlewareRequest,
} from "../middlewares/index.js";
import { getSignedUrl } from "../utils/bucket.js";
import { createTaskInput } from "../utils/zod.js";

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
			const userId = req?.userId ?? 0;
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

router.post(
	"/task",
	userMiddleware,
	async (req: userMiddlewareRequest, res: Response) => {
		const body = req.body;
		const zodResponse = createTaskInput.safeParse(body);
		if (!zodResponse.success) {
			return res.status(400).json({
				message: "Invalid input types",
			});
		}
		const { options, title, signature } = zodResponse?.data;
		const userId = req?.userId ?? 0;
		const amount = "0"; //todo write the logic to get the amount from the signature
		const createTaskResponse = await createTask({
			options,
			title,
			signature,
			amount,
			userId,
		});
		if (!createTaskResponse.success) {
			return res.status(500).json({
				message: "Could not create task",
			});
		}
		return res.json({
			message: "Task created successfully!",
			task: createTaskResponse?.task,
		});
	}
);

export default router;
