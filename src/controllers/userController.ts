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

const orderZodSchema = z.object({
	productName: z.string(),
	price: z.number(),
	quantity: z.number(),
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

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const users = await UserModel.find({}, { password: 0 }); // Exclude password field
		const formattedUsers = users.map((user) => ({
			userId: user.userId,
			username: user.username,
			fullName: user.fullName,
			age: user.age,
			email: user.email,
			address: {
				street: user.address.street,
				city: user.address.city,
				country: user.address.country,
			},
		}));
		res.json({
			success: true,
			message: "Users fetched successfully!",
			data: formattedUsers,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findOne({ userId }, { password: 0 }); // Exclude password field
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}
		res.json({
			success: true,
			message: "User fetched successfully!",
			data: user,
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const validatedData = userZodSchema.parse(req.body);
		const hashedPassword = await bcrypt.hash(validatedData.password, 10);
		const updatedUser = await UserModel.findOneAndUpdate(
			{ userId },
			{
				...validatedData,
				password: hashedPassword,
			},
			{ new: true, projection: { password: 0 } }
		); // Exclude password field in the response
		if (!updatedUser) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}
		res.json({
			success: true,
			message: "User updated successfully!",
			data: updatedUser,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json({ success: false, message: error.errors[0].message });
		}
		console.error("Error updating user:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const deletedUser = await UserModel.findOneAndDelete({ userId });
		if (!deletedUser) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}
		res.json({
			success: true,
			message: "User deleted successfully!",
			data: null,
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const addOrder = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const validatedOrder = orderZodSchema.parse(req.body);

		const user = await UserModel.findOne({ userId });
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		// If 'orders' property already exists, append the new order; otherwise, create 'orders' array
		if (user.orders) {
			user.orders.push(validatedOrder);
		} else {
			user.orders = [validatedOrder];
		}

		await user.save();

		res.json({
			success: true,
			message: "Order created successfully!",
			data: null,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json({ success: false, message: error.errors[0].message });
		}
		console.error("Error adding order:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};
