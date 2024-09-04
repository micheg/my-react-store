import { useState, useEffect, useContext, createContext } from "react";

// Create a Context to hold the store
const StoreContext = createContext(null);

// Function to create a global store
export const createStore = (initialState) => {
	let storeState = initialState;
	const listeners = new Set();

	const setState = (newState) => {
		// Update the global state
		storeState =
			typeof newState === "function" ? newState(storeState) : newState;
		// Notify all listeners of the state change
		listeners.forEach((listener) => listener(storeState));
	};

	const getState = () => storeState;

	const subscribe = (listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};

	// Hook to be used in React components
	const useStore = (selector = (state) => state) => {
		const [state, setStateLocal] = useState(() => selector(storeState));

		useEffect(() => {
			const listener = (newState) => {
				const selectedState = selector(newState);
				setStateLocal(selectedState);
			};
			// Subscribe the component to state changes
			const unsubscribe = subscribe(listener);
			// Update state once on mount
			listener(storeState);
			return unsubscribe;
		}, [selector]);

		return state;
	};

	return { getState, setState, useStore };
};

// Store Provider
export const StoreProvider = ({ children, store }) => {
	return (
		<StoreContext.Provider value={store}>{children}</StoreContext.Provider>
	);
};

// Hook to access the global store
export const useGlobalStore = (selector) => {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("useGlobalStore must be used within a StoreProvider");
	}
	return store.useStore(selector);
};
