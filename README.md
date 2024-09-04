# Building Your Own Lightweight State Manager for React: A Step-by-Step Guide

In the ever-evolving world of front-end development, React has become a foundational tool due to its flexibility, component-based architecture, and rich ecosystem. One of the recurring challenges React developers face is managing application-wide state, particularly as applications grow in complexity. Although there are a variety of popular state management libraries like Redux, MobX, or Zustand, building your own custom state manager can be a valuable learning exercise. It not only deepens your understanding of React's internal workings but also gives you the opportunity to tailor your state management to your specific needs.

In this article, we will walk through the process of creating a lightweight state manager similar to Zustand. This guide assumes basic familiarity with React, hooks (especially `useState` and `useContext`), and functional JavaScript.

## Why Build Your Own State Manager?

While established state management libraries are powerful and feature-rich, they can also be overkill for smaller or simpler applications. By building your own state manager, you gain full control over how the state is stored, accessed, and updated. This approach allows you to:

1. **Learn how state managers work**: By rolling your own state manager, you gain a better understanding of core concepts like immutability, component reactivity, and the React Context API.

2. **Keep your app lightweight**: For smaller apps, using a large state management library can introduce unnecessary overhead. A custom solution gives you exactly what you need and nothing more.

3. **Flexibility**: By writing your own solution, you can adjust the behavior to suit your specific requirements without being bound by the constraints of third-party libraries.

## Step 1: Defining the Store

Our goal is to create a store that holds a global state, which can be accessed and modified by any component in the React tree. For this, we'll use React's `useContext` and `useState` hooks, which will help us distribute and manage state throughout the application. We will also use `useEffect` to manage subscriptions to state changes efficiently.

Here is the implementation of our custom `useStore` hook and global store:

### `useStore.js`
```javascript
import { useState, useEffect, useContext, createContext } from 'react';

// Create a Context to hold the store
const StoreContext = createContext(null);

// Function to create a global store
export const createStore = (initialState) => {
  let storeState = initialState;
  const listeners = new Set();

  const setState = (newState) => {
    // Update the global state
    storeState = typeof newState === 'function' ? newState(storeState) : newState;
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
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
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
```

### Explaining the Code:

- **Context Creation**: The `StoreContext` is created using `createContext`, which allows us to share the store globally across all components in the React tree.

- **Global State Management**: We define `storeState` to hold our global state. This is managed through a `setState` function, which updates the state and notifies any subscribed components of the changes.

- **useStore Hook**: This hook is the key to connecting our components to the global state. It uses React's `useState` to track the relevant part of the global state and `useEffect` to handle the subscription to state changes.

- **Store Provider**: The `StoreProvider` component is a wrapper that provides the store to any component within its tree using React's `Provider` pattern.

- **Selector Pattern**: The `selector` function allows components to subscribe to specific parts of the state. This is particularly useful for performance, as it ensures components only re-render when the specific piece of state they care about changes.

## Step 2: Implementing and Using the Store

Now that we have our store, let’s implement a simple example to demonstrate how to use it.

### `store.js`
```javascript
import { createStore } from './useStore';

// Initial state of the store
const initialState = {
  count: 0,
};

export const store = createStore(initialState);
```

### `App.js`
```javascript
import React from 'react';
import { store } from './store';
import { StoreProvider, useGlobalStore } from './useStore';

const Counter = () => {
  // Access the count value from the store
  const count = useGlobalStore((state) => state.count);

  const increment = () => {
    store.setState((state) => ({ ...state, count: state.count + 1 }));
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
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
```

### Breaking Down the Example:

1. **Creating the Store**: In `store.js`, we use `createStore` to initialize a store with an initial state of `{ count: 0 }`.

2. **Accessing the Store in a Component**: In the `Counter` component, we use the `useGlobalStore` hook to access the `count` value from the global state. The selector `(state) => state.count` ensures that this component only re-renders when the `count` value changes.

3. **Updating the State**: When the button is clicked, the `increment` function is called, which updates the global state using `store.setState`.

### Step 3: Dealing with Nested Components

One of the benefits of this pattern is that it works seamlessly across deeply nested component trees. Let’s extend our example to see how nested components can access and update the global state.

```javascript
import React from 'react';
import { store } from './store';
import { StoreProvider, useGlobalStore } from './useStore';

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
```

### Explanation:

- **Component Hierarchy**: In this example, the `Grandchild` component, nested inside `Child` and `Counter`, is able to access the `count` value from the store. The `useGlobalStore` hook allows any component, regardless of depth, to subscribe to state changes.

- **Reactivity**: When the `increment` function in `Counter` is triggered, it updates the state. Thanks to the selector pattern, both the `Counter` and `Grandchild` components will re-render because they both rely on the `count` value.

### Ending

Creating your own lightweight state manager for React is not only a fun and educational exercise, but it can also be a practical solution for simpler applications. By leveraging React's hooks and context API, you can build an efficient, scalable solution that meets the specific needs of your project.

This implementation is flexible, lightweight, and easy to understand, making it an ideal choice for small-to-medium-sized projects where larger libraries may be overkill. It also introduces you to some of the key concepts behind state management, giving you a better understanding of how libraries like Zustand or Redux work under the hood.

Building your own state manager is an excellent way to reinforce your knowledge of React and modern JavaScript patterns, and it could be the perfect fit for your next project!
