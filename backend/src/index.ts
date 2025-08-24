import express, { type Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const userRouter = await import("./routes/user.js");
const workerRouter = await import("./routes/worker.js");
import "dotenv/config";
const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res: Response) => {
	return res.json({
		msg: "Hello",
	});
});

app.use("/v1/user", userRouter?.default || userRouter);
app.use("/v1/worker/", workerRouter?.default || workerRouter);

app.listen(PORT, () => {
	console.log(`App listening on ${PORT}`);
});
