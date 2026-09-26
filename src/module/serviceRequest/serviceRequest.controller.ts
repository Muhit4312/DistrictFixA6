import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ServiceRequestServices } from "./serviceRequest.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const createService = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body
    const userId  = req.user.userId
	const result = await ServiceRequestServices.createService(payload,userId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Service created successfully",
		data: result,
	});
});

export const ServiceRequestControllers = {
	createService,
	
};