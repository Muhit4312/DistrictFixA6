import path from "path";
import {
	ServiceHolderStatus,
	ServiceRequestStatus,
	ServiceType,
	UserStatus,
	WorkerApplicationStatus,
	WorkerStatus,
	WorkerType,
} from "../../../generated/prisma/enums";
import type {
	ServiceRequestWhereInput,
	WorkerApplicationWhereInput,
	WorkerWhereInput,
} from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type { IServiceRequestQuery } from "../serviceRequest/serviceRequest.interface";
import type { IWorkerApplicationQuery } from "../workerApplication/workerApplication.interface";
import type {
	IAssignServiceRequestPayload,
	IRejectWorkerApplicationPayload,
	IServiceHolderWorkerQuery,
	IUpdateServiceHolderPayload,
} from "./serviceHolder.interface";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import config from "../../config/env.config";

const getMyServiceHolder = async (userId: string) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
		},
		include: {
			district: true,
			user: {
				omit: {
					password: true,
				},
			},
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	return serviceHolder;
};

const updateMyServiceHolder = async (
	userId: string,
	payload: IUpdateServiceHolderPayload,
) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	const updatedServiceHolder = await prisma.serviceHolder.update({
		where: {
			id: serviceHolder.id,
		},
		data: payload,
		include: {
			district: true,
			user: {
				omit: {
					password: true,
				},
			},
		},
	});

	return updatedServiceHolder;
};

