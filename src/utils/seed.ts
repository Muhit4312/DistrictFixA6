import { Role } from "../../generated/prisma/enums";
import config from "../config/env.config";

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
	try {
		const existingSuperAdmin = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});

		if (existingSuperAdmin) {
			console.log("Super Admin already exists!");
			return;
		}

		const { super_admin_name, super_admin_email, super_admin_password } =
			config;

		if (!super_admin_name || !super_admin_email || !super_admin_password) {
			throw new Error(
				"Super Admin Name, Email, or Password is missing in env.",
			);
		}

		const hashedPassword = await bcrypt.hash(
			super_admin_password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name: super_admin_name,
				email: super_admin_email,
				password: hashedPassword,
				role: Role.SUPER_ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Super Admin created successfully!");
	} catch (error) {
		console.error("Error seeding Super Admin:", error);
	}
};

export const seedAdmin = async () => {
	try {
		const { admin_name, admin_email, admin_password } = config;

		if (!admin_name || !admin_email || !admin_password) {
			throw new Error(
				"Admin Name, Email, or Password is missing in env.",
			);
		}

		const existingUser = await prisma.user.findUnique({
			where: {
				email: admin_email,
			},
		});

		if (existingUser) {
			if (existingUser.role === Role.ADMIN) {
				console.log("Admin already exists!");
				return;
			}

			throw new Error(
				`Email ${admin_email} is already used by another user.`,
			);
		}

		const hashedPassword = await bcrypt.hash(
			admin_password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name: admin_name,
				email: admin_email,
				password: hashedPassword,
				role: Role.ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Admin created successfully!");
	} catch (error) {
		console.error("Error seeding Admin:", error);
	}
};
export const seedServiceHolder = async () => {
	try {
		const existingServiceHolder = await prisma.user.findUnique({
			where: {
				email: config.service_holder_email,
			},
		});

		if (existingServiceHolder) {
			console.log("Service Holder already exists!");
			return;
		}

		const { service_holder_name, service_holder_email, service_holder_password } =
			config;

		if (
			!service_holder_name ||
			!service_holder_email ||
			!service_holder_password
		) {
			throw new Error(
				"Service Holder Name, Email, or Password is missing in env.",
			);
		}

		const hashedPassword = await bcrypt.hash(
			service_holder_password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name: service_holder_name,
				email: service_holder_email,
				password: hashedPassword,
				role: Role.SERVICE_HOLDER,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Service Holder created successfully!");
	} catch (error) {
		console.error("Error seeding Service Holder:", error);
	}
};

export const seedPlumber = async () => {
	try {
		const existingPlumber = await prisma.user.findUnique({
			where: {
				email: config.plumber_email,
			},
		});

		if (existingPlumber) {
			console.log("Plumber already exists!");
			return;
		}

		const { plumber_name, plumber_email, plumber_password } = config;

		if (!plumber_name || !plumber_email || !plumber_password) {
			throw new Error(
				"Plumber Name, Email, or Password is missing in env.",
			);
		}

		const hashedPassword = await bcrypt.hash(
			plumber_password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name: plumber_name,
				email: plumber_email,
				password: hashedPassword,
				role: Role.PLUMBER,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Plumber created successfully!");
	} catch (error) {
		console.error("Error seeding Plumber:", error);
	}
};

export const seedElectrician = async () => {
	try {
		const existingElectrician = await prisma.user.findUnique({
			where: {
				email: config.electrician_email,
			},
		});

		if (existingElectrician) {
			console.log("Electrician already exists!");
			return;
		}

		const { electrician_name, electrician_email, electrician_password } =
			config;

		if (!electrician_name || !electrician_email || !electrician_password) {
			throw new Error(
				"Electrician Name, Email, or Password is missing in env.",
			);
		}

		const hashedPassword = await bcrypt.hash(
			electrician_password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name: electrician_name,
				email: electrician_email,
				password: hashedPassword,
				role: Role.ELECTRICIAN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Electrician created successfully!");
	} catch (error) {
		console.error("Error seeding Electrician:", error);
	}
};



