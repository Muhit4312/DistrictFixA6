import type { ApplicationStatus, Role, UserStatus } from "../../../generated/prisma/enums";

export interface IRejectServiceHolderApplicationPayload {
	rejectionReason: string;
}

export interface IServiceHolderApplicationQuery {
	searchTerm?: string;
	status?: ApplicationStatus;
	districtId?: string;
	page?: string;
	limit?: string;
	sortOrder?: "asc" | "desc";
}


export interface IGetAllUsersQuery {
	page?: string;
	limit?: string;
	searchTerm?: string;
	role?: Role;
	status?: UserStatus;
	sortOrder?: "asc" | "desc";
}

export type UpdateUserPayload = {
	name?: string;
	phone?: string | null;
};

export type UpdateUserStatusPayload = {
	status: "ACTIVE" | "BLOCKED";
};
