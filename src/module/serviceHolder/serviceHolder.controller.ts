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
export const ServiceHolderControllers = {
	getMyServiceHolder,
	updateMyServiceHolder,
	getServiceHolderServices,
	getServiceHolderServiceDetails
};