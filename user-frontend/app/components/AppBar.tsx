"use client";
import axios, { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { UserContext, UserProvider } from "../context/user";

export default function AppBar() {
	const { connectWallet, connecting, connected } = useContext(UserContext)!;
	useEffect(() => {
		if (!connected) connectWallet();
	}, []);

	return (
		<div className="min-w-screen px-16 py-4 flex justify-end shadow">
			<button
				className="bg-slate-900 text-slate-200 py-2 px-4 rounded cursor-pointer w-[200px] h-[50px]"
				onClick={connectWallet}
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
