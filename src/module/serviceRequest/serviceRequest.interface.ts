import { ServiceRequestStatus, ServiceType } from "../../../generated/prisma/enums";

export interface ICreateServiceRequestPayload {
	serviceType: ServiceType;
	serviceName: string;
	description: string;
	address: string;
	phone?: string;
	districtId: string;
}

export interface IServiceRequestQuery {
	searchTerm?: string;
	status?: ServiceRequestStatus;
	serviceType?: ServiceType;
	page?: string;
	limit?: string;
	sortBy?: string;
	sortOrder?: string;
}

export interface IUpdateServiceRequestPayload {
	serviceType?: ServiceType;
	serviceName?: string;
	description?: string;
	address?: string;
	phone?: string;
}

export interface ICancelServiceRequestPayload {
	cancellationReason: string;
}