import { Storage } from "@google-cloud/storage";
import "dotenv/config";
const credentials = {
	type: process.env.GOOGLE_TYPE ?? "",
	project_id: process.env.GOOGLE_PROJECT_ID ?? "",
	private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID ?? "",
	private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
	client_email: process.env.GOOGLE_CLIENT_EMAIL ?? "",
	client_id: process.env.GOOGLE_CLIENT_ID ?? "",
	auth_uri: process.env.GOOGLE_AUTH_URI ?? "",
	token_uri: process.env.GOOGLE_TOKEN_URI ?? "",
	auth_provider_x509_cert_url:
		process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL ?? "",
	client_x509_cert_url: process.env.CLIENT_X509_CERT_URL ?? "",
};
const storage = new Storage({ credentials });
var bucketName = process.env.BUCKET ?? "";

export type signedUrlOption = {
	version: "v4" | "v2";
	action: "read" | "write" | "delete" | "resumable";
	expires: number;
};

async function getSignedUrl(fileName: string, userId: string) {
	const options: signedUrlOption = {
		version: "v4",
		action: "write",
		expires: Date.now() + 10 * 60 * 1000, // 10 minutes
	};

	try {
		const [url] =
			(await storage.bucket(bucketName).file(fileName).getSignedUrl(options)) ??
			"";
		return {
			success: true,
			url,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: err,
		};
	}
}

export { getSignedUrl };
