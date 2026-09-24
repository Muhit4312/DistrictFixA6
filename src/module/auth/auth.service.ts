import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterUserPayload, IRegisterVerifyEmailPayload } from "./auth.interface";
import crypto from "crypto";
import { RadisClient } from "../../lib/radis";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import config from "../../config/env.config";
import ejs from "ejs"
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";


const registerCustomer = async (payload: IRegisterUserPayload) => {
	const { name, password} = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	const expirationSeconds = 5 * 60;

	const otpValue = crypto.randomInt(100000, 1000000).toString();
	const otpKey = `customer-registration-otp:${email}`;

	await RadisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	const radisUserDataPayload = {
		name,
		email,
		password: hashedPassword,
	};

	const customerRegistrationKey = `customer-registration-data:${email}`;

	await RadisClient.set(
		customerRegistrationKey,
		JSON.stringify(radisUserDataPayload),
		{
			expiration: {
				type: "EX",
				value: expirationSeconds,
			},
		},
	);

	const templatePath = path.join(
		process.cwd(),
		"src/templates/registrarion-user-otp.ejs",
	);

	const templateData = {
		name,
		otp: otpValue,
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: `"DistrictFix" <${config.email_sender}>`,
		to: email,
		subject: "PH Healthcare - Registration OTP",

		html,
	});
};



const verifyCustomerEmail = async (payload: IRegisterVerifyEmailPayload) => {
	const email = payload.email.trim().toLowerCase();
	const otp = payload.otp;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist?.emailVerified) {
		throw new Error("Email Already Verified.");
	}

	if (isUserExist?.status === "BLOCKED") {
		throw new Error("User is blocked!");
	}
	if (isUserExist?.status === "SUSPENDED") {
	throw new Error("User is suspended!");
    }
	if (isUserExist?.isDeleted || isUserExist?.status === "DELETED") {
		throw new Error("User is deleted!");
	}

	const otpKey = `customer-registration-otp:${email}`;
	const radisOtp = await RadisClient.get(otpKey);

	if (!radisOtp) {
		throw new Error("OTP expired or invalid!");
	}

	if (otp !== radisOtp) {
		throw new Error("OTP Does Not Match");
	}

	await RadisClient.del(otpKey);

	const customerRegistrationKey = `customer-registration-data:${email}`;

	const radisPatientData = await RadisClient.get(customerRegistrationKey);

	if (!radisPatientData) {
		throw new Error("Customer does not exist!");
	}

	const customerPayload: IRegisterUserPayload = JSON.parse(radisPatientData);

	const createdUser = await prisma.user.create({
		data: {
			name: customerPayload.name,
			email,
			password: customerPayload.password,
			role: Role.CUSTOMER,
			status: UserStatus.ACTIVE,
			emailVerified: true,
			profile: {
				create: {
					
				},
			},
		},
		omit: { password: true },
		include: { profile: true },
	});

	await RadisClient.del(customerRegistrationKey);

	const templatePath = path.join(
		process.cwd(),
		"src/templates/customer-welcome-email.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name: createdUser.name,
	});

	await transporter.sendMail({
		from: `"DistrictFix" <${config.email_sender}>`,
		to: createdUser.email,
		subject: "Welcome to DistrictFix System",
		html,
	});

	const { profile, ...user } = createdUser;
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		user,
		profile,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked!");
	}
	if (user.status === UserStatus.SUSPENDED) {
		throw new Error("User is Suspended!");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	// if (user.password === null && user.googleId !== null) {
	// 	throw new Error(
	// 		"User already has account with google. Try to login with google.",
	// 	);
	// }

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};





export const AuthServices = {
    registerCustomer,
    verifyCustomerEmail,
	loginUser
}