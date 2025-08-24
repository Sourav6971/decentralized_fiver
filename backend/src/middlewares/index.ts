import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";

export interface middlewareRequest extends Request {
	userId?: number;
	workerId?: number;
}

async function userMiddleware(
	req: middlewareRequest,
	res: Response,
	next: NextFunction
) {
	var token = await req?.headers?.authorization;
	token = token?.split(" ")[1];
	if (!token) {
		return res.status(403).json({
			message: "Unauthorized request",
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
async function workerMiddleware(
	req: middlewareRequest,
	res: Response,
	next: NextFunction
) {
	var token = await req.headers.authorization;
	token = token?.split(" ")[1];
	if (!token) {
		return res.status(403).json({
			message: "Unauthorized request",
		});
	}
	try {
		const response = await jwt.verify(token, process.env.WORKER_SECRET ?? "");
		if (!response) throw new Error("Invalid Token");
		req.workerId = (response as JwtPayload)?.workerId;
		return next();
	} catch (err) {
		console.error(err);
		return res.status(403).json({
			message: "Session expired",
		});
	}
}

export { userMiddleware, workerMiddleware };
