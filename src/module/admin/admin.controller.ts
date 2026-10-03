import type { Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceHolderApplicationServices } from "./admin.service";

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
	const result = await ServiceHolderApplicationServices.getAllApplications(
		req.query,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Service Holder applications retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getSingleApplication = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await ServiceHolderApplicationServices.getSingleApplication(
		id as string,
		req.user.userId,
		req.user.role,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Service Holder application retrieved successfully",
		data: result,
	});
});

const approveApplication = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await ServiceHolderApplicationServices.approveApplication(
		id as string,
		req.user.userId,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Service Holder application approved successfully",
		data: result,
	});
});

const rejectApplication = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await ServiceHolderApplicationServices.rejectApplication(
		id as string,
		req.user.userId,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Service Holder application rejected successfully",
		data: result,
	});
});

export const ServiceHolderApplicationControllers = {
	getAllApplications,
	getSingleApplication,
	approveApplication,
	rejectApplication,
};
