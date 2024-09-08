import { z } from "@collinhacks/zod";

export const zBoolString = z.preprocess((val) => {
	if (
		typeof val === "string" &&
		["1", "true", "yes", "on"].includes(val.toLowerCase())
	) return true;
	return false;
}, z.boolean());
