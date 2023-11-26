import { Request, Response } from "express";
import UserModel from "../models/User";
import bcrypt from "bcrypt";
import { z } from "zod";

const userZodSchema = z.object({
	userId: z.number(),
	username: z
		.string()
		.min(1)
		.max(20)
		.refine((value) => /^[A-Z]/.test(value), {
			message: "Username must start with a capital letter",
		}),
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

const userZodSchemaWithOrders = userZodSchema.extend({
	orders: z.array(
		z.object({
			productName: z.string(),
			price: z.number(),
			quantity: z.number(),
		})
	),
});

export const createUser = async (req: Request, res: Response) => {
	try {
		const validatedData = userZodSchema.parse(req.body);

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(
			validatedData.password,
			saltRounds
		);

		const newUser = new UserModel({
			...validatedData,
			password: hashedPassword,
		});

		const savedUser = await newUser.save();

		res.status(201).json({
			success: true,
			message: "User created successfully!",
			data: {
				userId: "number",
				username: "string",
				fullName: {
					firstName: "string",
					lastName: "string",
				},
				age: "number",
				email: "string",
				isActive: "boolean",
				hobbies: savedUser.hobbies,
				address: {
					street: "string",
					city: "string",
					country: "string",
				},
			},
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json({ success: false, message: error.errors[0].message });
		}

		console.error("Error creating user:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};
