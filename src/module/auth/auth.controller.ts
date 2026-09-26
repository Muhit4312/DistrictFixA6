import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AuthServices } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";

const registerCustomer = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	await AuthServices.registerCustomer(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Please, verify your email. OTP has been sent to your Email..",
		data: null,
	});
});

const verifyCustomerEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await AuthServices.verifyCustomerEmail(payload);

	const { accessToken, refreshToken, user, profile } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Customer Created Successfully!!",
		data: {
			accessToken,
			refreshToken,
			user,
			profile,
		},
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthServices.loginUser(payload);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthServices.googleLogin(payload);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Google login successfully!",
		data: {
			accessToken,
			refreshToken,
		},
	});
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
	const {userId} = req.user
	console.log(req.user);
	if (!userId) {
		throw new Error("User information is missing in the request");
	}

	const result = await AuthServices.getCurrentUser(userId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User Retrieved successfully",
		data: result,
	});
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	 await AuthServices.forgotPassword(payload);
	

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `OTP has been sent to Email: ${payload.email}`,
		data: null,
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	await AuthServices.resetPassword(payload);
	
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password Changed successfully!",
		data:null,
	});
});

export const AuthController = {
	registerCustomer,
	verifyCustomerEmail,
	loginUser,
	googleLogin,
	forgotPassword,
	resetPassword,
	getCurrentUser
};
