import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World!");
});

export default app;

// import { StudentRoutes } from "./app/modules/student/student.route";

//parsers
app.use(express.json());
app.use(cors());

// application routes
app.use("/api/v1/students", StudentRoutes);

const getAController = (req: Request, res: Response) => {
	const a = 10;
	res.send(a);
};

app.get("/", getAController);
