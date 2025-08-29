"use client";

import AppBar from "@/app/components/AppBar";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
	const { taskId } = useParams();
	const [result, setResult] = useState<
		Record<string, { count: number; imageUrl: string }>
	>({});
	const [taskDetails, setTaskDetails] = useState<{
		title: string;
		options: { image_url: string; id: number }[];
	}>();
	useEffect(() => {
		try {
			axios
				.get("http://localhost:3607/v1/user/task", {
					headers: {
						Authorization: "Bearer " + localStorage.getItem("token"),
					},
					params: {
						taskId,
					},
				})
				.then((res) => {
					setResult(res?.data?.result);
					console.log(res?.data?.taskDetails);
					console.log(res?.data?.result);
					setTaskDetails(res?.data?.taskDetails);
				});
		} catch (err) {
			let error = err as AxiosError<{ message: string }>;
			if (error?.response?.data?.message)
				toast.error(error?.response?.data?.message);
			else toast.error("Unknown error");
		}
	}, [taskId]);

	return (
		<>
			<div className="flex justify-center w-screen text-4xl font-bold m-10 ">
				{taskDetails?.title}
			</div>
			<div className="flex gap-5">
				{taskDetails?.options?.map((option) => {
					return (
						<div key={option?.id} className="p-6">
							<div className="w-[400px] h-[400px] flex flex-col justify-center border">
								<div className="flex justify-center">
									<img src={result[option?.id].imageUrl} width={400} />
								</div>
							</div>
							<span className="flex justify-center text-2xl mt-4">
								Total votes= {result[option?.id]?.count}{" "}
							</span>
						</div>
					);
				})}
			</div>
		</>
	);
}
