import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface userMiddlewareRequest extends Request {
	userId?: number;
}

export interface customJwtPayload extends JwtPayload {
	userId?: string;
	address?: string;
}

async function userMiddleware(
	req: userMiddlewareRequest,
	res: Response,
	next: NextFunction
) {
	var token = await req?.headers?.authorization;
	token = token?.split(" ")[1];
	if (!token) {
		return res.status(403).json({
			message: "Unauthorized",
		});
	}
	try {
		const response = await jwt.verify(token, process.env.USER_SECRET ?? "");
		if (!response) throw new Error("Invalid Token");
		req.userId = (response as JwtPayload)?.userId;
		return next();
	} catch (err) {
		console.error(err);
		return res.status(403).json({
			message: "Session expired",
		});
	}
}
// async function workerMiddleware(
// 	req: userMiddlewareRequest,
// 	res: Response,
// 	next: NextFunction
// ) {
// 	var token = await req.headers.authorization;
// 	token = token?.split("")[1];
// 	if (!token) {
// 		return res.status(401).json({
// 			message: "Unauthorized",
// 		});
// 	}
// 	try {
// 		const response = await jwt.verify(token, process.env.WORKER_SECRET ?? "");
// 		if (!response) throw new Error("Invalid Token");
// 		req.userId = (response as JwtPayload)?.userId;
// 		req.address = (response as JwtPayload)?.address;
// 		next();
// 	} catch (err) {
// 		console.error(err);
// 		return res.status(411).json({
// 			message: "Session expired",
// 		});
// 	}
// }

export { userMiddleware };
