import { Router } from "express";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { AiController } from "./ai.controller";
import { AiValidation } from "./ai.validation";

const router = Router();

router.post(
	"/chat",
	validateRequest(AiValidation.chat),
	AiController.chat,
);

export const AiRoutes = router;