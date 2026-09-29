import { ApplicationStatus, Role, ServiceHolderStatus, UserStatus } from "../../../generated/prisma/enums";
import { ServiceHolderApplicationWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IRejectServiceHolderApplicationPayload, IServiceHolderApplicationQuery } from "./admin.interface";


const getAllApplications = async (
	query: IServiceHolderApplicationQuery,
) => {
	const limit = Math.min(
		Math.max(Number(query.limit) || 10, 1),
		50,
	);

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

const getSingleApplication = async (
	id: string,
	userId: string,
	role: Role,
) => {
	if (
		role !== Role.CUSTOMER &&
		role !== Role.ADMIN &&
		role !== Role.SUPER_ADMIN
	) {
		throw new Error(
			"You are not authorized to view this application",
		);
	}

	const whereCondition =
		role === Role.CUSTOMER ? { id, userId, } : { id, };

	const application =
		await prisma.serviceHolderApplication.findFirst({
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
		throw new Error(
			"Service Holder application not found",
		);
	}

	return application;
};

const approveApplication = async (
	id: string,
	adminId: string,
) => {
	const application =
		await prisma.serviceHolderApplication.findUnique({
			where: {
				id,
			},
			include: {
				user: {
					omit: {
						password: true
					}
				},
				district: true,
			},
		});

	console.log({ application });

	if (!application) {
		throw new Error(
			"Service Holder application not found",
		);
	}

	if (application.status !== ApplicationStatus.PENDING) {
		throw new Error(
			"This application has already been reviewed",
		);
	}

	if (!application.district.isActive) {
		throw new Error(
			"This district is currently inactive",
		);
	}

	if (application.user.role !== Role.CUSTOMER) {
		throw new Error(
			"Only customers can become Service Holders",
		);
	}

	if (
		application.user.status === UserStatus.BLOCKED ||
		application.user.status === UserStatus.SUSPENDED ||
		application.user.status === UserStatus.DELETED ||
		application.user.isDeleted
	) {
		throw new Error(
			"This user cannot become a Service Holder",
		);
	}

	const existingServiceHolder =
		await prisma.serviceHolder.findUnique({
			where: {
				districtId: application.districtId,
			},
		});

	if (existingServiceHolder) {
		throw new Error(
			"This district already has a Service Holder",
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const reviewedApplication =
			await tx.serviceHolderApplication.update({
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
			omit:{
				password: true
			}
		});

		const serviceHolder =
			await tx.serviceHolder.create({
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

	return result;
};

const rejectApplication = async (
	id: string,
	adminId: string,
	payload: IRejectServiceHolderApplicationPayload,
) => {
	const application =
		await prisma.serviceHolderApplication.findUnique({
			where: {
				id,
			},
		});

	if (!application) {
		throw new Error(
			"Service Holder application not found",
		);
	}

	if (application.status !== ApplicationStatus.PENDING) {
		throw new Error(
			"This application has already been reviewed",
		);
	}

	return await prisma.serviceHolderApplication.update({
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
};

export const ServiceHolderApplicationServices = {
	getAllApplications,
	getSingleApplication,
	approveApplication,
	rejectApplication,
};