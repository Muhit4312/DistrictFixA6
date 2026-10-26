import path from "path";
import {
	ApplicationStatus,
	Role,
	ServiceHolderStatus,
	UserStatus,
} from "../../../generated/prisma/enums";
import type { ServiceHolderApplicationWhereInput, UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type {
	IGetAllUsersQuery,
	IRejectServiceHolderApplicationPayload,
	IServiceHolderApplicationQuery,
	UpdateUserPayload,
	UpdateUserStatusPayload,
} from "./admin.interface";
import { transporter } from "../../lib/nodemailer";
import config from "../../config/env.config";
import ejs from "ejs";

const getAllUsers = async (query: IGetAllUsersQuery) => {
	const page = Math.max(Number(query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
	const skip = (page - 1) * limit;

	const andConditions: UserWhereInput[] = [];

	if (query.searchTerm?.trim()) {
		const searchTerm = query.searchTerm.trim();

		andConditions.push({
			OR: [
				{
					name: {
						contains: searchTerm,
						mode: "insensitive",
					},
				},
				{
					email: {
						contains: searchTerm,
						mode: "insensitive",
					},
				}

			],
		});
	}

	if (query.role) {
		andConditions.push({
			role: query.role,
		});
	}

	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}


	andConditions.push({
		isDeleted: false,
		deletedAt: null,
	});

	const whereCondition: UserWhereInput =
		andConditions.length > 0
			? { AND: andConditions }
			: {};

	const [users, totalUsers] = await Promise.all([
		prisma.user.findMany({
			where: whereCondition,
			skip,
			take: limit,
			orderBy: {
				createdAt: query.sortOrder === "asc" ? "asc" : "desc",
			},
			omit: {
				password: true,
			},
		}),
		prisma.user.count({
			where: whereCondition,
		}),
	]);

	return {
		data: users,
		meta: {
			page,
			limit,
			total: totalUsers,
			totalPages: Math.ceil(totalUsers / limit),
		},
	};
};

const getSingleUser = async (id: string) => {
	const user = await prisma.user.findFirst({
		where: {
			id,
			isDeleted: false,
			deletedAt: null,
		},
		omit: {
			password: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	return user;
};




const updateUser = async (id: string, payload: UpdateUserPayload) => {
	const data: UpdateUserPayload = {};

	if (payload.name !== undefined) {
		if (!payload.name.trim()) {
			throw new Error("Name cannot be empty");
		}

		data.name = payload.name.trim();
	}

	if (payload.phone !== undefined) {
		data.phone = payload.phone;
	}

	if (Object.keys(data).length === 0) {
		throw new Error("Provide at least one field to update");
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			id,
			isDeleted: false,
			deletedAt: null,
		},
	});

	if (!existingUser) {
		throw new Error("User not found");
	}

	return prisma.user.update({
		where: { id },
		data,
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			role: true,
			status: true,
			emailVerified: true,
			imageUrl: true,
			createdAt: true,
			updatedAt: true,
		},
	});
};

const updateUserStatus = async (
	id: string,
	payload: UpdateUserStatusPayload,
) => {
	if (!["ACTIVE", "BLOCKED"].includes(payload.status)) {
		throw new Error("Status must be ACTIVE or BLOCKED");
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			id,
			isDeleted: false,
			deletedAt: null,
		},
	});

	if (!existingUser) {
		throw new Error("User not found");
	}

	if (existingUser.role === "SUPER_ADMIN") {
		throw new Error("Super Admin status cannot be changed");
	}

	return prisma.user.update({
		where: { id },
		data: {
			status: payload.status,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
			updatedAt: true,
		},
	});
};

const getAllApplications = async (query: IServiceHolderApplicationQuery) => {
	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

	const page = Math.max(Number(query.page) || 1, 1);

	const skip = (page - 1) * limit;

	const andConditions: ServiceHolderApplicationWhereInput[] = [];

	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					businessName: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					phone: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					address: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}
	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}

	if (query.districtId) {
		andConditions.push({
			districtId: query.districtId,
		});
	}

	const whereCondition =
		andConditions.length > 0
			? {
				AND: andConditions,
			}
			: {};

	const [applications, totalApplications] = await Promise.all([
		prisma.serviceHolderApplication.findMany({
			where: whereCondition,
			skip,
			take: limit,
			orderBy: {
				createdAt: query.sortOrder === "asc" ? "asc" : "desc",
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						status: true,
					},
				},
				district: true,
				reviewer: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		}),

		prisma.serviceHolderApplication.count({
			where: whereCondition,
		}),
	]);

	return {
		data: applications,
		meta: {
			page,
			limit,
			total: totalApplications,
			totalPages: Math.ceil(totalApplications / limit),
		},
	};
};

