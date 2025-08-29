"use client";

import axios, { all, type AxiosError } from "axios";
import "dotenv/config";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
export interface Image {
	imageUrl: string;
}

export default function UploadImage({
	allImages,
	setAllImages,
	submitTask,
	loading,
}: any) {
	const [uploading, setUploading] = useState(false);
	async function uploadImage(image: File) {
		try {
			// console.log(image);
			setUploading(true);
			const response = await axios.get(
				"http://localhost:3607/v1/user/signature",
				{
					headers: {
						Authorization: "Bearer " + localStorage.getItem("token"),
					},
				}
			);
			const signature = response?.data?.signature;
			const timestamp = response?.data?.timestamp;

			let url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`;
			let formData = new FormData();
			formData.append("timestamp", timestamp);
			formData.append("signature", signature);
			formData.append("file", image);
			formData.append("asset_folder", "decentralized_fiverr");
			formData.append("upload_preset", "pick-pal");
			formData.append("api_key", process.env.NEXT_PUBLIC_API_KEY ?? "");

			const uploadResponse = await axios.post(url, formData, {
				headers: {
					"Content-Type": image.type,
				},
			});
			if (uploadResponse?.data?.url) {
				toast.success("Image uploaded");

				setAllImages((prev: Image[]) => [
					...prev,
					{ imageUrl: uploadResponse?.data?.url },
				]);
			} else {
				toast.error("Error uploading image");
			}
		} catch (err) {
			const error = err as AxiosError<{ message: string }>;
			if (error?.response?.data?.message)
				toast.error(error?.response?.data.message);
			else if (error?.message) toast.error(error?.message);
			else toast.error("Unkown error");
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="flex justify-center">
			<div className="flex flex-col">
				<div className="rounded border text-lg cursor-pointer w-[200px] mx-auto">
					<div className="flex justify-center h-full">
						<div className=" flex justify-center flex-col h-full relative py-3 px-5">
							<label>
								{uploading ? <ScaleLoader height={10} /> : "Upload image"}
							</label>
							<input
								type="file"
								style={{
									opacity: 0,
									position: "absolute",
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
									cursor: "pointer",
								}}
								onChange={async (e: ChangeEvent<HTMLInputElement>) => {
									const file = e?.target?.files?.[0] ?? null;
									if (file) {
										uploadImage(file);
									}
								}}
							/>
						</div>
					</div>
				</div>

				<div className="w-[1200px] flex justify-end">
					<button
						className="mt-10  bg-blue-500 text-white text-xl font-mono rounded py-2 px-4 cursor-pointer hover:bg-blue-600"
						onClick={submitTask}
					>
						{loading ? (
							<div className="w-[130px]">
								<ScaleLoader color="#ffffff" height={10} radius={10} />
							</div>
						) : (
							"Submit task"
						)}
					</button>
				</div>
				<div className="flex ">
					{allImages?.map((image: Image) => (
						<img src={image?.imageUrl} width={200} className="m-8" />
					))}
				</div>
			</div>
		</div>
	);
}
