import { UserStatus } from "../../../generated/prisma/enums";
import { ServiceRequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IServiceRequestQuery } from "../serviceRequest/serviceRequest.interface";
import { IUpdateServiceHolderPayload } from "./serviceHolder.interface";

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

	const updatedServiceHolder =
		await prisma.serviceHolder.update({
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

const getServiceHolderServiceDetails = async (
	id: string,
	userId: string,
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



export const ServiceHolderServices = {
	getMyServiceHolder,
	updateMyServiceHolder,
	getServiceHolderServices,
	getServiceHolderServiceDetails
};