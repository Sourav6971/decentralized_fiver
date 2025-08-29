"use client";
import { useState } from "react";
import AppBar from "./components/AppBar";
import Hero from "./components/Hero";
import UploadImage, { Image } from "./components/UploadImage";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Home() {
	const [title, setTitle] = useState("Enter the most clickable thumbnail");
	const router = useRouter();
	const [allImages, setAllImages] = useState<Image[]>([]);
	const [loading, setLoading] = useState(false);
	async function submitTask() {
		setLoading(true);
		try {
			const response = await axios.post(
				"http://localhost:3607/v1/user/task",
				{
					title,
					options: allImages,
					signature: "019233233",
					maxSubmissions: 100,
				},

				{
					headers: {
						Authorization: "Bearer " + localStorage.getItem("token"),
					},
				}
			);
			if (response?.data) {
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

	return (
		<div>
			<AppBar />
			<div className="flex flex-col">
				<Hero setTitle={setTitle} />

				<div className="flex justify-center flex-col">
					<UploadImage
						allImages={allImages}
						setAllImages={setAllImages}
						submitTask={submitTask}
						loading={loading}
					/>
				</div>
			</div>
		</div>
	);
}
