export interface ICreateDistrictPayload {
	name: string;
	division: string;
	code: string;
}

export interface IUpdateDistrictPayload {
	name?: string;
	division?: string;
	code?: string;
	isActive?: boolean;
}