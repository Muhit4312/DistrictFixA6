import { JwtPayload } from "jsonwebtoken";
import config from "../../config/env.config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { IBkashCallbackQuery, IRequestUser } from "./payment.interface";
import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";
import { Payment } from "../../../generated/prisma/client";

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

	const existingPayment =
		await prisma.payment.findUnique({
			where: {
				serviceRequestId: serviceRequest.id,
			},
		});

	if (existingPayment) {
		if (existingPayment.status === PaymentStatus.COMPLETED) {
			throw new Error("Payment has already been completed");
		}

		if (existingPayment.status === PaymentStatus.PENDING) {
			if (existingPayment.bkashUrl) {
				return {
					paymentId: existingPayment.id,
					bkashPaymentId:
						existingPayment.bkashPaymentId,
					paymentUrl: existingPayment.bkashUrl,
				};
			}

			throw new Error("Payment is already in progress");
		}

	}

	const bkashIdToken = await getBkashIdToken();

	if (!bkashIdToken) {
		throw new Error("No Bkash Access Token found");
	}

	const merchantInvoiceNumber =
		`INV-${serviceRequest.id}-${Date.now()}`;

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
				callbackURL:
					`${config.bkash_callbak_url}/payment/service-request/callback`,
				amount:
					serviceRequest.serviceCharge.toString(),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber,
			}),
		},
	);

	const paymentResponseResult = await paymentResponse.json();

	if (
		!paymentResponse.ok ||
		paymentResponseResult.statusCode !== "0000"
	) {
		throw new Error(
			paymentResponseResult?.statusMessage ||
			"Failed to create bKash payment",
		);
	}

	let payment: Payment;

	if (existingPayment) {
		payment = await prisma.payment.update({
			where: {
				id: existingPayment.id,
			},
			data: {
				amount: serviceRequest.serviceCharge,
				currency: "BDT",
				status: PaymentStatus.PENDING,
				paymentMethod: PaymentMethod.BKASH,

				bkashPaymentId:
					paymentResponseResult.paymentID,

				bkashUrl:
					paymentResponseResult.bkashURL,

				merchantInvoiceNumber:
					paymentResponseResult.merchantInvoiceNumber ??
					merchantInvoiceNumber,

				payerReference: user.email,

				bkashTransactionId: null,
				paymentExecuteTime: null,
				paidAt: null,

				gatewayResponse: paymentResponseResult,
			},
		});
	} else {
		payment = await prisma.payment.create({
			data: {
				amount: serviceRequest.serviceCharge,
				currency: "BDT",
				status: PaymentStatus.PENDING,
				paymentMethod: PaymentMethod.BKASH,

				bkashPaymentId:
					paymentResponseResult.paymentID,

				bkashUrl:
					paymentResponseResult.bkashURL,

				merchantInvoiceNumber:
					paymentResponseResult.merchantInvoiceNumber ??
					merchantInvoiceNumber,

				payerReference: user.email,
				gatewayResponse: paymentResponseResult,

				serviceRequestId: serviceRequest.id,
				customerId: user.userId,
			},
		});
	}

	return {
		paymentId: payment.id,
		bkashPaymentId: payment.bkashPaymentId,
		paymentUrl: payment.bkashUrl,
	};
};





const paymentCallback = async (
	query: IBkashCallbackQuery,
) => {
	const paymentId = query.paymentID;

	if (!paymentId) {
		throw new Error("Payment ID is required");
	}

	const status = query.status;

	if (!status) {
		throw new Error("Payment status is missing");
	}


	if (status === "cancel") {
		const payment = await prisma.payment.findUnique({
			where: {
				bkashPaymentId: paymentId,
			},
		});

		if (
			payment &&
			payment.status !== PaymentStatus.COMPLETED
		) {
			await prisma.payment.update({
				where: {
					id: payment.id,
				},
				data: {
					status: PaymentStatus.CANCELLED,
				},
			});
		}

		return {
			redirectUrl:
				`${config.frontend_url}/dashboard/payment/cancel?paymentID=${paymentId}`,
		};
	}
	if (status === "failure") {
		const payment = await prisma.payment.findUnique({
			where: {
				bkashPaymentId: paymentId,
			},
		});

		if (
			payment &&
			payment.status !== PaymentStatus.COMPLETED
		) {
			await prisma.payment.update({
				where: {
					id: payment.id,
				},
				data: {
					status: PaymentStatus.FAILED,
				},
			});
		}

		return {
			redirectUrl:
				`${config.frontend_url}/dashboard/payment/failure?paymentID=${paymentId}`,
		};
	}

	if (status !== "success") {
		return {
			redirectUrl:
				`${config.frontend_url}/dashboard/payment?error=failed`,
		};
	}

	const bkashIdToken = await getBkashIdToken();

	if (!bkashIdToken) {
		throw new Error("No Bkash Access Token found");
	}

	const executePaymentResponse = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/execute`,
		{
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
		},
	);

	const executePaymentResult =
		await executePaymentResponse.json();

	if (
		!executePaymentResponse.ok ||
		executePaymentResult.statusCode !== "0000"
	) {
		throw new Error(
			executePaymentResult?.statusMessage ||
			"Failed to execute bKash payment",
		);
	}

	const payment = await prisma.payment.findUnique({
		where: {
			bkashPaymentId: paymentId,
		},
	});

	if (!payment) {
		throw new Error("Payment not found");
	}

	if (payment.status === PaymentStatus.COMPLETED) {
		return {
			redirectUrl:
				`${config.frontend_url}/dashboard/payment/success?paymentID=${paymentId}`,
		};
	}

	await prisma.payment.update({
		where: {
			id: payment.id,
		},
		data: {
			status: PaymentStatus.COMPLETED,
			bkashTransactionId:
				executePaymentResult.trxID,
			paymentExecuteTime:
				executePaymentResult.paymentExecuteTime,
			paidAt: new Date(),
			gatewayResponse: executePaymentResult,
		},
	});

	return {
		redirectUrl:
			`${config.frontend_url}/dashboard/payment/success?paymentID=${paymentId}`,
	};
};

export const PaymentServices = {
	createPayment,
	paymentCallback
};