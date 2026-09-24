import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router()


router.post("/register", AuthController.registerCustomer);
router.post("/verify-email", AuthController.verifyCustomerEmail);
router.post("/login", AuthController.loginUser);

export const AuthRoutes = router;
