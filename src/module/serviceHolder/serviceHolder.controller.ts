import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceHolderServices } from "./serviceHolder.service";

const getMyServiceHolder = catchAsync(
	async (req: Request, res: Response) => {
		const result =
			await ServiceHolderServices.getMyServiceHolder(
				req.user.userId,
			);

		sendResponse(res, {
			statusCode: 200,
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
			statusCode: 200,
			success: true,
			message:"Service Holder profile updated successfully",
			data: result,
		});
	},
);

export const ServiceHolderControllers = {
	getMyServiceHolder,
	updateMyServiceHolder,
};