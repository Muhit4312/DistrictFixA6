import { prisma } from "../../lib/prisma";
import { ICreateServiceRequestPayload } from "./serviceRequest.interface";

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

	// const district = await prisma.district.findUnique({
	// 	where: {
	// 		id: payload.districtId,
	// 	},
	// });

    // if (!district) {
	// 	throw new Error("District not found");
	// }
    // if (!district.isActive) {
	// 	throw new Error("This district is currently inactive");
	// }

	const result = await prisma.serviceRequest.create({
		data: { ...payload, customerId: userId },
	});

	return result;
};

export const ServiceRequestServices = {
	createService,
};
