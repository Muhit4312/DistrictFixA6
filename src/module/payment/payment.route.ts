import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { PaymentControllers } from "./payment.controller";
import { verifyAuth } from "../../middleware/verifyAuth";

const router = Router();

router.post(
	"/create/:serviceRequestId",
	verifyAuth(Role.CUSTOMER),
	PaymentControllers.createPayment,
);

// router.post(
// 	"/execute/:paymentId",
// 	verifyAuth(Role.CUSTOMER),
// 	PaymentControllers.executePayment,
// );

router.get("/service-request/callback", PaymentControllers.paymentCallback);

export const PaymentRoutes = router;
