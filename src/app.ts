import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./config/env.config";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { AuthRoutes } from "./module/auth/auth.route";
import { ServiceRequestRoutes } from "./module/serviceRequest/serviceRequest.route";
import { DistrictRoutes } from "./module/district/district.route";
import { ServiceHolderApplicationRoutes } from "./module/serviceHolderApplication/serviceHolderApplication.route";
import { adminRoutes } from "./module/admin/admin.route";
import { ServiceHolderRoutes } from "./module/serviceHolder/serviceHolder.route";
import { WorkerApplicationRoutes } from "./module/workerApplication/workerApplication.route";
import { WorkerRoutes } from "./module/worker/worker.route";
import { getBkashIdToken } from "./lib/bkash";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/service-requests", ServiceRequestRoutes);
app.use("/api/v1/district", DistrictRoutes);
app.use("/api/v1/service-holder-applicaitons", ServiceHolderApplicationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/service-holder", ServiceHolderRoutes);
app.use("/api/v1/worker-applications",WorkerApplicationRoutes);
app.use("/api/v1/worker",WorkerRoutes);

app.get("/test", async (req: Request, res: Response) => {
	try {

		const grantIdTokenResult = await getBkashIdToken()
		
		
		res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to PH Healthcare System Backend",
		data: grantIdTokenResult
	});
	} catch (error) {
		console.log({error});
	}
});

app.get("/", async (req: Request, res: Response) => {
	const grantIdTokenResult = await getBkashIdToken()
	console.log({grantIdTokenResult});
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome DistrictFix Backend",
		data: grantIdTokenResult
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
