import { Router, type Request, type Response } from "express";
import {
	createPayout,
	getBalance,
	getNextTask,
	submitTask,
	upsertWorker,
} from "../utils/db.js";
import jwt from "jsonwebtoken";
import {
	workerMiddleware,
	type middlewareRequest,
} from "../middlewares/index.js";
import { createSubmissionInput } from "../utils/zod.js";
import { success } from "zod";
import { payoutTransaction, verifyTransaction } from "../utils/index.js";

const router = Router();

router.get(
	"/balance",
	workerMiddleware,
	async (req: middlewareRequest, res: Response) => {
		const workerId = req.workerId;
		const balanceResponse = await getBalance(Number(workerId));
		if (balanceResponse.success) {
			return res.json({
				message: "Fetched balance successfully",
				pendingAmount: balanceResponse?.pendingAmount,
				lockedAmount: balanceResponse?.lockedAmount,
			});
		} else {
			return res.status(500).json({
				message: "Could not fetch balance",
			});
		}
	}
);

router.post(
	"/payout",
	workerMiddleware,
	async (req: middlewareRequest, res) => {
		const workerId = req.workerId;
		const { amount, address } = req.body;
		// const amount = req.body.amount; todo allow users to create payout of their wish
		const transactionResponse = await payoutTransaction(amount, address);
		if (!transactionResponse?.success || !transactionResponse?.txnId) {
			return res
				.status(500)
				.json({ message: "Could not verify your transaction" });
		}

		const payoutResponse = await createPayout(
			Number(workerId),
			transactionResponse?.txnId
		);
		if (payoutResponse?.success) {
			return res.json({
				message: "Payout successfull",
			});
		} else {
			return res.status(500).json({
				message: payoutResponse?.message,
			});
		}
	}
);

router.post("/signin", async (req: Request, res: Response) => {
	const { publicKey, signinMessage, signature } = req.body;
	const verification = verifyTransaction(signinMessage, signature, publicKey);
	if (!verification) {
		return res.status(401).json({
			message: "Could not verify signature",
		});
	}

	var token = "";

	const createUserResponse = await upsertWorker(publicKey);
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
			userId: createUserResponse?.workerId,
			pendingAmount: createUserResponse?.pendingAmount,
			lockedAmount: createUserResponse?.lockedAmount,
		});
	} else
		return res.status(500).json({
			message: "Internal server error",
		});
});

router.get(
	"/nextTask",
	workerMiddleware,
	async (req: middlewareRequest, res: Response) => {
		const workerId = Number(req.workerId);
		const newTaskResponse = await getNextTask(workerId);
		if (newTaskResponse?.success) {
			if (newTaskResponse?.task) {
				return res.json({
					message: "Tasks fetched successfully",
					task: newTaskResponse?.task,
				});
			} else {
				return res.status(404).json({
					message: "No task found for the user",
				});
			}
		} else {
			return res.status(500).json({
				message: "Internal server error",
			});
		}
	}
);

router.post(
	"/submission",
	workerMiddleware,
	async (req: middlewareRequest, res: Response) => {
		const workerId = Number(req?.workerId);
		const body = req.body;
		const schemaResponse = await createSubmissionInput?.safeParse(body);
		if (!schemaResponse?.success) {
			return res.status(400).json({
				message: "Invalid input types",
			});
		}
		const { taskId, selection } = schemaResponse?.data;
		const taskResponse = await getNextTask(workerId);
		if (!taskResponse.success) {
			return res.status(500).json({
				message: "Internal server error",
			});
		}

		if (!taskResponse?.task || taskResponse?.task?.id !== taskId) {
			return res.status(411).json({
				message: "You are not authorized to make submisssion to this task",
			});
		}
		const submitTaskResponse = await submitTask(
			taskId,
			workerId,
			selection,
			taskResponse?.task?.amount,
			taskResponse?.task?.maxSubmissions
		);
		if (submitTaskResponse?.success) {
			return res.json({
				message: "Task submitted successfully",
				nextTask: await getNextTask(workerId),
			});
		} else {
			var message = submitTaskResponse?.message;
			return res.status(500).json({
				message: message ?? "Internal server error",
			});
		}
	}
);

export default router;
