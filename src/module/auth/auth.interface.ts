export interface IRegisterUserPayload {
	name: string;
	email: string;
	password: string;
}

export interface IRegisterVerifyEmailPayload {
	email: string;
	otp: string;
}

export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IGoogleLoginPayload {
	idToken: string
}
