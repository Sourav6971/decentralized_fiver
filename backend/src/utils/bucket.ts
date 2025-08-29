import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME ?? "",
	api_key: process.env.API_KEY ?? "",
	api_secret: process.env.API_SECRET ?? "",
});

async function getSignature() {
	const timestamp = Math.round(new Date().getTime() / 1000);
	try {
		const signature = cloudinary.utils.api_sign_request(
			{
				timestamp,
				asset_folder: "decentralized_fiverr",
				upload_preset: "pick-pal",
			},

			process.env.API_SECRET ?? ""
		);
		return { success: true, signature, timestamp };
	} catch (error) {
		console.error("Upload failed:", error);
		return { success: false, error };
	}
}

export { getSignature };
