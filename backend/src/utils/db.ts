import { PrismaClient } from "@prisma/client";

const DEFAULT_TITLE = "Select the most clickable thumbnail";

export type TaskInput = {
	options: {
		imageUrl: string;
	}[];
	title: string;
	userId: number;
	amount: string;
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

async function upsertUser(address: String) {
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
					amount,
					signature,
					title: title ?? DEFAULT_TITLE,
					user_id: userId,
				},
			});
			await tx.option.createMany({
				data: options.map((x) => ({
					image_url: x.imageUrl,
					task_id: task.id,
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

export {
	// findUser,
	upsertUser,
	createTask,
};
