import z from "zod";

const createTaskInput = z.object({
	options: z.array(
		z.object({
			imageUrl: z.string().trim(),
		})
	),
	title: z.string().trim(),
	signature: z.string().trim(),
});

export { createTaskInput };
