import { Router } from "express";
import { verifyAuth } from "../../middleware/verifyAuth";
import { Role } from "../../../generated/prisma/enums";
import { ServiceRequestControllers } from "./serviceRequest.controller";

const router = Router();

router.post(
	"/create",
	verifyAuth(Role.CUSTOMER),
	ServiceRequestControllers.createService,
);

router.get(
	"/my",
	verifyAuth(Role.CUSTOMER),
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
	ServiceRequestControllers.updateService,
);


router.patch(
	"/:id/cancel",
	verifyAuth(Role.CUSTOMER),
	ServiceRequestControllers.cancelService,
);


router.delete(
	"/:id",
	verifyAuth(Role.CUSTOMER),
	ServiceRequestControllers.deleteService,
);

export const ServiceRequestRoutes = router;
