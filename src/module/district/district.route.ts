import { Router } from "express";
import { verifyAuth } from "../../middleware/verifyAuth";
import { Role } from "../../../generated/prisma/enums";
import { DistrictController } from "./district.controller";

const router = Router();

router.post("/create", DistrictController.createDistrict);


export const DistrictRoutes = router;
