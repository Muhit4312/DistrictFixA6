import z from "zod";

const CustomerRegistrationZodSchema = z.object({
	name: z
		.string("Not A String")
		.trim()
		.min(3, "Name must be at least 3 characters")
		.max(10, "Name cannot exceed 10 characters"),

	email: z.email("Not a valid email").trim().toLowerCase(),

	password: z
		.string("Not a string.")
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain an uppercase letter")
		.regex(/[a-z]/, "Password must contain a lowercase letter")
		.regex(/[0-9]/, "Password must contain a number")
		.regex(/[^A-Za-z0-9]/, "Password must contain a special character"),

	profile: z
		.object({
			contactNumber: z.string().optional(),
		})
		.optional(),
});

const loginZodSchema = z.object({
	email : z.email(),
	password: z
		.string("Not a string.")
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain an uppercase letter")
		.regex(/[a-z]/, "Password must contain a lowercase letter")
		.regex(/[0-9]/, "Password must contain a number")
		.regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
})

const CustomerVerifyZodSchema = z.object({
	email : z.email(),
	otp: z.string().length(6)

})

const forgotPasswordZodSchema = z.object({
	email : z.email(),
	
})

export const UserValidation = {
	CustomerRegistrationZodSchema,
    loginZodSchema,
    CustomerVerifyZodSchema,
	forgotPasswordZodSchema
};




