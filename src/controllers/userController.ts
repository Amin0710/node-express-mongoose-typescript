import { Request, Response } from "express";
import UserModel from "../models/User";
import bcrypt from "bcrypt";
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

const userUpdateZodSchema = z.object({
	username: z.string().optional(),
	password: z.string().optional(),
	fullName: z
		.object({
			firstName: z.string().optional(),
			lastName: z.string().optional(),
		})
		.optional(),
	age: z.number().optional(),
	email: z.string().optional(),
	isActive: z.boolean().optional(),
	hobbies: z.array(z.string()).optional(),
	address: z
		.object({
			street: z.string().optional(),
			city: z.string().optional(),
			country: z.string().optional(),
		})
		.optional(),
});

const orderZodSchema = z.object({
	productName: z.string(),
	price: z.number(),
	quantity: z.number(),
});

const createUser = async (req: Request, res: Response) => {
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
				userId: savedUser.userId,
				username: savedUser.username,
				fullName: {
					firstName: savedUser.fullName.firstName,
					lastName: savedUser.fullName.lastName,
				},
				age: savedUser.age,
				email: savedUser.email,
				isActive: savedUser.isActive,
				hobbies: savedUser.hobbies,
				address: {
					street: savedUser.address.street,
					city: savedUser.address.city,
					country: savedUser.address.country,
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
		res.status(500).json({ success: false, message: { error } });
	}
};

const getAllUsers = async (req: Request, res: Response) => {
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
		res.status(500).json({ success: false, message: { error } });
	}
};

const getUserById = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findOne(
			{ userId },
			{ password: 0, orders: 0 }
		); // Exclude password field
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
				error: {
					code: 404,
					description: "User not found!",
				},
			});
		}
		res.json({
			success: true,
			message: "User fetched successfully!",
			data: user,
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({ success: false, message: { error } });
	}
};

const updateUser = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const validatedData = userUpdateZodSchema.safeParse(req.body);

		if (validatedData.success) {
			const hashedPassword = validatedData.data.password
				? await bcrypt.hash(validatedData.data.password, 10)
				: undefined;

			const updatedUser = await UserModel.findOneAndUpdate(
				{ userId },
				{
					...validatedData.data,
					password: hashedPassword,
				},
				{ new: true, projection: { password: 0, orders: 0 } }
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
		} else {
			res.status(400).json({
				success: false,
				message: validatedData.error.errors[0].message,
			});
		}
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ success: false, message: { error } });
	}
};

const deleteUser = async (req: Request, res: Response) => {
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
		res.status(500).json({ success: false, message: { error } });
	}
};

const addOrder = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const validatedOrder = orderZodSchema.parse(req.body);

		const user = await UserModel.findOne({ userId });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
				error: {
					code: 404,
					description: "User not found!",
				},
			});
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
			data: validatedOrder,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json({ success: false, message: error.errors[0].message });
		}
		console.error("Error adding order:", error);
		res.status(500).json({ success: false, message: { error } });
	}
};

const getAllOrders = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findOne({ userId });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
				error: {
					code: 404,
					description: "User not found!",
				},
			});
		}

		const orders = user.orders || [];

		res.json({
			success: true,
			message: "Orders fetched successfully!",
			data: { orders },
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ success: false, message: { error } });
	}
};

const calculateTotalPrice = async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findOne({ userId });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
				error: {
					code: 404,
					description: "User not found!",
				},
			});
		}

		const totalPrice =
			user.orders?.reduce(
				(acc, order) => acc + order.price * order.quantity,
				0
			) || 0;

		res.json({
			success: true,
			message: "Total price calculated successfully!",
			data: { totalPrice },
		});
	} catch (error) {
		console.error("Error calculating total price:", error);
		res.status(500).json({ success: false, message: { error } });
	}
};

export const Controllers = {
	createUser,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
	addOrder,
	getAllOrders,
	calculateTotalPrice,
};
