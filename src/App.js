import React from "react";
import { StoreProvider } from "./store/useStore";
import { store } from "./store/store";
import Counter from "./components/Counter";

const App = () => {
	return (
		<StoreProvider store={store}>
			<Counter />
		</StoreProvider>
	);
};

export default App;
