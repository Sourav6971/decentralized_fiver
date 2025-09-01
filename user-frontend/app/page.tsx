import AppBar from "./components/AppBar";
import Hero from "./components/Hero";

export default function Home() {
	return (
		<div>
			<AppBar />
			<div className="flex flex-col">
				<Hero />
			</div>
		</div>
	);
}
