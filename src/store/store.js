import { createStore } from "./useStore";

// Initial state of the store
const initialState = {
	count: 0,
};

export const store = createStore(initialState);
