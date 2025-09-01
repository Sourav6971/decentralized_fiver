"use client";
import axios, { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { UserContext } from "../context/user";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function AppBar() {
	const {
		connected,
		connectWallet,
		connecting,
		user,
		initiating,
		initiatePayout,
	} = useContext(UserContext)!;

	useEffect(() => {
		if (connected) return;
		connectWallet();
	}, []);

	return (
		<div className="min-w-screen px-16 py-4 flex justify-between shadow">
			<span className="text-2xl">Worker</span>
			<div className="flex">
				{user && (
					<button
						className="bg-slate-900 text-slate-200 py-2 px-4 rounded cursor-pointer w-[200px] h-[50px] mr-6"
						onClick={initiatePayout}
					>
						{initiating ? (
							<ClipLoader color="white" size={20} />
						) : (
							`Payout ${user?.pendingAmount! / LAMPORTS_PER_SOL} SOL`
						)}
					</button>
				)}
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
		</div>
	);
}
