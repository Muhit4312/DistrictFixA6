import {
	ServiceRequestStatus,
	UserStatus,
} from "../../../generated/prisma/enums";
import type { ServiceRequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type {
	ICompleteServiceRequestPayload,
	IRejectServiceRequestPayload,
	IServiceRequestQuery,
	IUpdateWorkerProfilePayload,
} from "./worker.interface";

const getMyWorkerProfile = async (userId: string) => {
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
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

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	return worker;
};

const updateMyWorkerProfile = async (
	userId: string,
	payload: IUpdateWorkerProfilePayload,
) => {
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const result = await prisma.worker.update({
		where: {
			id: worker.id,
		},
		data: payload,
		include: {
			user: {
				omit: {
					password: true,
				},
			},
			district: true,
		},
	});

	return result;
};

const getMyAssignedServices = async (
	query: IServiceRequestQuery,
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
		throw new Error("User is Suspended!");
	}

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

	const page = Math.max(Number(query.page) || 1, 1);

	const skip = (page - 1) * limit;

	const sortBy =
		query.sortBy && ["createdAt", "updatedAt"].includes(query.sortBy)
			? query.sortBy
			: "createdAt";

	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const andConditions: ServiceRequestWhereInput[] = [
		{
			workerId: worker.id,
		},
		{
			deletedAt: null,
		},
	];

	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					serviceName: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					description: {
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

	if (query.serviceType) {
		andConditions.push({
			serviceType: query.serviceType,
		});
	}

	const whereCondition = {
		AND: andConditions,
	};

	const [services, total] = await Promise.all([
		prisma.serviceRequest.findMany({
			where: whereCondition,
			take: limit,
			skip,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				customer: {
					omit: {
						password: true,
					},
				},
				district: true,
				serviceHolder: true,
			},
		}),

		prisma.serviceRequest.count({
			where: whereCondition,
		}),
	]);

	return {
		data: services,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const getMyAssignedSingleService = async (id: string, userId: string) => {
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
		throw new Error("User is Suspended!");
	}

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			workerId: worker.id,
			deletedAt: null,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			district: true,
			serviceHolder: true,
		},
	});

	if (!serviceRequest) {
		throw new Error("Assigned service request not found");
	}

	return serviceRequest;
};

const acceptServiceRequest = async (id: string, userId: string) => {
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
		throw new Error("User is Suspended!");
	}

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			workerId: worker.id,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Assigned service request not found");
	}

	if (serviceRequest.status !== ServiceRequestStatus.ASSIGNED) {
		throw new Error("Only assigned service requests can be accepted");
	}

	return await prisma.serviceRequest.update({
		where: {
			id: serviceRequest.id,
		},
		data: {
			status: ServiceRequestStatus.ACCEPTED,
			acceptedAt: new Date(),
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			district: true,
			serviceHolder: true,
		},
	});
};

const rejectServiceRequest = async (
	id: string,
	userId: string,
	payload: IRejectServiceRequestPayload,
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
		throw new Error("User is Suspended!");
	}

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			workerId: worker.id,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Assigned service request not found");
	}

	if (serviceRequest.status !== ServiceRequestStatus.ASSIGNED) {
		throw new Error("Only assigned service requests can be rejected");
	}

	const result = await prisma.serviceRequest.update({
		where: {
			id: serviceRequest.id,
		},
		data: {
			status: ServiceRequestStatus.REJECTED,
			rejectionReason: payload.rejectionReason,
			rejectedAt: new Date(),
			workerId: null,
			rejectWorkerId: worker.id,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			district: true,
			serviceHolder: true,
			rejectWorker: true,
		},
	});

	return result;
};

const startServiceRequest = async (id: string, userId: string) => {
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
		throw new Error("User is Suspended!");
	}

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			workerId: worker.id,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Assigned service request not found");
	}

	if (serviceRequest.status !== ServiceRequestStatus.ACCEPTED) {
		throw new Error("Only accepted service requests can be started");
	}

	return await prisma.serviceRequest.update({
		where: {
			id: serviceRequest.id,
		},
		data: {
			status: ServiceRequestStatus.IN_PROGRESS,
			startedAt: new Date(),
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			district: true,
			serviceHolder: true,
		},
	});
};

const completeServiceRequest = async (
	id: string,
	payload: ICompleteServiceRequestPayload,
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
		throw new Error("User is Suspended!");
	}

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}
	const worker = await prisma.worker.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!worker) {
		throw new Error("Worker profile not found");
	}

	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			workerId: worker.id,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Assigned service request not found");
	}

	if (serviceRequest.status !== ServiceRequestStatus.IN_PROGRESS) {
		throw new Error("Only in-progress service requests can be completed");
	}

	return await prisma.serviceRequest.update({
		where: {
			id: serviceRequest.id,
		},
		data: {
			status: ServiceRequestStatus.COMPLETED,
			completedAt: new Date(),
			serviceCharge: payload.serviceCharge,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			district: true,
			serviceHolder: true,
		},
	});
};

export const WorkerServices = {
	getMyWorkerProfile,
	updateMyWorkerProfile,
	getMyAssignedServices,
	getMyAssignedSingleService,
	acceptServiceRequest,
	rejectServiceRequest,
	startServiceRequest,
	completeServiceRequest,
};
