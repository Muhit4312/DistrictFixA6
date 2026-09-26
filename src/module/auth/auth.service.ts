import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import type {
	IForgotPasswordPayload,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRegisterUserPayload,
	IRegisterVerifyEmailPayload,
	IRequestUser,
	IResetPasswordPayload,
} from "./auth.interface";
import crypto from "crypto";
import { RadisClient } from "../../lib/radis";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import config from "../../config/env.config";
import ejs from "ejs";
import {  AuthProvider, Role, UserStatus } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { googleClient } from "../../lib/googleAuth";
import { TokenPayload } from "google-auth-library";

const registerCustomer = async (payload: IRegisterUserPayload) => {
	const { name, password } = payload;
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
				create: {},
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

	if (user.password === null && user.googleId !== null) {
		throw new Error(
			"User already has account with google. Try to login with google.",
		);
	}

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


const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google ID Token Verification Failed", error);
		throw new Error("Invalid Or Expired Id Token");
	}

	if (!googleIdTokenPayload) {
		throw new Error("Invalid Or Expired Id Token");
	}

	if (!googleIdTokenPayload?.email) {
		throw new Error("Invalid Google User");
	}
	if (!googleIdTokenPayload?.name) {
		throw new Error("User Name Not Found!");
	}

	const ifCustomerExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: Role.CUSTOMER,
			googleId: googleIdTokenPayload.sub,
		},
	});

	let user = ifCustomerExistWithGoogleAuth;

	if (!ifCustomerExistWithGoogleAuth) {
		const ifCustomerExistWithCredential = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: Role.CUSTOMER,
				authProvider: AuthProvider.CREDENTIALS,
			},
		});

		if (ifCustomerExistWithCredential) {
			if (!ifCustomerExistWithCredential.emailVerified) {
				throw new Error("Email Not Verified.");
			}
			if (ifCustomerExistWithCredential.status === UserStatus.BLOCKED) {
				throw new Error("User is blocked!");
			}
			if (ifCustomerExistWithCredential.status === UserStatus.SUSPENDED) {
				throw new Error("User is suspended!");
			}
			if (
				ifCustomerExistWithCredential.status === UserStatus.DELETED ||
				ifCustomerExistWithCredential.isDeleted
			) {
				throw new Error("User is deleted!");
			}

			user = await prisma.user.update({
				where: {
					id: ifCustomerExistWithCredential.id,
				},
				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.CUSTOMER,
					googleId: googleIdTokenPayload.sub,
					authProvider: AuthProvider.GOOGLE,
					emailVerified: true,
					imageUrl: googleIdTokenPayload.picture ?? "",
					profile: {
						create: {
							
						},
					},
				},
			});
		}
	}

	if (!user) {
		throw new Error("User not found!");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked!");
	}
	if (user.status === UserStatus.SUSPENDED) {
		throw new Error("User is blocked!");
	}
	if (user.status === UserStatus.DELETED || user.isDeleted) {
		throw new Error("User is deleted!");
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

const getCurrentUser = async (userId: string) => {
	const isUserExists = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId,
		},
		include: {
			profile: true,
		},
		omit: {
			password: true,
		},
	});

	// if(!isUserExists){
	// 	throw new Error("User not exists")
	// }

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);
	console.log(verifiedRefreshToken);
	

	 if(!verifiedRefreshToken){
        throw new Error("invalid refresh token")
    }

	 const {userId} = verifiedRefreshToken as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id: userId
        }
    })

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked!");
	}
	if (user.status === UserStatus.SUSPENDED) {
		throw new Error("User is Suspended!");
	}

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	console.log({jwtPayload});

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

	console.log({refreshToken,accessToken});

	return {
		accessToken,
		refreshToken,
	};
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
	const { email } = payload;
	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!isUserExist) {
		throw new Error("User does not exist");
	}
	if (!isUserExist.emailVerified) {
		throw new Error("User does not Verified");
	}

	if (isUserExist.status === "BLOCKED") {
		throw new Error("User is blocked!");
	}
	if (isUserExist.status === "SUSPENDED") {
		throw new Error("User is suspended!");
	}
	if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
		throw new Error("User is deleted!");
	}

	if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
		throw new Error("User has account with Google.");
	}
	const otp = crypto.randomInt(100000, 1000000).toString();
	const key = `forgot-password-otp:${isUserExist.email}`;

	await RadisClient.set(key, otp, {
		expiration: {
			type: "EX",
			value: 5 * 60,
		},
	});

	const templatePath = path.join(
		process.cwd(),
		"src/templates/forgot-password.ejs",
	);

	const templateData = {
		name: isUserExist.name,
		otp,
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: `"DistrictFix" <${config.email_sender}>`,
		to: isUserExist.email,
		subject: "DistrictFix - Password Reset Code",

		html,
	});
};

const resetPassword = async (payload: IResetPasswordPayload) => {
	const { email, otp, newPassword } = payload;
	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!isUserExist) {
		throw new Error("User does not exist");
	}
	if (!isUserExist.emailVerified) {
		throw new Error("User does not Verified");
	}

	if (isUserExist.status === "BLOCKED") {
		throw new Error("User is blocked!");
	}
	if (isUserExist.status === "SUSPENDED") {
		throw new Error("User is suspended!");
	}
	if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
		throw new Error("User is deleted!");
	}

	if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
		throw new Error("User has account with Google.");
	}

	const key = `forgot-password-otp:${isUserExist.email}`;
	const radisOtp = await RadisClient.get(key);

	if (!radisOtp) {
		throw new Error("OTP expired or invalid!");
	}
	if (otp !== radisOtp) {
		throw new Error("OTP Does Not Match");
	}

	const hashedNewPassword = await bcrypt.hash(
		newPassword,
		Number(config.bcrypt_salt_rounds),
	);

	await prisma.user.update({
		where: {
			email: isUserExist.email,
		},
		data: {
			password: hashedNewPassword,
		},
	});

	await RadisClient.del([key]);

	const templatePath = path.join(
		process.cwd(),
		"src/templates/reset-password-success.ejs",
	);

	const templateData = {
		name: isUserExist.name,
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: `"DistrictFix" <${config.email_sender}>`,
		to: isUserExist.email,
		subject: "DistrictFix - Password Reset",

		html,
	});
};

export const AuthServices = {
	registerCustomer,
	verifyCustomerEmail,
	loginUser,
	googleLogin,
	forgotPassword,
	resetPassword,
	getCurrentUser,
	refreshToken
};
