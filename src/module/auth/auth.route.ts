import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/zodValidationRequest";
import { UserValidation } from "./auth.validation";

const router = Router();

router.post("/register",validateRequest(UserValidation.CustomerRegistrationZodSchema), AuthController.registerCustomer);
router.post("/verify-email",validateRequest(UserValidation.CustomerVerifyZodSchema), AuthController.verifyCustomerEmail);
router.post("/login",validateRequest(UserValidation.loginZodSchema), AuthController.loginUser);
router.post("/google", AuthController.googleLogin);
router.post("/forgot-password", validateRequest(UserValidation.forgotPasswordZodSchema), AuthController.forgotPassword);

export const AuthRoutes = router;
