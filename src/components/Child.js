import React from "react";
import Grandchild from "./Grandchild";

const Child = () => {
	return (
		<div>
			<h2>Child Component</h2>
			<Grandchild />
		</div>
	);
};

export default Child;
