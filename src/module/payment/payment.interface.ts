import { Role } from "../../../generated/prisma/enums";

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

 export interface IBkashCallbackQuery {
	paymentID?: string;
	status?: string;
	signature?: string;
	apiVersion?: string;
}