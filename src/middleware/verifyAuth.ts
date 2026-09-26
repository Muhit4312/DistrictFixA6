import type { NextFunction, Request, Response } from "express";
import config from "../config/env.config";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

export const verifyAuth = (...requiredRoles: Role[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token =
			req.cookies.accessToken ||
			(req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization);

		if (!token) {
			throw new Error("You are not logged in.");
		}

		const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
		

		if (!verifiedToken) {
			throw new Error("Invalid Token");
		}

		const { userId, email, name, role } = verifiedToken as JwtPayload;

		if (requiredRoles.length && !requiredRoles.includes(role)) {
			throw new Error("Forbidden access to resources.");
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				email,
			},
		});

		if (!user) {
			throw new Error("User not found!");
		}

		if (user.status !== "ACTIVE") {
			throw new Error("You are not active user.");
		}

		req.user = {
			userId,
			email,
			name,
			role,
		};

		next();
	});
};
