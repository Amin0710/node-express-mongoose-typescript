import express, { Application, Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";

const app: Application = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World!");
});

export default app;
