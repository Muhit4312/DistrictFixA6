import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceHolderServices } from "./serviceHolder.service";
import httpStatus from "http-status";

const getMyServiceHolder = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getMyServiceHolder(
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Service Holder profile retrieved successfully",
			data: result,
		});
	},
);

const updateMyServiceHolder = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.updateMyServiceHolder(
				req.user.userId,
				req.body,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service Holder profile updated successfully",
			data: result,
		});
	},
);

const getServiceHolderServices = catchAsync(
	async (req: Request, res: Response) => {
		const result = await ServiceHolderServices.getServiceHolderServices(
			req.query,
			req.user.userId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "All District Service requests retrieved successfully",
			data: result,
		});
	},
);

const getServiceHolderServiceDetails = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getServiceHolderServiceDetails(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service request retrieved successfully",
			data: result,
		});
	},
);

const getWorkerApplicationsByServiceHolder = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getWorkerApplicationsByServiceHolder(
				req.query,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Worker applications retrieved successfully",
			data: result.data,
			meta: result.meta,
		});
	},
);

const getWorkerApplicationById = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getSingleApplicationById(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Worker application retrieved successfully",
			data: result,
		});
	},
);

const approveWorkerApplication = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.approveWorkerApplication(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Worker application approved successfully",
			data: result,
		});
	},
);


const rejectWorkerApplication = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.rejectWorkerApplication(
				req.params.id as string,
				req.user.userId,
				req.body,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message:
				"Worker application rejected successfully",
			data: result,
		});
	},
);

const getMyDistrictWorkers = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getMyDistrictWorkers(
				req.query,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "District workers retrieved successfully",
			data: result.data,
			meta: result.meta,
		});
	},
);

const getMyDistrictSingleWorker = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getMyDistrictSingleWorker(
				req.params.id as string,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Worker retrieved successfully",
			data: result,
		});
	},
);

const assignServiceRequest = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.assignServiceRequest(
				req.params.id as string,
				req.body,
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Service request assigned successfully",
			data: result,
		});
	},
);


export const ServiceHolderControllers = {
	getMyServiceHolder,
	updateMyServiceHolder,
	getServiceHolderServices,
	getServiceHolderServiceDetails,
	getWorkerApplicationsByServiceHolder,
	getWorkerApplicationById,
	approveWorkerApplication,
	rejectWorkerApplication,
	getMyDistrictWorkers,
	getMyDistrictSingleWorker,
	assignServiceRequest,
	
};