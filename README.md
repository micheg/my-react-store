# Building Your Own Lightweight State Manager for React: A Step-by-Step Guide

In this article, we'll explore how to create a simple, lightweight state manager for React, similar to Zustand. While libraries like Redux and Zustand are powerful, understanding how to build your own state manager from scratch is a valuable learning exercise and can be a useful tool in small or mid-sized applications. By doing this, you'll gain a deeper understanding of React's `useContext` and `useState` hooks, as well as how state can be shared across deeply nested components.

We’ll also cover how to structure your React application into separate files for each component, making the codebase modular and scalable.

### Why Build Your Own State Manager?

1. **Learning Opportunity**: By building a state manager from scratch, you deepen your knowledge of React and how state management works under the hood.
2. **Customizability**: You have full control over how state is stored, updated, and accessed. This means you can tailor the state manager to your specific needs.
3. **Lightweight Solution**: For small to medium-sized applications, larger state management libraries can be overkill. Building your own lets you create a solution that’s just right.

---

## Step 1: Set Up Your React Project

Let’s start by creating a new React project. Follow these steps to set up the environment.

### 1.1 Install Node.js and npm

Ensure you have **Node.js** and **npm** installed on your machine. You can check by running these commands in your terminal:

```bash
node -v
npm -v
```

If they are not installed, download and install them from [Node.js official website](https://nodejs.org/).

### 1.2 Create a New React Application

Use `create-react-app` to scaffold a new React project quickly. Run the following command in your terminal:

```bash
npx create-react-app my-react-store
```

This will create a directory called `my-react-store` with a ready-to-go React project.

### 1.3 Navigate into the Project Directory

```bash
cd my-react-store
```

### 1.4 Create Folders for the Store and Components

We will organize the application by separating the state manager and components into their own files.

```bash
mkdir src/components
mkdir src/store
```

---

## Step 2: Create the State Manager

Now, let's create the state manager that will handle global state for our React components.

### 2.1 Create `useStore.js`

Create a file named `useStore.js` inside the `src/store` folder. This file will contain the logic for managing the global state using React's `useState`, `useEffect`, and `useContext`.

```bash
touch src/store/useStore.js
```

#### `src/store/useStore.js`

```javascript
import { useState, useEffect, useContext, createContext } from 'react';

/**
 * Creates a store that holds global state and provides methods to interact with it.
 * @param {object} initialState - The initial state of the store.
 * @returns {object} - The store with getState, setState, and useStore methods.
 */
export const createStore = (initialState) => {
  let storeState = initialState;
  const listeners = new Set();

  const setState = (newState) => {
    storeState = typeof newState === 'function' ? newState(storeState) : newState;
    listeners.forEach((listener) => listener(storeState));
  };

  const getState = () => storeState;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  /**
   * React hook to access the global store.
   * @param {function} selector - A function to select a specific part of the state.
   * @returns {any} - The selected state.
   */
  const useStore = (selector = (state) => state) => {
    const [state, setStateLocal] = useState(() => selector(storeState));

    useEffect(() => {
      const listener = (newState) => {
        const selectedState = selector(newState);
        setStateLocal(selectedState);
      };
      const unsubscribe = subscribe(listener);
      listener(storeState); // Set initial state
      return unsubscribe;
    }, [selector]);

    return state;
  };

  return { getState, setState, useStore };
};

/**
 * Context provider for the global store.
 * @param {object} props - React props.
 * @param {object} props.store - The store object created by createStore.
 * @param {React.ReactNode} props.children - The components that will consume the store.
 */
export const StoreProvider = ({ children, store }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

// Create the store context
const StoreContext = createContext(null);

/**
 * Hook to access the global store from any component.
 * @param {function} selector - A function to select a specific part of the state.
 * @returns {any} - The selected state.
 */
export const useGlobalStore = (selector) => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useGlobalStore must be used within a StoreProvider");
  }
  return store.useStore(selector);
};
```

---
### Explaining the Code:

- **Context Creation**: The `StoreContext` is created using `createContext`, which allows us to share the store globally across all components in the React tree.

- **Global State Management**: We define `storeState` to hold our global state. This is managed through a `setState` function, which updates the state and notifies any subscribed components of the changes.

- **useStore Hook**: This hook is the key to connecting our components to the global state. It uses React's `useState` to track the relevant part of the global state and `useEffect` to handle the subscription to state changes.

- **Store Provider**: The `StoreProvider` component is a wrapper that provides the store to any component within its tree using React's `Provider` pattern.

- **Selector Pattern**: The `selector` function allows components to subscribe to specific parts of the state. This is particularly useful for performance, as it ensures components only re-render when the specific piece of state they care about changes.
---

### 2.2 Create `store.js`

Now, let’s initialize the store with some initial state. Create a `store.js` file in the `src/store` directory:

```bash
touch src/store/store.js
```

#### `src/store/store.js`

```javascript
import { createStore } from './useStore';

// Initial state of the store
const initialState = {
  count: 0,
};

// Create the global store
export const store = createStore(initialState);
```

---

The store implementation in this project revolves around React's `useState`, `useEffect`, and `useContext` hooks to manage and share global state across multiple components. First, we define a **`createStore`** function that accepts an initial state and sets up a global `storeState` variable. This function also defines two key methods: **`setState`** to update the global state and notify all components subscribed to state changes, and **`getState`** to retrieve the current state. To handle component reactivity, a **`listeners`** set is used, where each component subscribing to the state is added as a listener. Whenever `setState` is called, all registered listeners are notified of the state change.

The **`useStore`** hook inside the `createStore` function allows individual components to access a specific part of the global state through a selector function. The hook uses `useState` to locally store the selected state and `useEffect` to handle subscriptions: it registers the component as a listener when mounted and removes it when unmounted. This ensures the component re-renders only when the part of the state it cares about changes.

To distribute this store globally across the app, a **`StoreProvider`** component is defined using React's `createContext`. The **`useGlobalStore`** hook allows any component to access the store's state or functions, ensuring all components within the `StoreProvider` have access to the same shared state.

This setup creates a simple yet effective global state manager that avoids unnecessary re-renders and allows state to be accessed and updated anywhere in the application with minimal overhead.

---

## Step 3: Create the Components

We will now create three components: `Counter`, `Child`, and `Grandchild`. Each component will be placed in its own file under the `src/components` directory.

### 3.1 Create `Counter.js`

This component will be responsible for displaying and incrementing the count.

```bash
touch src/components/Counter.js
```

#### `src/components/Counter.js`

```javascript
import React from 'react';
import { useGlobalStore } from '../store/useStore';
import { store } from '../store/store';
import Child from './Child';

/**
 * Counter component to display and increment the global count.
 * @returns {JSX.Element} - The Counter component.
 */
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
```

### 3.2 Create `Child.js`

This component will contain the `Grandchild` component.

```bash
touch src/components/Child.js
```

#### `src/components/Child.js`

```javascript
import React from 'react';
import Grandchild from './Grandchild';

/**
 * Child component that nests the Grandchild component.
 * @returns {JSX.Element} - The Child component.
 */
const Child = () => {
  return (
    <div>
      <h2>Child Component</h2>
      <Grandchild />
    </div>
  );
};

export default Child;
```

### 3.3 Create `Grandchild.js`

This component will display the count and include a reset button.

```bash
touch src/components/Grandchild.js
```

#### `src/components/Grandchild.js`

```javascript
import React from 'react';
import { useGlobalStore } from '../store/useStore';
import { store } from '../store/store';

/**
 * Grandchild component that displays the count and provides a reset button.
 * @returns {JSX.Element} - The Grandchild component.
 */
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
```

---

## Step 4: Modify `App.js`

The `App.js` file will import the components and the store provider.

#### `src/App.js`

```javascript
import React from 'react';
import { StoreProvider } from './store/useStore';
import { store } from './store/store';
import Counter from './components/Counter';

/**
 * Main App component that provides the global store and renders the Counter component.
 * @returns {JSX.Element} - The App component.
 */
const App = () => {
  return (
    <StoreProvider store={store}>
      <Counter />
    </StoreProvider>
  );
};

export default App;
```

---
### Breaking Down the Example:

1. **Creating the Store**: In `store.js`, we use `createStore` to initialize a store with an initial state of `{ count: 0 }`.

2. **Accessing the Store in a Component**: In the `Counter` component, we use the `useGlobalStore` hook to access the `count` value from the global state. The selector `(state) => state.count` ensures that this component only re-renders when the `count` value changes.

3. **Updating the State**: When the button is clicked, the `increment` function is called, which updates the global state using `store.setState`.

### Step 3: Dealing with Nested Components

One of the benefits of this pattern is that it works seamlessly across deeply nested component trees. Let’s extend our example to see how nested components can access and update the global state.

### Explanation:

- **Component Hierarchy**: In this example, the `Grandchild` component, nested inside `Child` and `Counter`, is able to access the `count` value from the store. The `useGlobalStore` hook allows any component, regardless of depth, to subscribe to state changes.

- **Reactivity**: When the `increment` function in `Counter` is triggered, it updates the state. Thanks to the selector pattern, both the `Counter` and `Grandchild` components will re-render because they both rely on the `count` value.
---

## Step 5: Run the Application

Now that everything is set up, run the application using the following command:

```bash
npm start
```

This will start a development server and open the application in your browser. You should see the count being displayed, with the ability to increment it in the `Counter` component and reset it in the `Grandchild` component.

---

## Conclusion

By creating your own lightweight state manager, you've gained a deeper understanding of React's core
