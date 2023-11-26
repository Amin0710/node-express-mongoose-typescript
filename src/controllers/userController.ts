import { z } from "zod";

const userZodSchema = z.object({
	userId: z.number(),
	username: z.string(),
	password: z.string(),
	fullName: z.object({
		firstName: z.string(),
		lastName: z.string(),
	}),
	age: z.number(),
	email: z.string(),
	isActive: z.boolean(),
	hobbies: z.array(z.string()),
	address: z.object({
		street: z.string(),
		city: z.string(),
		country: z.string(),
	}),
});
