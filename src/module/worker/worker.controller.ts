import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WorkerServices } from "./worker.service";

const getMyWorkerProfile = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.getMyWorkerProfile(
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker profile retrieved successfully",
			data: result,
		});
	},
);

const updateMyWorkerProfile = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.updateMyWorkerProfile(
				req.user.userId,
				req.body,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker profile updated successfully",
			data: result,
		});
	},
);

const getMyAssignedServices = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.getMyAssignedServices(
				req.query,
				req.user.userId,

			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Assigned service requests retrieved successfully",
			data: result,
		});
	},
);

const getMyAssignedSingleService = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.getMyAssignedSingleService(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Service request details retrieved successfully",
			data: result,
		});
	},
);

const acceptServiceRequest = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.acceptServiceRequest(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service request accepted successfully",
			data: result,
		});
	},
);

const rejectServiceRequest = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.rejectServiceRequest(
				req.params.id as string,
				req.user.userId,
				req.body,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service request rejected successfully",
			data: result,
		});
	},
);

const startServiceRequest = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.startServiceRequest(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service request started successfully",
			data: result,
		});
	},
);

const completeServiceRequest = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await WorkerServices.completeServiceRequest(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service request completed successfully",
			data: result,
		});
	},
);

export const WorkerControllers = {
	getMyWorkerProfile,
	updateMyWorkerProfile,
	getMyAssignedServices,
	getMyAssignedSingleService,
	acceptServiceRequest,
	rejectServiceRequest,
	startServiceRequest,
	completeServiceRequest,
};