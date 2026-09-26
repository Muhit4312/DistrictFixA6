import { Router } from "express";
import { verifyAuth } from "../../middleware/verifyAuth";
import { Role } from "../../../generated/prisma/enums";
import { ServiceRequestControllers } from "./serviceRequest.controller";

const router = Router();

router.post("/create", verifyAuth(Role.CUSTOMER), ServiceRequestControllers.createService);


export const ServiceRequestRoutes = router;
