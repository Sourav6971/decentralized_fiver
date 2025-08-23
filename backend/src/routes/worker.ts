import { Router, type Response } from "express";

const router = Router();

router.get("/", (res: Response) => {
	return res.json({
		message: "Hello",
	});
});

export default router;
