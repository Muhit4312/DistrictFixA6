import { prisma } from "../../lib/prisma";
import { ICreateDistrictPayload } from "./district.interface";


const createDistrict = async (payload: ICreateDistrictPayload) => {
	const { name, division, code } = payload;

	const existingDistrict = await prisma.district.findFirst({
		where: {
			OR: [{ name }, { code }],
		},
	});

	if (existingDistrict) {
		if (existingDistrict.name === name) {
			throw new Error("District already exists");
		}

		if (existingDistrict.code === code) {
			throw new Error("District code already exists");
		}
	}

	const result = await prisma.district.create({
		data: {
			name,
			division,
			code,
		},
	});

	return result;
};

// const getAllDistricts = async () => {
// 	const result = await prisma.district.findMany({
// 		orderBy: {
// 			name: "asc",
// 		},
// 	});

// 	return result;
// };

// const getSingleDistrict = async (id: string) => {
// 	const result = await prisma.district.findUnique({
// 		where: {
// 			id,
// 		},
// 	});

// 	if (!result) {
// 		throw new Error("District not found");
// 	}

// 	return result;
// };

// const updateDistrict = async (
// 	id: string,
// 	payload: IUpdateDistrictPayload,
// ) => {
// 	const district = await prisma.district.findUnique({
// 		where: {
// 			id,
// 		},
// 	});

// 	if (!district) {
// 		throw new Error("District not found");
// 	}

// 	if (payload.name || payload.code) {
// 		const existingDistrict = await prisma.district.findFirst({
// 			where: {
// 				OR: [
// 					payload.name ? { name: payload.name } : undefined,
// 					payload.code ? { code: payload.code } : undefined,
// 				].filter(Boolean),
// 				NOT: {
// 					id,
// 				},
// 			},
// 		});

// 		if (existingDistrict) {
// 			if (payload.name === existingDistrict.name) {
// 				throw new Error("District name already exists");
// 			}

// 			if (payload.code === existingDistrict.code) {
// 				throw new Error("District code already exists");
// 			}
// 		}
// 	}

// 	const result = await prisma.district.update({
// 		where: {
// 			id,
// 		},
// 		data: payload,
// 	});

// 	return result;
// };

// const deleteDistrict = async (id: string) => {
// 	const district = await prisma.district.findUnique({
// 		where: {
// 			id,
// 		},
// 	});

// 	if (!district) {
// 		throw new Error("District not found");
// 	}

// 	const serviceRequestCount = await prisma.serviceRequest.count({
// 		where: {
// 			districtId: id,
// 		},
// 	});

// 	if (serviceRequestCount > 0) {
// 		throw new Error(
// 			"Cannot delete district because service requests exist for this district",
// 		);
// 	}

// 	await prisma.district.delete({
// 		where: {
// 			id,
// 		},
// 	});

// 	return null;
// };

export const DistrictService = {
	createDistrict,
	// getAllDistricts,
	// getSingleDistrict,
	// updateDistrict,
	// deleteDistrict,
};