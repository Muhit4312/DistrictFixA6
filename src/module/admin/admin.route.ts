import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { verifyAuth } from "../../middleware/verifyAuth";
import { ServiceHolderApplicationControllers } from "./admin.controller";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { ServiceHolderApplicationValidations } from "./admin.validation";

const router = Router();

router.get(
	"/service-holder-applications",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	ServiceHolderApplicationControllers.getAllApplications,
);

router.get(
	"/service-holder-applications/:id",
	verifyAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN),
	ServiceHolderApplicationControllers.getSingleApplication,
);

router.patch(
	"/service-holder-applications/:id/approve",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	ServiceHolderApplicationControllers.approveApplication,
);

router.patch(
	"/service-holder-applications/:id/reject",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(
		ServiceHolderApplicationValidations.RejectServiceHolderApplicationZodSchema,
	),
	ServiceHolderApplicationControllers.rejectApplication,
);

export const adminRoutes = router;
