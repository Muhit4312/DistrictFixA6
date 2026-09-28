import { Router } from "express";
import { verifyAuth } from "../../middleware/verifyAuth";
import { Role } from "../../../generated/prisma/enums";
import { ServiceRequestControllers } from "./serviceRequest.controller";
import { ServiceRequestValidation } from "./serviceRequest.validation";
import { validateRequest } from "../../middleware/zodValidationRequest";

const router = Router();

router.post(
	"/create",
	verifyAuth(Role.CUSTOMER),
	validateRequest(ServiceRequestValidation.CreateServiceRequestZodSchema),
	ServiceRequestControllers.createService,
);

router.get(
	"/my",
	verifyAuth(Role.CUSTOMER),
	validateRequest(ServiceRequestValidation.ServiceRequestQueryZodSchema),
	ServiceRequestControllers.getMyServices,
);

router.get(
	"/:id",
	verifyAuth(
		Role.CUSTOMER,
	),
	ServiceRequestControllers.getSingleService,
);


router.patch(
	"/:id",
	verifyAuth(Role.CUSTOMER),
	validateRequest(ServiceRequestValidation.UpdateServiceRequestZodSchema),
	ServiceRequestControllers.updateService,
);


router.patch(
	"/:id/cancel",
	verifyAuth(Role.CUSTOMER),
	validateRequest(ServiceRequestValidation.CancelServiceRequestZodSchema),
	ServiceRequestControllers.cancelService,
);


router.delete(
	"/:id",
	verifyAuth(Role.CUSTOMER),
	ServiceRequestControllers.deleteService,
);

export const ServiceRequestRoutes = router;
