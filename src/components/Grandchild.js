import React from "react";
import { useGlobalStore } from "../store/useStore";
import { store } from "../store/store";

const Grandchild = () => {
	const count = useGlobalStore((state) => state.count);

	const reset = () => {
		store.setState((state) => ({ ...state, count: 0 }));
	};

	return (
		<div>
			<h3>Grandchild Component</h3>
			<p>Grandchild Count: {count}</p>
			<button onClick={reset}>Reset</button>
		</div>
	);
};

export default Grandchild;
