import {
	Router,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import jwt from "jsonwebtoken";

import "dotenv/config";

const router = Router();
import {
	createTask,
	getSubmissions,
	getTaskDetails,
	TOTAL_DECIMALS,
	upsertUser,
} from "../utils/db.js";
import {
	userMiddleware,
	workerMiddleware,
	type middlewareRequest,
} from "../middlewares/index.js";
import { getSignature } from "../utils/bucket.js";
import { createTaskInput } from "../utils/zod.js";
import { record } from "zod/v3";
import { verifyTransaction } from "../utils/index.js";

router.post("/signin", async (req: Request, res: Response) => {
	//add sign verification logic here

	const { publicKey, signinMessage, signature } = req.body;
	const verification = verifyTransaction(signinMessage, signature, publicKey);
	if (!verification) {
		return res.status(401).json({
			message: "Could not verify signature",
		});
	}

	var token = "";

	const createUserResponse = await upsertUser(publicKey);
	if (createUserResponse?.success) {
		token = jwt.sign(
			{
				userId: createUserResponse?.userId,
			},
			process.env.USER_SECRET ?? ""
		);
		return res.json({
			message: "Sign in successfull",
			userId: createUserResponse?.userId,
			token,
		});
	} else
		return res.status(500).json({
			message: "Internal server error",
		});
});

router.get(
	"/signature",
	userMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		const signatureResponse = await getSignature();
		if (signatureResponse?.success) {
			return res.json({
				message: "Fetched signature succesfully",
				signature: signatureResponse?.signature,
				timestamp: signatureResponse?.timestamp,
			});
		} else {
			throw new Error("Google Cloud error");
		}
	}
);

router.post(
	"/task",
	userMiddleware,
	async (req: middlewareRequest, res: Response) => {
		const body = req.body;
		const zodResponse = createTaskInput.safeParse(body);
		if (!zodResponse.success) {
			return res.status(400).json({
				message: "Invalid input types",
			});
		}
		const { options, title, signature, maxSubmissions } = zodResponse?.data;

		const userId = req?.userId ?? 0;
		const amount = 1; //todo write the logic to get the amount from the signature
		const createTaskResponse = await createTask({
			options,
			title,
			signature,
			amount,
			userId,
			maxSubmissions,
		});
		if (!createTaskResponse.success) {
			return res.status(500).json({
				message: "Could not create task",
			});
		}
		return res.json({
			message: "Task created successfully!",
			task_id: createTaskResponse?.task?.id,
		});
	}
);

router.get(
	"/task",
	userMiddleware,
	async (req: middlewareRequest, res: Response) => {
		const taskId = Number(req?.query?.taskId);
		const userId = Number(req?.userId);
		const taskDetailResponse = await getTaskDetails(taskId, userId);
		if (taskDetailResponse?.success) {
			if (!taskDetailResponse?.taskDetails?.id)
				return res.status(404).json({
					message: "Task does not exist",
				});
			else {
				const submissionResponses = await getSubmissions(taskId);
				if (submissionResponses?.success) {
					let result: Record<string, { count: number; imageUrl: string }> = {};
					taskDetailResponse?.taskDetails?.options?.forEach((option) => {
						result[option?.id] = {
							count: 0,
							imageUrl: option?.image_url,
						};
					});

					submissionResponses?.responses?.forEach((submission) => {
						const key = String(submission?.option?.id ?? ""); // make sure key is not "null"

						if (!result[key]) {
							result[key] = {
								count: 0,
								imageUrl: submission?.option?.image_url,
							};
						} else {
							result[key].count++;
						}
					});

					return res.json({
						message: "Submission fetched successfully",
						result,
						taskDetails: taskDetailResponse?.taskDetails,
					});
				} else {
					return res.status(404).json({
						message: "Submissions do not exist",
					});
				}
			}
		} else {
			return res.status(500).json({
				message: "Internal server error",
			});
		}
	}
);
export default router;
