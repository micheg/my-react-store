import React from "react";
import { StoreProvider, useGlobalStore } from "./store/useStore";
import { store } from "./store/store";

const Grandchild = () => {
	const count = useGlobalStore((state) => state.count);
	return <div>Grandchild Count: {count}</div>;
};

const Child = () => {
	return (
		<div>
			<h2>Child Component</h2>
			<Grandchild />
		</div>
	);
};

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

const App = () => {
	return (
		<StoreProvider store={store}>
			<Counter />
		</StoreProvider>
	);
};

export default App;
