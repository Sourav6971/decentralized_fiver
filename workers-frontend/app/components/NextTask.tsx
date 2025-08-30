"use client";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";

export interface Task {
	id: string;
	amount: number;
	title: string;
	options: {
		id: number;
		image_url: string;
		task_id: number;
	}[];
}

export default function ({ connected }: { connected: boolean }) {
	const [currentTask, setCurrentTask] = useState<Task | null>(null);
	const [selection, setSelection] = useState<Number | null>();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	useEffect(() => {
		if (!connected) {
			toast.error("Wallet not connected");
			setLoading(false);
			return;
		}
		setLoading(true);
		axios
			.get("http://localhost:3607/v1/worker/nextTask", {
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
			.then((res) => {
				toast.success(res?.data?.message);
				setCurrentTask(res?.data?.task);
			})
			.catch((err) => {
				var error = err as AxiosError<{ message: string }>;
				if (error?.response?.data?.message)
					toast.error(error?.response?.data?.message);
				else if (error?.message) toast.error(error?.message);
				else toast.error("Unkown error");
			})
			.finally(() => {
				setLoading(false);
			});
	}, [connected]);

	const handleSubmission = async () => {
		if (!selection) {
			toast.error("Select option to submit");
			return;
		}
		setSubmitting(true);
		await axios({
			method: "POST",
			url: "http://localhost:3607/v1/worker/submission",
			data: {
				taskId: Number(currentTask?.id),
				selection,
			},
			headers: {
				Authorization: "Bearer " + localStorage.getItem("token"),
			},
		})
			.then((res) => {
				toast.success(res.data?.message);
				setCurrentTask(null);
				setCurrentTask(res?.data?.nextTask?.task);
			})
			.catch((err) => {
				const error = err as AxiosError<{ message: string }>;
				toast.error(err?.response?.data?.message);
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	if (loading) {
		return (
			<div className=" flex justify-center h-[90vh]">
				<div className="my-auto text-2xl">Loading....</div>
			</div>
		);
	}
	if (!currentTask) {
		return (
			<div className=" flex justify-center h-[90vh]">
				<div className="my-auto text-orange-600 text-2xl">
					Please check back in some time, there are no pending tasks at the
					moment
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className=" flex justify-center text-3xl mt-10">
				{" "}
				{currentTask?.title}
			</div>
			<div className="flex justify-around m-8">
				{currentTask?.options?.map((option) => (
					<div
						key={option?.id} // Move the key to the parent div
						className={`flex flex-col justify-center border-2 ${
							option?.id === selection
								? "border-green-600 border-4"
								: "border-black "
						}`}
						onClick={() => setSelection(option?.id)}
					>
						<img src={option?.image_url} width={200} className="m-8" />
					</div>
				))}
			</div>

			<div
				className="w-screen flex justify-center 
			 pt-10"
			>
				<button
					onClick={handleSubmission}
					className="bg-slate-700 hover:bg-slate-800 text-white py-2 px-5 rounded text-xl cursor-pointer"
				>
					{submitting ? (
						<ScaleLoader color="white" height={10} width={10} />
					) : (
						"Submit"
					)}
				</button>
			</div>
		</div>
	);
}
