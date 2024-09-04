import React from "react";
import { useGlobalStore } from "../store/useStore";
import { store } from "../store/store";
import Child from "./Child";

const Counter = () => {
	const count = useGlobalStore((state) => state.count);

	const increment = () => {
		store.setState((state) => ({ ...state, count: state.count + 1 }));
	};

	return (
		<div>
			<h1>Count: {count}</h1>
			<button onClick={increment}>Increment</button>
			<Child />
		</div>
	);
};

export default Counter;
