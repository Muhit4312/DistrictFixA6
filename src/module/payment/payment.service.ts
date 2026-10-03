import { JwtPayload } from "jsonwebtoken";
import config from "../../config/env.config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "./payment.interface";

const createPayment = async (
	serviceRequestId: string,
	user: JwtPayload,
) => {
	const serviceRequest =
		await prisma.serviceRequest.findFirst({
			where: {
				id: serviceRequestId,
				customerId: user.userId,
				deletedAt: null,
			},
		});

	if (!serviceRequest) {
		throw new Error("Service request not found");
	}

	if (serviceRequest.status !== "COMPLETED") {
		throw new Error(
			"Payment is only available for completed service requests",
		);
	}

	if (!serviceRequest.serviceCharge) {
		throw new Error(
			"Service charge has not been determined yet",
		);
	}

	// const existingPayment =
	// 	await prisma.payment.findUnique({
	// 		where: {
	// 			serviceRequestId: serviceRequest.id,
	// 		},
	// 	});

	// if (existingPayment) {
	// 	if (existingPayment.status === "COMPLETED") {
	// 		throw new Error(
	// 			"Payment has already been completed",
	// 		);
	// 	}

	// 	return existingPayment;
	// }

	const bkashIdToken = await getBkashIdToken();

	if (!bkashIdToken) {
		throw new Error("No Bkash Access Token found");
	}
    console.log(user);

	const paymentResponse = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIdToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: user.email,
				callbackURL: `${config.bkash_callbak_url}/payment/service-request/callback`,
				amount: serviceRequest.serviceCharge.toString(),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: `INV1-${serviceRequest.id}`,
			}),
		},
	);

	const result = await paymentResponse.json();
    console.log(paymentResponse);
    console.log(result);

	if (!paymentResponse.ok) {
		throw new Error(
			result?.statusMessage ||
				"Failed to create bKash payment",
		);
	}

	// const payment = await prisma.payment.create({
	// 	data: {
	// 		amount: serviceRequest.serviceCharge,
	// 		currency: "BDT",
	// 		status: "PENDING",
	// 		paymentMethod: "BKASH",
	// 		bkashPaymentId: result.paymentID,
	// 		serviceRequestId: serviceRequest.id,
	// 		customerId: user.id,
	// 	},
	// });

	return {
		// paymentId: payment.id,
		// bkashPaymentId: result.paymentID,
		paymentUrl: result.bkashURL,
	};
};


const paymentCallback = async (query: Record<string, any>) => {
	const paymentId = query.paymentID
	if(!paymentId){
		throw new Error("Payment ID is required");
	}
	const status = query.status
	if(!status){
		throw new Error("Payment status is missing");
	}

	const bkashIdToken = await getBkashIdToken();

	if (!bkashIdToken) {
		throw new Error("No Bkash Access Token found");
	}

	const executePaymentResponse = await fetch(`${config.bkash_base_url}/tokenized/checkout/execute`,{
		method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-APP-Key": config.bkash_app_key,
				},
				body: JSON.stringify({
					paymentID: paymentId,
				}),
	})

	const executePaymentResult = await executePaymentResponse.json();

	if (!executePaymentResponse.ok) {
		throw new Error(
			executePaymentResult?.statusMessage ||
				"Failed to execute bKash payment",
		);
	}

	if(status === "success"){
		return {
			executePaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/payment/success?paymentID=${paymentId}`

		}
	}
	if(status === "failure"){
		return {
			executePaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/payment/failure?paymentID=${paymentId}`

		}
	}
	if(status === "cancel"){
		return {
			executePaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/payment/cancel?paymentID=${paymentId}`

		}
	}

	return {
		executePaymentResult,
		redirectUrl: `${config.frontend_url}/dashboard/payment`
	};

}

export const PaymentServices = {
	createPayment,
	paymentCallback
};