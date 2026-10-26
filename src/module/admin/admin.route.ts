import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { verifyAuth } from "../../middleware/verifyAuth";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { ServiceHolderApplicationValidations } from "./admin.validation";
import { AdminController } from "./admin.controller";

const router = Router();




router.get(
	"/users",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.getAllUsers,
);

router.get(
	"/users/:id",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.getSingleUser,
);


router.patch(
	"/users/:id/status",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.updateUserStatus,
);

router.patch(
	"/users/:id",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.updateUser,
);


router.get(
	"/service-holder-applications",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.getAllApplications,
);

router.get(
	"/service-holder-applications/:id",
	verifyAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.getSingleApplication,
);

router.patch(
	"/service-holder-applications/:id/approve",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	AdminController.approveApplication,
);

router.patch(
	"/service-holder-applications/:id/reject",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(
		ServiceHolderApplicationValidations.RejectServiceHolderApplicationZodSchema,
	),
	AdminController.rejectApplication,
);

export const adminRoutes = router;
