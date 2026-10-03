import {
	ApplicationStatus,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { ICreateServiceHolderApplicationPayload } from "./serviceHolderApplication.interface";

const createApplication = async (
	payload: ICreateServiceHolderApplicationPayload,
	userId: string,
) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.role !== Role.CUSTOMER) {
		throw new Error("Only customers can apply for Service Holder");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	if (user.status === UserStatus.SUSPENDED) {
		throw new Error("User is suspended");
	}
	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	const district = await prisma.district.findUnique({
		where: {
			id: payload.districtId,
		},
	});

	if (!district) {
		throw new Error("District not found");
	}

	if (!district.isActive) {
		throw new Error("This district is currently inactive");
	}

	const existingPendingApplication =
		await prisma.serviceHolderApplication.findFirst({
			where: {
				userId,
				status: ApplicationStatus.PENDING,
			},
		});

	if (existingPendingApplication) {
		throw new Error("You already have a pending Service Holder application");
	}

	const existingServiceHolder = await prisma.serviceHolder.findUnique({
		where: {
			userId,
		},
	});

	if (existingServiceHolder) {
		throw new Error("You are already a Service Holder");
	}

	const application = await prisma.serviceHolderApplication.create({
		data: {
			userId,
			districtId: payload.districtId,
			businessName: payload.businessName,
			phone: payload.phone,
			address: payload.address,
			description: payload.description,
		},
		include: {
			district: true,
		},
	});

	return application;
};

const getMyApplications = async (userId: string) => {
	const applications = await prisma.serviceHolderApplication.findMany({
		where: {
			userId,
		},
		include: {
			district: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return applications;
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
			user: true,
			district: true,
			reviewer: true,
		},
	});

	if (!application) {
		throw new Error("Service Holder application not found");
	}

	return application;
};

export const ServiceHolderApplicationServices = {
	createApplication,
	getMyApplications,
	getSingleApplication,
};
