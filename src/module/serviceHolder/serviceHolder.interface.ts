export interface IUpdateServiceHolderPayload {
	businessName?: string;
	phone?: string;
	address?: string;

}

export interface IRejectWorkerApplicationPayload {
	rejectionReason: string;
}