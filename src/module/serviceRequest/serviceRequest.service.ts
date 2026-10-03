import { ServiceRequestStatus, UserStatus } from "../../../generated/prisma/enums";
import { ServiceRequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
	ICancelServiceRequestPayload,
	ICreateServiceRequestPayload,
	IServiceRequestQuery,
	IUpdateServiceRequestPayload,
} from "./serviceRequest.interface";

const createService = async (
	payload: ICreateServiceRequestPayload,
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
	if (user.role !== "CUSTOMER") {
		throw new Error("Customer can only create service request!");
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

	const result = await prisma.serviceRequest.create({
		data: {
			serviceType: payload.serviceType,
			serviceName: payload.serviceName,
			description: payload.description,
			address: payload.address,
			phone: payload.phone,
			districtId: payload.districtId,
			customerId: userId,
		},
	});

	return result;
};

const getMyServices = async (query: IServiceRequestQuery, userId: string) => {
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
			customerId: userId,
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
				payment: true,
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

const getSingleService = async (id: string, userId: string) => {
	const result = await prisma.serviceRequest.findFirst({
		where: {
			id,
			customerId: userId,
			deletedAt: null,
		},
		include: {
			district: true,
			payment: true
		},
	});

	if (!result) {
		throw new Error("Service request not found");
	}

	return result;
};



const updateService = async (
	id: string,
	payload: IUpdateServiceRequestPayload,
	userId: string,
) => {
	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			customerId: userId,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Service request not found");
	}

	if (serviceRequest.status !== "PENDING") {
		throw new Error(
			"Only pending service requests can be updated",
		);
	}

	const result = await prisma.serviceRequest.update({
		where: {
			id: serviceRequest.id,
		},
		data: payload,
	});

	return result;
};

const cancelService = async (
	id: string,
	payload: ICancelServiceRequestPayload,
	userId: string,
) => {
	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			customerId: userId,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Service request not found");
	}

	if (
		serviceRequest.status ===  ServiceRequestStatus.IN_PROGRESS||
		serviceRequest.status === ServiceRequestStatus.COMPLETED ||
		serviceRequest.status === ServiceRequestStatus.CANCELLED
	) {
		throw new Error(
			"This service request cannot be cancelled",
		);
	}

	const result = await prisma.serviceRequest.update({
		where: {
			id,
		},
		data: {
			status:ServiceRequestStatus.CANCELLED,
			cancellationReason: payload.cancellationReason,
			cancelledAt: new Date(),
		},
	});

	return result;
};

const deleteService = async (
	id: string,
	userId: string,
) => {
	const serviceRequest = await prisma.serviceRequest.findFirst({
		where: {
			id,
			customerId: userId,
			deletedAt: null,
		},
	});

	if (!serviceRequest) {
		throw new Error("Service request not found");
	}

	if (serviceRequest.status !== "PENDING") {
		throw new Error(
			"Only pending service requests can be deleted",
		);
	}

	await prisma.serviceRequest.update({
		where: {
			id,
		},
		data: {
			deletedAt: new Date(),
		},
	});

	return null;
};
export const ServiceRequestServices = {
	createService,
	getMyServices,
	getSingleService,
	updateService,
	cancelService,
	deleteService,
};
