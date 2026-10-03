import type { WorkerType } from "../../../generated/prisma/enums";

export interface IUpdateServiceHolderPayload {
	businessName?: string;
	phone?: string;
	address?: string;
}

export interface IRejectWorkerApplicationPayload {
	rejectionReason: string;
}

export interface IServiceHolderWorkerQuery {
	limit?: string;
	page?: string;
	sortBy?: string;
	sortOrder?: string;
	searchTerm?: string;
	workerType?: WorkerType;
}

export interface IAssignServiceRequestPayload {
	workerId: string;
}
