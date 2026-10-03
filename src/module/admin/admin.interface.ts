import type { ApplicationStatus } from "../../../generated/prisma/enums";

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
