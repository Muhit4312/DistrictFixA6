import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ServiceRequestServices } from "./serviceRequest.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createService = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.user.userId;
	const result = await ServiceRequestServices.createService(payload, userId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Service created successfully",
		data: result,
	});
});
const getMyServices = async (req: Request, res: Response) => {
	const userId = req.user.userId;
	const query = req.query;
	const result = await ServiceRequestServices.getMyServices(query, userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your service requests retrieved successfully",
		data: result,
	});
};

const getSingleService = async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user.userId;
	if (!id) {
		throw new Error("Service ID is missing");
	}

	const result = await ServiceRequestServices.getSingleService(
		id as string,
		userId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request retrieved successfully",
		data: result,
	});
};



const updateService = async (
	req: Request,
	res: Response,
) => {
	const { id } = req.params;

	const result = await ServiceRequestServices.updateService(
		id as string,
		req.body,
		req.user.id,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request updated successfully",
		data: result,
	});
};

const cancelService = async (
	req: Request,
	res: Response,
) => {
	const { id } = req.params;

	const result = await ServiceRequestServices.cancelService(
		id as string,
		req.body,
		req.user.id,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request cancelled successfully",
		data: result,
	});
};

const deleteService = async (
	req: Request,
	res: Response,
) => {
	const { id } = req.params;

	await ServiceRequestServices.deleteService(
		id as string,
		req.user.id,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request deleted successfully",
		data: null,
	});
};

export const ServiceRequestControllers = {
	createService,
	getMyServices,
	getSingleService,
	updateService,
	cancelService,
	deleteService,
};
