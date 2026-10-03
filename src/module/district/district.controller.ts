import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DistrictService } from "./district.service";

const createDistrict = async (req: Request, res: Response) => {
	const result = await DistrictService.createDistrict(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "District created successfully",
		data: result,
	});
};

const getAllDistricts = async (req: Request, res: Response) => {
	const result = await DistrictService.getAllDistricts();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Districts Retrieved successfully",
		data: result,
	});
};

const getSingleDistrict = async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await DistrictService.getSingleDistrict(id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "District Retrieved successfully",
		data: result,
	});
};

const updateDistrict = async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await DistrictService.updateDistrict(id as string, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "District updated successfully",
		data: result,
	});
};

const deleteDistrict = async (req: Request, res: Response) => {
	const { id } = req.params;

	await DistrictService.deleteDistrict(id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "District deleted successfully",
		data: null,
	});
};

export const DistrictController = {
	createDistrict,
	getAllDistricts,
	getSingleDistrict,
	updateDistrict,
	deleteDistrict,
};
