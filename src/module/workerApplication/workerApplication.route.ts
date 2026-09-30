import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { verifyAuth } from "../../middleware/verifyAuth";
import { WorkerApplicationControllers } from "./workerApplication.controller";
import { WorkerApplicationValidations } from "./workerApplication.validation";
import { validateRequest } from "../../middleware/zodValidationRequest";

const router = Router();



router.post(
	"/apply",
	verifyAuth(Role.CUSTOMER),
	validateRequest(
		WorkerApplicationValidations.CreateWorkerApplicationZodSchema,
	),
	WorkerApplicationControllers.createWorkerApplication,
);

router.get(
	"/my-applications",
	verifyAuth(Role.CUSTOMER),
	WorkerApplicationControllers.getMyWorkerApplications,
);

router.get(
	"/my-application/:id",
	verifyAuth(Role.CUSTOMER),
	WorkerApplicationControllers.getMyWorkerApplicationById,
);

router.patch(
	"/my-application/:id",
	verifyAuth(Role.CUSTOMER),
	validateRequest(
		WorkerApplicationValidations.UpdateWorkerApplicationZodSchema,
	),
	WorkerApplicationControllers.updateMyWorkerApplication,
);

router.delete(
	"/my-application/:id",
	verifyAuth(Role.CUSTOMER),
	WorkerApplicationControllers.deleteMyWorkerApplication,
);





export const WorkerApplicationRoutes = router;