const getServiceHolderServices = async (
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

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	const limit = query.limit ? Number(query.limit) : 10;

	const page = query.page ? Number(query.page) : 1;

	const skip = (page - 1) * limit;

	const sortBy =
		query.sortBy && ["createdAt", "serviceName"].includes(query.sortBy)
			? query.sortBy
			: "createdAt";

	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const andConditions: ServiceRequestWhereInput[] = [
		{
			districtId: serviceHolder.districtId,
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

	const [services, totalServicesCount] = await Promise.all([
		prisma.serviceRequest.findMany({
			where: whereCondition,

			take: limit,
			skip,

			orderBy: {
				[sortBy]: sortOrder,
			},

			include: {
				district: true,
				customer: {
					omit: {
						password: true,
					},
				},
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
			total: totalServicesCount,
			totalPage: Math.ceil(totalServicesCount / limit),
		},
	};
};

const getServiceHolderServiceDetails = async (id: string, userId: string) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	const service = await prisma.serviceRequest.findFirst({
		where: {
			id,
			districtId: serviceHolder.districtId,
			deletedAt: null,
		},
		include: {
			district: true,
			customer: {
				omit: {
					password: true,
				},
			},
		},
	});

	if (!service) {
		throw new Error("Service request not found");
	}

	return service;
};

const getWorkerApplicationsByServiceHolder = async (
	query: IWorkerApplicationQuery,
	userId: string,
) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

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
			districtId: serviceHolder.districtId,
		},
	];

	if (query.searchTerm) {
		andConditions.push({
			OR: [
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
				{
					description: {
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
				user: {
					omit: {
						password: true,
					},
				},
				district: true,
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

const getSingleApplicationById = async (id: string, userId: string) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	const application = await prisma.workerApplication.findFirst({
		where: {
			id,
			districtId: serviceHolder.districtId,
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

	if (!application) {
		throw new Error("Worker application not found");
	}

	return application;
};

const approveWorkerApplication = async (id: string, userId: string) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	const application = await prisma.workerApplication.findFirst({
		where: {
			id,
			districtId: serviceHolder.districtId,
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

	if (!application) {
		throw new Error("Worker application not found");
	}

	if (application.status !== WorkerApplicationStatus.PENDING) {
		throw new Error("Only pending applications can be approved");
	}

	const existingWorker = await prisma.worker.findUnique({
		where: {
			userId: application.userId,
		},
	});

	if (existingWorker) {
		throw new Error("User is already a worker");
	}

	const result = await prisma.$transaction(async (tx) => {
		const updatedApplication = await tx.workerApplication.update({
			where: {
				id: application.id,
			},
			data: {
				status: WorkerApplicationStatus.APPROVED,
				reviewedById: userId,
				reviewedAt: new Date(),
				rejectionReason: null,
			},
		});

		await tx.user.update({
			where: {
				id: application.userId,
			},
			data: { role: application.workerType },
		});

		await tx.worker.create({
			data: {
				userId: application.userId,
				districtId: application.districtId,
				workerType: application.workerType,
				phone: application.phone,
				address: application.address,
				experience: application.experience,
				approvedAt: new Date(),
			},
		});

		return updatedApplication;
	});

	try {
		const templatePath = path.join(
			process.cwd(),
			"src/templates/worker-application-approved.ejs",
		);

		const html = await ejs.renderFile(templatePath, {
			name: application.user.name,
			workerType: application.workerType,
			districtName: application.district.name,
		});

		await transporter.sendMail({
			from: `"DistrictFix" <${config.email_sender}>`,
			to: application.user.email,
			subject: "Your DistrictFix Worker Application Has Been Approved",
			html,
		});
	} catch (error) {
		console.error("Failed to send Worker approval email:", error);
	}

	return result;
};

const rejectWorkerApplication = async (
	id: string,
	userId: string,
	payload: IRejectWorkerApplicationPayload,
) => {
	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			deletedAt: null,
			status: "ACTIVE",
		},
	});

	if (!serviceHolder) {
		throw new Error("Service Holder profile not found");
	}

	const application = await prisma.workerApplication.findFirst({
		where: {
			id,
			districtId: serviceHolder.districtId,
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
		throw new Error("Worker application not found");
	}

	if (application.status !== WorkerApplicationStatus.PENDING) {
		throw new Error("Only pending applications can be rejected");
	}

	const rejectedApplication = await prisma.workerApplication.update({
		where: {
			id: application.id,
		},
		data: {
			status: WorkerApplicationStatus.REJECTED,
			rejectionReason: payload.rejectionReason,
			reviewedById: userId,
			reviewedAt: new Date(),
		},
	});
	try {
		const templatePath = path.join(
			process.cwd(),
			"src/templates/worker-application-rejected.ejs",
		);

		const html = await ejs.renderFile(templatePath, {
			name: application.user.name,
			workerType: application.workerType,
			districtName: application.district.name,
			rejectionReason: payload.rejectionReason,
		});

		await transporter.sendMail({
			from: `"DistrictFix" <${config.email_sender}>`,
			to: application.user.email,
			subject: "Update on Your DistrictFix Worker Application",
			html,
		});
	} catch (error) {
		console.error("Failed to send Worker rejection email:", error);
	}

	return rejectedApplication;
};

const getMyDistrictWorkers = async (
	query: IServiceHolderWorkerQuery,
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

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			status: "ACTIVE",
			deletedAt: null,
		},
	});

	if (!serviceHolder) {
		throw new Error("Active service holder profile not found");
	}

	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

	const page = Math.max(Number(query.page) || 1, 1);

	const skip = (page - 1) * limit;

	const sortBy =
		query.sortBy &&
		["createdAt", "updatedAt", "experience"].includes(query.sortBy)
			? query.sortBy
			: "createdAt";

	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const andConditions: WorkerWhereInput[] = [
		{
			districtId: serviceHolder.districtId,
		},
		{
			status: WorkerStatus.ACTIVE,
		},
		{
			deletedAt: null,
		},
	];

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
				{
					experience: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
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

	const [workers, total] = await Promise.all([
		prisma.worker.findMany({
			where: whereCondition,
			take: limit,
			skip,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				user: {
					omit: {
						password: true,
					},
				},
				district: true,
			},
		}),

		prisma.worker.count({
			where: whereCondition,
		}),
	]);

	return {
		data: workers,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const getMyDistrictSingleWorker = async (workerId: string, userId: string) => {
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

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			status: ServiceHolderStatus.ACTIVE,
			deletedAt: null,
		},
	});

	if (!serviceHolder) {
		throw new Error("Active service holder profile not found");
	}

	const worker = await prisma.worker.findFirst({
		where: {
			id: workerId,
			districtId: serviceHolder.districtId,
			status: WorkerStatus.ACTIVE,
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
		throw new Error("Worker not found in your district");
	}

	return worker;
};

const assignServiceRequest = async (
	serviceRequestId: string,
	payload: IAssignServiceRequestPayload,
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

	if (user.deletedAt || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted!");
	}

	const serviceHolder = await prisma.serviceHolder.findFirst({
		where: {
			userId,
			status: ServiceHolderStatus.ACTIVE,
			deletedAt: null,
		},
	});

	if (!serviceHolder) {
		throw new Error("Active service holder profile not found");
	}

	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id: serviceRequestId,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Service request not found");
	}

	if (serviceRequest.districtId !== serviceHolder.districtId) {
		throw new Error("You can only assign requests from your own district");
	}

	if (
		serviceRequest.status !== ServiceRequestStatus.PENDING &&
		serviceRequest.status !== ServiceRequestStatus.REJECTED
	) {
		throw new Error(
			"Only pending or rejected service requests can be assigned",
		);
	}

	const worker = await prisma.worker.findFirst({
		where: {
			id: payload.workerId,
			districtId: serviceHolder.districtId,
			status: WorkerStatus.ACTIVE,
			deletedAt: null,
		},
	});

	if (!worker) {
		throw new Error("Active worker not found in your district");
	}

	const requiredWorkerType =
		serviceRequest.serviceType === ServiceType.PLUMBING
			? WorkerType.PLUMBER
			: WorkerType.ELECTRICIAN;

	if (worker.workerType !== requiredWorkerType) {
		throw new Error(
			`This service requires a ${requiredWorkerType.toLowerCase()} worker`,
		);
	}

	const updatedServiceRequest = await prisma.serviceRequest.update({
		where: {
			id: serviceRequestId,
		},
		data: {
			workerId: worker.id,
			status: ServiceRequestStatus.ASSIGNED,
			assignedAt: new Date(),
			rejectWorkerId: null,
			rejectionReason: null,
			rejectedAt: null,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			district: true,
			serviceHolder: true,
			worker: true,
		},
	});

	return updatedServiceRequest;
};

export const ServiceHolderServices = {
	getMyServiceHolder,
	updateMyServiceHolder,
	getServiceHolderServices,
	getServiceHolderServiceDetails,
	getWorkerApplicationsByServiceHolder,
	getSingleApplicationById,
	approveWorkerApplication,
	rejectWorkerApplication,
	getMyDistrictWorkers,
	getMyDistrictSingleWorker,
	assignServiceRequest,
};
