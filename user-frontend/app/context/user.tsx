// app/context/UserContext.tsx
"use client";

import axios, { AxiosError } from "axios";
import React, { createContext, useState } from "react";
import toast from "react-hot-toast";
import {
	clusterApiUrl,
	Connection,
	LAMPORTS_PER_SOL,
	PublicKey,
	sendAndConfirmTransaction,
	SystemProgram,
	Transaction,
} from "@solana/web3.js";

export interface User {
	id: number;
	address: string;
}

export interface UserContextType {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	connectWallet: () => void;
	transferSol: () => void;
	connecting: boolean;
	connected: boolean;
	paid: boolean;
	setPaid: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with the proper type
export const UserContext = createContext<UserContextType | null>(null);

// Provider component (name starts with a capital letter!)
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [connecting, setConnecting] = useState(false);
	const [connected, setConnected] = useState(false);
	const [paid, setPaid] = useState(false);

	const provider = window?.phantom?.solana;
	async function connectWallet() {
		setConnecting(true);
		if (!provider) {
			toast.error("No wallet detected");
			setConnecting(false);
			return;
		}
		if (connected) {
			await provider.disconnect();
			setConnected(false);
			setConnecting(false);
			setUser(null);
			localStorage.removeItem("token");
			return;
		}
		try {
			const response = await provider.connect();
			const publicKey = await response.publicKey.toBase58();
			const signinMessage = "Sign in to PickPal with " + publicKey + Date.now();
			const encodedMessage = new TextEncoder().encode(signinMessage);
			const signedMessage = await provider.signMessage(encodedMessage);

			await axios({
				method: "POST",
				url: "http://localhost:3607/v1/user/signin",
				data: {
					publicKey,
					signinMessage,
					signature: Array.from(signedMessage?.signature),
				},
			}).then(
				(response: {
					data: { message: string; token: string; userId: number };
				}) => {
					toast.success(response.data?.message);
					setUser({ id: response.data.userId, address: publicKey });
					setConnected(true);
					localStorage.setItem("token", response?.data?.token);
				}
			);
		} catch (err) {
			const error = err as AxiosError<{ message: string }>;
			console.error(err);
			if (error?.response?.data?.message)
				toast.error(error?.response?.data?.message);
			else if (error?.message) toast.error(error?.message);
			else toast.error("Error connecting to phantom wallet");
		} finally {
			setConnecting(false);
		}
	}
	async function transferSol() {
		if (!connected) return;
		if (!provider) return;

		const recipientPublicKey = "BKm7GxcwBN8qxtPXeS6NUfWxfUwWRJpckSLvuyovYtPL";
		const amount = 0.1;
		try {
			const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
			const transaction = new Transaction().add(
				SystemProgram.transfer({
					fromPubkey: new PublicKey(user?.address!),
					toPubkey: new PublicKey(recipientPublicKey),
					lamports: amount * LAMPORTS_PER_SOL,
				})
			);
			transaction.recentBlockhash = await (
				await connection?.getRecentBlockhash()
			).blockhash;
			transaction.feePayer = new PublicKey(user?.address!);
			const signedTransaction = await provider.signTransaction(transaction);
			const signature = await connection.sendRawTransaction(
				signedTransaction.serialize()
			);
			const response = await connection.confirmTransaction(signature);
			setPaid(true);
			console.log("response", response);
			console.log(signature);
		} catch (err) {
			console.error(err);
			toast.error("Could not transfer money");
		}
	}

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				connectWallet,
				connecting,
				connected,
				transferSol,
				paid,
				setPaid,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
