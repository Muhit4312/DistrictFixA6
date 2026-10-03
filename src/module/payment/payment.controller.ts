import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentServices } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"


const createPayment = catchAsync(
	async (req: Request, res: Response) => {
		const { serviceRequestId } = req.params;

		const result = await PaymentServices.createPayment(
			serviceRequestId as string,
			req.user,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Payment created successfully",
			data: result,
		});
	},
);
const paymentCallback = catchAsync(
	async (req: Request, res: Response) => {


		const { redirectUrl } = await PaymentServices.paymentCallback(req.query);


		res.redirect(redirectUrl);

	},
);

export const PaymentControllers = {
	createPayment,
	paymentCallback,
	// executePayment,
	// getPayment,
};