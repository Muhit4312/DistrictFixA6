import { WorkerApplicationStatus, WorkerType } from "../../../generated/prisma/enums";

export interface ICreateWorkerApplicationPayload {
	workerType: WorkerType;
	phone: string;
	address: string;
	experience?: string;
	description?: string;
	districtId: string;
}

export interface IWorkerApplicationQuery {
	searchTerm?: string;
	status?: WorkerApplicationStatus;
	workerType?: WorkerType;
	page?: string;
	limit?: string;
	sortBy?: "createdAt" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

export interface IUpdateWorkerApplicationPayload {
	workerType?: WorkerType;
	phone?: string;
	address?: string;
	experience?: string;
	bio?: string;
}