const getSingleApplication = async (id: string, userId: string, role: Role) => {
	if (
		role !== Role.CUSTOMER &&
		role !== Role.ADMIN &&
		role !== Role.SUPER_ADMIN
	) {
		throw new Error("You are not authorized to view this application");
	}

	const whereCondition = role === Role.CUSTOMER ? { id, userId } : { id };

	const application = await prisma.serviceHolderApplication.findFirst({
		where: whereCondition,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					status: true,
				},
			},
			district: true,
			reviewer: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	if (!application) {
		throw new Error("Service Holder application not found");
	}

	return application;
};

const approveApplication = async (id: string, adminId: string) => {
	const application = await prisma.serviceHolderApplication.findUnique({
		where: {
			id,
		},
		include: {
			user: {
				omit: {
					password: true,
				},
			},
			district: true,
		},
	});

	console.log({ application });

	if (!application) {
		throw new Error("Service Holder application not found");
	}

	if (application.status !== ApplicationStatus.PENDING) {
		throw new Error("This application has already been reviewed");
	}

	if (!application.district.isActive) {
		throw new Error("This district is currently inactive");
	}

	if (application.user.role !== Role.CUSTOMER) {
		throw new Error("Only customers can become Service Holders");
	}

	if (
		application.user.status === UserStatus.BLOCKED ||
		application.user.status === UserStatus.SUSPENDED ||
		application.user.status === UserStatus.DELETED ||
		application.user.isDeleted
	) {
		throw new Error("This user cannot become a Service Holder");
	}

	const existingServiceHolder = await prisma.serviceHolder.findUnique({
		where: {
			districtId: application.districtId,
		},
	});

	if (existingServiceHolder) {
		throw new Error("This district already has a Service Holder");
	}

	const result = await prisma.$transaction(async (tx) => {
		const reviewedApplication = await tx.serviceHolderApplication.update({
			where: {
				id: application.id,
			},
			data: {
				status: ApplicationStatus.APPROVED,
				reviewedById: adminId,
				reviewedAt: new Date(),
			},
		});

		const updatedUser = await tx.user.update({
			where: {
				id: application.userId,
			},
			data: {
				role: Role.SERVICE_HOLDER,
			},
			omit: {
				password: true,
			},
		});

		const serviceHolder = await tx.serviceHolder.create({
			data: {
				userId: application.userId,
				districtId: application.districtId,
				businessName: application.businessName,
				phone: application.phone,
				address: application.address,
				status: ServiceHolderStatus.ACTIVE,
				approvedAt: new Date(),
			},
		});

		return {
			application: reviewedApplication,
			user: updatedUser,
			serviceHolder,
		};
	});

	try {
		const templatePath = path.join(
			process.cwd(),
			"src/templates/service-holder-application-approved.ejs",
		);

		const html = await ejs.renderFile(templatePath, {
			name: application.user.name,
			businessName: application.businessName,
			districtName: application.district.name,
		});

		await transporter.sendMail({
			from: `"DistrictFix" <${config.email_sender}>`,
			to: application.user.email,
			subject: "Your DistrictFix Service Holder Application Has Been Approved",
			html,
		});
	} catch (error) {
		console.error("Failed to send Service Holder approval email:", error);
	}

	return result;
};

const rejectApplication = async (
	id: string,
	adminId: string,
	payload: IRejectServiceHolderApplicationPayload,
) => {
	const application = await prisma.serviceHolderApplication.findUnique({
		where: {
			id,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			district: true,
		},
	});

	if (!application) {
		throw new Error("Service Holder application not found");
	}

	if (application.status !== ApplicationStatus.PENDING) {
		throw new Error("This application has already been reviewed");
	}

	const rejectedApplication = await prisma.serviceHolderApplication.update({
		where: {
			id: application.id,
		},
		data: {
			status: ApplicationStatus.REJECTED,
			rejectionReason: payload.rejectionReason,
			reviewedById: adminId,
			reviewedAt: new Date(),
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			district: true,
			reviewer: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	try {
		const templatePath = path.join(
			process.cwd(),
			"src/templates/service-holder-application-rejected.ejs",
		);

		const html = await ejs.renderFile(templatePath, {
			name: application.user.name,
			businessName: application.businessName,
			districtName: application.district.name,
			rejectionReason: payload.rejectionReason,
		});

		await transporter.sendMail({
			from: `"DistrictFix" <${config.email_sender}>`,
			to: application.user.email,
			subject: "Update on Your DistrictFix Service Holder Application",
			html,
		});
	} catch (error) {
		console.error("Failed to send Service Holder rejection email:", error);
	}

	return rejectedApplication;
};

export const AdminServices = {
	getAllApplications,
	getSingleApplication,
	approveApplication,
	rejectApplication,
	getAllUsers,
	getSingleUser,
	updateUser,
	updateUserStatus
};
