import express from "express";
import cors from "cors";
import userRouter from "./routes/user.js";
import workerRouter from "./routes/worker.js";

const app = express();
app.use(cors);
app.use(express.json());

app.use("/v1/user", userRouter);
app.use("/v1/worker/", workerRouter);
