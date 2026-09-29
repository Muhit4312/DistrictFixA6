import { Request, Response } from "express";
import httpStatus from "http-status"

import { sendResponse } from "../../utils/sendResponse";
import { ServiceHolderApplicationServices } from "./serviceHolderApplication.service";
import { ICreateServiceHolderApplicationPayload } from "./serviceHolderApplication.interface";


const createApplication = async (
	req: Request,
	res: Response,
) => {
	const result =
		await ServiceHolderApplicationServices.createApplication(
			req.body,
			req.user.userId,
		);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Service Holder application submitted successfully",
		data: result,
	});
};

const getMyApplications = async (
	req: Request,
	res: Response,
) => {
	const result =
		await ServiceHolderApplicationServices.getMyApplications(
			req.user.userId,
		);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your applications retrieved successfully",
		data: result,
	});
};



const getSingleApplication = async (
	req: Request,
	res: Response,
) => {
	const result =
		await ServiceHolderApplicationServices.getSingleApplication(
			req.params.id as string,
			req.user.userId,
			req.user.role,
		);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service Holder application retrieved successfully",
		data: result,
	});
};


// 	req: Request,
// 	res: Response,
// ) => {
// 	const result =
// 		await ServiceHolderApplicationServices.approveApplication(
// 			req.params.id,
// 			req.user.id,
// 		);

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Service Holder application approved successfully",
// 		data: result,
// 	});
// };

// const rejectApplication = async (
// 	req: Request,
// 	res: Response,
// ) => {
// 	const result =
// 		await ServiceHolderApplicationServices.rejectApplication(
// 			req.params.id,
// 			req.body as IRejectServiceHolderApplicationPayload,
// 			req.user.id,
// 		);

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Service Holder application rejected successfully",
// 		data: result,
// 	});
// };

export const ServiceHolderApplicationControllers = {
	createApplication,
	getMyApplications,
	getSingleApplication,
	
};