import { ServiceType } from "../../../generated/prisma/enums";

export interface ICreateServiceRequestPayload {
	serviceType: ServiceType;
	serviceName: string;
	description: string;
	address: string;
	phone?: string;
	districtId: string;
}