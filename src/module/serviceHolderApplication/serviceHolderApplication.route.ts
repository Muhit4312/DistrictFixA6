import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { verifyAuth } from "../../middleware/verifyAuth";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { ServiceHolderApplicationValidation } from "./serviceHolderApplication.vallidation";
import { ServiceHolderApplicationControllers } from "./serviceHolderApplication.constroller";


const router = Router();

router.post(
	"/apply",
	verifyAuth(Role.CUSTOMER),
	validateRequest(
		ServiceHolderApplicationValidation.CreateServiceHolderApplicationZodSchema,
	),
	ServiceHolderApplicationControllers.createApplication,
);

router.get(
	"/my",
	verifyAuth(Role.CUSTOMER),
	ServiceHolderApplicationControllers.getMyApplications,
);

router.get(
	"/:id",
	verifyAuth(
		Role.CUSTOMER,
		Role.SUPER_ADMIN,
		Role.ADMIN,
	),
	ServiceHolderApplicationControllers.getSingleApplication,
);


export const ServiceHolderApplicationRoutes = router;