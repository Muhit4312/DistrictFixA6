import type { Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminServices } from "./admin.service";


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminServices.getAllUsers(req.query);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Users retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await AdminServices.getSingleUser(id as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "User retrieved successfully",
		data: result,
	});
});


const updateUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await AdminServices.updateUser(
		id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "User updated successfully",
		data: result,
	});
});

const updateUserStatus = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = req.params;

		const result = await AdminServices.updateUserStatus(
			id as string,
			req.body,
		);

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "User status updated successfully",
			data: result,
		});
	},
);


const getAllApplications = catchAsync(async (req: Request, res: Response) => {

	
	
	const result = await AdminServices.getAllApplications(
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

	const result = await AdminServices.getSingleApplication(
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

	const result = await AdminServices.approveApplication(
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

	const result = await AdminServices.rejectApplication(
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

export const AdminController = {
	getAllApplications,
	getSingleApplication,
	approveApplication,
	rejectApplication,
	getAllUsers,
	getSingleUser,
	updateUserStatus,
	updateUser
};
