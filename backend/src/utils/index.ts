import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

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

export { verifyTransaction };
