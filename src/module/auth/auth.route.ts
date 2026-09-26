import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { UserValidation } from "./auth.validation";
import { verifyAuth } from "../../middleware/verifyAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register",validateRequest(UserValidation.CustomerRegistrationZodSchema), AuthController.registerCustomer);
router.post("/verify-email",validateRequest(UserValidation.CustomerVerifyZodSchema), AuthController.verifyCustomerEmail);
router.post("/login",validateRequest(UserValidation.loginZodSchema), AuthController.loginUser);
router.post("/google", AuthController.googleLogin);
router.get(
	"/me",
	verifyAuth(Role.ADMIN,Role.CUSTOMER,Role.ELECTRICIAN,Role.PLUMBER,Role.SERVICE_HOLDER,Role.SUPER_ADMIN),
	AuthController.getCurrentUser,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/forgot-password", validateRequest(UserValidation.forgotPasswordZodSchema), AuthController.forgotPassword);
router.post("/reset-password",validateRequest(UserValidation.resetPasswordZodSchema), AuthController.resetPassword);

export const AuthRoutes = router;
