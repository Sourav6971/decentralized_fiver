import { PrismaClient } from "@prisma/client";
import { string, success } from "zod";

const DEFAULT_TITLE = "Select the most clickable thumbnail";
export const TOTAL_DECIMALS = 1000_000_000;

export type TaskInput = {
	options: {
		imageUrl: string;
	}[];
	title: string;
	userId: number;
	amount: number;
	signature: string;
};

export type ErrorType = string | { message: string };

const prisma = new PrismaClient();

// async function findUser(address: String) {
// 	try {
// 		const user = await prisma.user.findFirst({
// 			where: {
// 				address: address.toString(),
// 			},
// 			select: {
// 				id: true,
// 			},
// 		});
// 		return { address, userId: user?.id, success: true };
// 	} catch {
// 		console.error();
// 		return { success: false };
// 	}
// }
async function upsertUser(address: string) {
	try {
		const user = await prisma.user.upsert({
			where: {
				address: address.toString(),
			},
			create: {
				address: address.toString(),
			},
			update: {},
			select: {
				id: true,
			},
		});
		return { success: true, address, userId: user?.id };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}

async function createTask({
	options,
	title,
	userId,
	amount,
	signature,
}: TaskInput) {
	try {
		const task = await prisma.$transaction(async (tx) => {
			const task = await tx.task.create({
				data: {
					amount: amount * TOTAL_DECIMALS,
					signature,
					title: title ?? DEFAULT_TITLE,
					user_id: userId,
				},
			});
			await tx.option.createMany({
				data: options.map((x) => ({
					image_url: x?.imageUrl,
					task_id: task?.id,
				})),
			});
			return task;
		});

		return { success: true, task };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}

async function getTaskDetails(taskId: number, userId: number) {
	try {
		const taskDetails = await prisma.task.findFirst({
			where: {
				id: taskId,
				user_id: userId,
			},
			include: {
				options: true,
			},
		});
		return { success: true, taskDetails };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}

async function getSubmissions(taskId: number) {
	try {
		const responses = await prisma.submission.findMany({
			where: {
				task_id: taskId,
			},
			include: {
				option: true,
			},
		});
		return {
			success: true,
			responses,
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
		};
	}
}

async function upsertWorker(address: string) {
	try {
		const worker = await prisma.worker.upsert({
			where: {
				address: address?.toString(),
			},
			create: {
				address: address?.toString(),
				locked_amount: 0 * TOTAL_DECIMALS,
				pending_amount: 0 * TOTAL_DECIMALS,
			},
			update: {},
			select: {
				id: true,
			},
		});
		return { success: true, address, workerId: worker?.id };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}
async function getNextTask(workerId: number) {
	try {
		const task = await prisma.task.findFirst({
			where: {
				submissions: {
					none: {
						worker_id: workerId,
					},
				},
				done: false,
			},

			select: {
				id: true,
				amount: true,
				title: true,
				options: true,
				totalSubmissions: true,
			},
		});
		return { success: true, task };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}
async function submitTask(
	taskId: number,
	workerId: number,
	selection: number,
	amount: number,
	totalSubmissions: number
) {
	try {
		const validSelections = await prisma.option.findUnique({
			where: {
				id: selection,
				task_id: taskId,
			},
			select: {
				id: true,
			},
		});
		if (!validSelections || !validSelections?.id)
			return { success: false, message: "The selected option is not valid" };
		await prisma.$transaction(async (tx) => {
			await tx.submission.create({
				data: {
					amount: amount / totalSubmissions,
					option_id: selection,
					worker_id: workerId,
					task_id: taskId,
				},
			});
			await tx.worker.update({
				where: {
					id: workerId,
				},
				data: {
					pending_amount: {
						increment: amount,
					},
				},
			});
		});
		return { success: true };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}

export {
	// findUser,
	upsertUser,
	upsertWorker,
	createTask,
	getTaskDetails,
	getSubmissions,
	getNextTask,
	submitTask,
};
