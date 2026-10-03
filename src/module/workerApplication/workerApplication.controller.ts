import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { WorkerApplicationServices } from "./workerApplication.service";

const createWorkerApplication = catchAsync(
	async (req: Request, res: Response) => {
		const result = await WorkerApplicationServices.createWorkerApplication(
			req.body,
			req.user.userId,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Worker application submitted successfully",
			data: result,
		});
	},
);

const getMyWorkerApplications = catchAsync(
	async (req: Request, res: Response) => {
		const result = await WorkerApplicationServices.getMyWorkerApplications(
			req.query,
			req.user.userId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker applications retrieved successfully",
			data: result.data,
			meta: result.meta,
		});
	},
);

const getMyWorkerApplicationById = catchAsync(
	async (req: Request, res: Response) => {
		const result = await WorkerApplicationServices.getMySingleWorkerApplication(
			req.params.id as string,
			req.user.userId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker application retrieved successfully",
			data: result,
		});
	},
);

const updateMyWorkerApplication = catchAsync(
	async (req: Request, res: Response) => {
		const result = await WorkerApplicationServices.updateMyWorkerApplication(
			req.params.id as string,
			req.user.userId,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker application updated successfully",
			data: result,
		});
	},
);

const deleteMyWorkerApplication = catchAsync(
	async (req: Request, res: Response) => {
		await WorkerApplicationServices.deleteMyWorkerApplication(
			req.params.id as string,
			req.user.userId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker application deleted successfully",
			data: null,
		});
	},
);

export const WorkerApplicationControllers = {
	createWorkerApplication,
	getMyWorkerApplications,
	getMyWorkerApplicationById,
	updateMyWorkerApplication,
	deleteMyWorkerApplication,
};
