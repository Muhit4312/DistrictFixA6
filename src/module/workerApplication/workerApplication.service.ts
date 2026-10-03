import { prisma } from "../../lib/prisma";

import {
	UserStatus,
	WorkerApplicationStatus,
	WorkerType,
} from "../../../generated/prisma/enums";
import type { WorkerApplicationWhereInput } from "../../../generated/prisma/models";
import type {
	ICreateWorkerApplicationPayload,
	IUpdateWorkerApplicationPayload,
	IWorkerApplicationQuery,
} from "./workerApplication.interface";

const createWorkerApplication = async (
	payload: ICreateWorkerApplicationPayload,
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

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked!");
	}

	if (user.status === UserStatus.SUSPENDED) {
		throw new Error("User is suspended!");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	if (user.role !== "CUSTOMER") {
		throw new Error("Only customers can apply as workers");
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
		throw new Error("This district is inactive");
	}

	const existingApplication = await prisma.workerApplication.findFirst({
		where: {
			userId,
			status: WorkerApplicationStatus.PENDING,
		},
	});

	if (existingApplication) {
		throw new Error("You already have a pending worker application");
	}

	const existingWorker = await prisma.worker.findUnique({
		where: {
			userId,
		},
	});

	if (existingWorker) {
		throw new Error("You are already a worker");
	}

	return await prisma.workerApplication.create({
		data: {
			...payload,
			userId,
		},
		include: {
			district: true,
		},
	});
};

const getMyWorkerApplications = async (
	query: IWorkerApplicationQuery,
	userId: string,
) => {
	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

	const page = Math.max(Number(query.page) || 1, 1);

	const skip = (page - 1) * limit;

	const sortBy =
		query.sortBy && ["createdAt", "updatedAt"].includes(query.sortBy)
			? query.sortBy
			: "createdAt";

	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const andConditions: WorkerApplicationWhereInput[] = [
		{
			userId,
		},
	];

	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}

	if (query.workerType) {
		andConditions.push({
			workerType: query.workerType,
		});
	}

	const whereCondition = {
		AND: andConditions,
	};

	const [applications, total] = await Promise.all([
		prisma.workerApplication.findMany({
			where: whereCondition,
			take: limit,
			skip,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				district: true,
				reviewer: {
					omit: {
						password: true,
					},
				},
			},
		}),

		prisma.workerApplication.count({
			where: whereCondition,
		}),
	]);

	return {
		data: applications,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const getMySingleWorkerApplication = async (id: string, userId: string) => {
	const application = await prisma.workerApplication.findFirst({
		where: {
			id,
			userId,
		},
		include: {
			district: true,
			reviewer: {
				omit: {
					password: true,
				},
			},
		},
	});

	if (!application) {
		throw new Error("Worker application not found");
	}

	return application;
};

const updateMyWorkerApplication = async (
	id: string,
	userId: string,
	payload: IUpdateWorkerApplicationPayload,
) => {
	const application = await prisma.workerApplication.findFirst({
		where: {
			id,
			userId,
		},
	});

	if (!application) {
		throw new Error("Worker application not found");
	}

	if (application.status !== WorkerApplicationStatus.PENDING) {
		throw new Error("Only pending applications can be updated");
	}

	return await prisma.workerApplication.update({
		where: {
			id: application.id,
		},
		data: payload,
		include: {
			district: true,
		},
	});
};

const deleteMyWorkerApplication = async (id: string, userId: string) => {
	const application = await prisma.workerApplication.findFirst({
		where: {
			id,
			userId,
		},
	});

	if (!application) {
		throw new Error("Worker application not found");
	}

	if (application.status !== WorkerApplicationStatus.PENDING) {
		throw new Error("Only pending applications can be deleted");
	}

	await prisma.workerApplication.delete({
		where: {
			id: application.id,
		},
	});

	return null;
};

export const WorkerApplicationServices = {
	createWorkerApplication,
	getMyWorkerApplications,
	getMySingleWorkerApplication,
	updateMyWorkerApplication,
	deleteMyWorkerApplication,
};
