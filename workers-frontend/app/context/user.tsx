// app/context/UserContext.tsx
"use client";

import axios, { AxiosError } from "axios";
import React, { createContext, useState } from "react";
import toast from "react-hot-toast";

export interface User {
	id: number;
	address: string;
	pendingAmount: number;
	lockedAmount: number;
}

export interface UserContextType {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	connectWallet: () => void;
	connecting: boolean;
	connected: boolean;
	paid: boolean;
	initiating: boolean;
	initiatePayout: () => void;
	setPaid: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with the proper type
export const UserContext = createContext<UserContextType | null>(null);

// Provider component (name starts with a capital letter!)
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [connecting, setConnecting] = useState(false);
	const [connected, setConnected] = useState(false);
	const [initiating, setInitiating] = useState(false);
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
				url: "http://localhost:3607/v1/worker/signin",
				data: {
					publicKey,
					signinMessage,
					signature: Array.from(signedMessage?.signature),
				},
			}).then(
				(response: {
					data: {
						message: string;
						token: string;
						workerId: number;
						pendingAmount: number;
						lockedAmount: number;
					};
				}) => {
					toast.success(response.data?.message);
					setUser({
						id: response.data.workerId,
						address: publicKey,
						pendingAmount: response?.data?.pendingAmount,
						lockedAmount: response?.data?.lockedAmount,
					});
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
	async function initiatePayout() {
		setInitiating(true);
		try {
			const response = await axios({
				method: "POST",
				url: "http://localhost:3607/v1/worker/payout",
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
				data: {
					amount: user?.pendingAmount,
					address: user?.address,
				},
			});
			toast.success(response?.data?.message);
		} catch (err) {
			const error = err as AxiosError<{ message: string }>;
			if (error?.response?.data?.message) {
				toast.error(error?.response?.data?.message);
			} else if (error?.message) {
				toast.error(error?.message);
			} else toast.error("Unknown error");
		} finally {
			setInitiating(false);
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
				paid,
				setPaid,
				initiating,
				initiatePayout,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
