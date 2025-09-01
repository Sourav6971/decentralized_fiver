"use client";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user";
import UploadImage, { Image } from "./UploadImage";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Hero() {
	const [allImages, setAllImages] = useState<Image[]>([]);
	const [loading, setLoading] = useState(false);
	const { user, setPaid } = useContext(UserContext)!;
	const [title, setTitle] = useState<string>();
	const [maxSubmissions, setMaxSubmissions] = useState<number>(100);

	const [response, setResponse] = useState(false);
	const router = useRouter();
	useEffect(() => {
		if (!user) setResponse(false);
		else setResponse(true);
	}, [user]);
	async function submitTask() {
		setLoading(true);
		try {
			const response = await axios.post(
				"http://localhost:3607/v1/user/task",
				{
					title: title,
					options: allImages,
					signature: "019233233",
					maxSubmissions: maxSubmissions,
				},

				{
					headers: {
						Authorization: "Bearer " + localStorage.getItem("token"),
					},
				}
			);
			if (response?.data) {
				setPaid(false);
				router.push(`/task/${response?.data?.task_id}`);
			}
		} catch (err) {
			const error = err as AxiosError<{ message: string }>;
			if (error?.response?.data?.message)
				toast.error(error?.response?.data?.message);
			else toast.error("Unknown error");
		} finally {
			setLoading(false);
		}
	}

	if (!response) {
		return <div className=" flex justify-center">connect wallet first</div>;
	}
	return (
		<div>
			<div className=" w-full max-w-[1200px] mx-auto my-20">
				<div className="flex flex-col ">
					<div className=" flex justify-center">
						<span className="font-bold text-5xl  mb-10">Create a new task</span>
					</div>
					<div className="mt-10 flex justify-center">
						<div className="w-full">
							<label className="text-slate-600 px-1 font-mono">
								Enter the title of your task
							</label>
							<input
								placeholder="Ex: Select the most clickable thumbnail"
								className="border border-slate-400 outline-none rounded p-3 w-full mt-2 text-xl"
								onChange={(e) => setTitle(e.target.value)}
							/>
							<label className="text-slate-600 px-1 font-mono font-light mr-2">
								Enter the maximum number of submissions
							</label>
							<input
								placeholder="100"
								type="number"
								className="border border-slate-400 outline-none rounded px-3 py-1 w-[20%] mt-4 text-lg"
								onChange={(e) => setMaxSubmissions(Number(e.target.value))}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-center flex-col">
				<UploadImage
					allImages={allImages}
					setAllImages={setAllImages}
					submitTask={submitTask}
					loading={loading}
				/>
			</div>
		</div>
	);
}
