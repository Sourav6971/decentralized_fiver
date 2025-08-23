import { PrismaClient } from "@prisma/client";

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
	} catch (err) {
		console.error(err);
		return { success: false };
	}
}

export {
	// findUser,
	upsertUser,
};
