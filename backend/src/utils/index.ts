import nacl from "tweetnacl";
import {
	clusterApiUrl,
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	sendAndConfirmTransaction,
	SystemProgram,
	Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import "dotenv/config";
import { TOTAL_DECIMALS } from "./db.js";

async function verifyTransaction(
	message: string,
	signature: number[],
	userAddress: string
) {
	try {
		let publicKey = new PublicKey(userAddress);
		let encodedMessage = new TextEncoder().encode(message);
		let encodedSignature = Uint8Array.from(signature);
		const isValid = nacl.sign.detached.verify(
			encodedMessage,
			encodedSignature,
			publicKey.toBytes()
		);
		return isValid;
	} catch (err) {
		console.error(err);
		return false;
	}
}

async function payoutTransaction(amount: number, address: string) {
	try {
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		const privateKey = process.env.SECRET_KEY ?? "";
		const from = bs58.decode(privateKey);

		const transaction = new Transaction().add(
			SystemProgram?.transfer({
				fromPubkey: Keypair.fromSecretKey(from).publicKey,
				toPubkey: new PublicKey(address),
				lamports: amount,
			})
		);
		const signature = await sendAndConfirmTransaction(connection, transaction, [
			Keypair?.fromSecretKey(from),
		]);

		return { success: true, txnId: signature };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}

export { verifyTransaction, payoutTransaction };
