export default function Hero({ setTitle }) {
	return (
		<div className=" w-full max-w-[1200px] mx-auto my-20">
			<div className="flex flex-col ">
				<div className=" flex justify-center">
					<span className="font-bold text-5xl  mb-10">Create a new task</span>
				</div>
				<div className="mt-10 flex justify-center">
					<div className="w-full">
						<label className="text-black px-1 font-mono font-light">
							Enter the title of your task
						</label>
						<input
							placeholder="Ex: Select the most clickable thumbnail"
							className="border border-slate-400 outline-none rounded p-3 w-full mt-2 text-xl"
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
