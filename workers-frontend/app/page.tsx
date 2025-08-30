"use client";
import { useState } from "react";
import AppBar from "./components/AppBar";
import NextTask from "./components/NextTask";

export default function () {
	const [connected, setConnected] = useState(false);
	return (
		<>
			<AppBar connected={connected} setConnected={setConnected} />
			<NextTask connected={connected} />
		</>
	);
}
