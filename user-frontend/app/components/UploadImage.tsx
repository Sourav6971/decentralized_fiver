"use client";

import axios, { type AxiosError } from "axios";

import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
export interface Image {
	imageUrl: string;
}

const ALL_IMAGES: Image[] = [];

export default function UploadImage() {
	const [image, setImage] = useState<File | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	async function uploadImage() {
		if (!image) {
			toast.error("Image cannot be empty");
			return;
		}
		try {
			console.log(image);
			const response = await axios.get(
				"http://localhost:3607/v1/user/presignedUrl",
				{
					headers: {
						Authorization: "Bearer " + localStorage.getItem("token"),
					},
					params: {
						fileName: image?.name,
					},
				}
			);
			const url = response?.data?.url;
			await axios.put(url, image, {
				headers: {
					"Content-Type": image?.type,
				},
			});
			ALL_IMAGES.push({
				imageUrl: url,
			});
			toast.success("Image uploaded");
			setImage(null);
		} catch (err) {
			const error = err as AxiosError<{ message: string }>;
			if (error?.response?.data?.message)
				toast.error(error?.response?.data.message);
			else toast.error("Unkown error");
		}
	}

	return (
		<div>
			<div
				className="w-40 h-40 rounded border text-2xl cursor-pointer"
				onClick={() => inputRef?.current?.click()}
			>
				<div className="flex justify-center h-full">
					<div className=" flex justify-center flex-col h-full relative">
						<label>+</label>
						<input
							type="file"
							style={{
								opacity: 0,
								position: "absolute",
								top: 0,
								left: 0,
								bottom: 0,
								right: 0,
								width: "100%",
								height: "100%",
								cursor: "pointer",
							}}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								const file = e?.target?.files?.[0] ?? null;
								if (file) setImage(file);
							}}
							ref={inputRef}
						/>
					</div>
				</div>
			</div>
			<button className="flex justify-center" onClick={uploadImage}>
				Submit
			</button>
			<div>
				{ALL_IMAGES?.map((image) => (
					<img src={image?.imageUrl} />
				))}
			</div>
		</div>
	);
}
