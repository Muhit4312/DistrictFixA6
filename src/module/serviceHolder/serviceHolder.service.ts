import { prisma } from "../../lib/prisma";
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

export const ServiceHolderServices = {
	getMyServiceHolder,
	updateMyServiceHolder,
};