import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { verifyAuth } from "../../middleware/verifyAuth";
import { ServiceHolderControllers } from "./serviceHolder.controller";
import { ServiceHolderValidations } from "./serviceHolder.validation";
import { validateRequest } from "../../middleware/zodValidationRequest";

const router = Router();

router.get(
	"/me",
	verifyAuth(Role.SERVICE_HOLDER),
	ServiceHolderControllers.getMyServiceHolder,
);

router.patch(
	"/me",
	verifyAuth(Role.SERVICE_HOLDER),
	validateRequest(
		ServiceHolderValidations.UpdateServiceHolderZodSchema,
	),
	ServiceHolderControllers.updateMyServiceHolder,
);

export const ServiceHolderRoutes = router;