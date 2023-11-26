import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
	userId: number;
	username: string;
	password: string;
	fullName: {
		firstName: string;
		lastName: string;
	};
	age: number;
	email: string;
	isActive: boolean;
	hobbies: string[];
	address: {
		street: string;
		city: string;
		country: string;
	};
	orders: Array<{
		productName: string;
		price: number;
		quantity: number;
	}>;
}

const userSchema = new Schema<IUser>({
	userId: { type: Number, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	fullName: {
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
	},
	age: { type: Number, required: true },
	email: { type: String, required: true },
	isActive: { type: Boolean, required: true },
	hobbies: { type: [String], required: true },
	address: {
		street: { type: String, required: true },
		city: { type: String, required: true },
		country: { type: String, required: true },
	},
	orders: [
		{
			productName: { type: String, required: true },
			price: { type: Number, required: true },
			quantity: { type: Number, required: true },
		},
	],
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
