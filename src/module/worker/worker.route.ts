import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";

import { WorkerControllers } from "./worker.controller";
import { WorkerValidations } from "./worker.validation";
import { verifyAuth } from "../../middleware/verifyAuth";
import { validateRequest } from "../../middleware/zodValidationRequest";

const router = Router();

router.get(
	"/me",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	WorkerControllers.getMyWorkerProfile,
);

router.patch(
	"/me",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	validateRequest(WorkerValidations.UpdateWorkerProfileZodSchema),
	WorkerControllers.updateMyWorkerProfile,
);

router.get(
	"/assigned-services",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	WorkerControllers.getMyAssignedServices,
);

router.get(
	"/assigned-services/:id",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	WorkerControllers.getMyAssignedSingleService,
);

router.patch(
	"/assigned-services/:id/accept",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	WorkerControllers.acceptServiceRequest,
);

router.patch(
	"/assigned-services/:id/reject",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	validateRequest(WorkerValidations.RejectServiceRequestZodSchema),
	WorkerControllers.rejectServiceRequest,
);

router.patch(
	"/assigned-services/:id/start",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	WorkerControllers.startServiceRequest,
);

router.patch(
	"/assigned-services/:id/complete",
	verifyAuth(Role.PLUMBER, Role.ELECTRICIAN),
	validateRequest(WorkerValidations.CompleteServiceRequestZodSchema),
	WorkerControllers.completeServiceRequest,
);

export const WorkerRoutes = router;
