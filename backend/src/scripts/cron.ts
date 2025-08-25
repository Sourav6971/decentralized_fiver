import cron from "node-cron";
import { updateTaskDetails } from "../utils/db.js";

cron.schedule("0 0 8 * * *", async () => {
	console.log("Updating the database");
	await updateTaskDetails();
});
