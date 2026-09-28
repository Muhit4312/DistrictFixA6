import { Router } from "express";
import { verifyAuth } from "../../middleware/verifyAuth";
import { Role } from "../../../generated/prisma/enums";
import { DistrictController } from "./district.controller";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { DistrictValidation } from "./district.validation";

const router = Router();

router.post(
	"/create",
	verifyAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(DistrictValidation.CreateDistrictZodSchema),
	DistrictController.createDistrict,
);
router.get("/", DistrictController.getAllDistricts);
router.get("/:id", DistrictController.getSingleDistrict);
router.patch(
	"/:id",
	verifyAuth(Role.SUPER_ADMIN, Role.ADMIN),
	validateRequest(DistrictValidation.UpdateDistrictZodSchema),
	DistrictController.updateDistrict,
);

router.delete(
	"/:id",
	verifyAuth(Role.SUPER_ADMIN, Role.ADMIN),
	DistrictController.deleteDistrict,
);

export const DistrictRoutes = router;
