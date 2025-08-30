"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function AppBar({ connected, setConnected }) {
	const [connecting, setConnecting] = useState(false);
	// const [connected, setConnected] = useState(false);
	const handleConnect = async () => {
		const provider = window?.phantom?.solana;
		if (!provider) {
			toast.error("No wallet detected");
			return;
		}
		try {
			setConnecting(true);
			if (connected) {
				await provider.disconnect();
				setConnected(false);
				return;
			}
			const response = await provider.connect();
			const publicKey = await response.publicKey.toBase58();
			await axios({
				method: "POST",
				url: "http://localhost:3607/v1/worker/signin",
				data: {
					publicKey,
				},
			}).then((res) => {
				toast.success(res.data?.message);
				setConnected(true);
				localStorage.setItem("token", res?.data?.token);
			});
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
	};
	return (
		<div className="min-w-screen px-16 py-4 flex justify-between shadow">
			<span className="text-2xl">Worker</span>
			<button
				className="bg-slate-900 text-slate-200 py-2 px-4 rounded cursor-pointer w-[200px] h-[50px]"
				onClick={handleConnect}
			>
				{connecting ? (
					<ClipLoader color="white" size={20} />
				) : connected ? (
					"Disconnect wallet"
				) : (
					"Connect wallet"
				)}
			</button>
		</div>
	);
}
