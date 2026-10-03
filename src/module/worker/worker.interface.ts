import type {
	ServiceRequestStatus,
	ServiceType,
	WorkerStatus,
} from "../../../generated/prisma/enums";

export interface IUpdateWorkerProfilePayload {
	businessName?: string;
	phone?: string;
	address?: string;
	experience?: string;
	bio?: string;
}

export interface IRejectServiceRequestPayload {
	rejectionReason: string;
}

export interface IWorkerFilterRequest {
	searchTerm?: string;
	status?: WorkerStatus;
	serviceType?: ServiceType;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: string;
}

export interface IServiceRequestQuery {
	limit?: string;
	page?: string;
	sortBy?: string;
	sortOrder?: string;
	searchTerm?: string;
	status?: ServiceRequestStatus;
	serviceType?: ServiceType;
}

export interface ICompleteServiceRequestPayload {
	serviceCharge: number;
}
