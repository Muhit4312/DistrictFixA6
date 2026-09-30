import z from "zod";

const UpdateServiceHolderZodSchema = z
	.object({
		businessName: z
			.string("Business name must be a string")
			.trim()
			.min(3, "Business name must be at least 3 characters")
			.max(150, "Business name cannot exceed 150 characters")
			.optional(),

		phone: z
			.string("Phone number must be a string")
			.trim()
			.regex(
				/^(?:\+8801|01)[3-9]\d{8}$/,
				"Please provide a valid Bangladeshi phone number",
			)
			.optional(),

		address: z
			.string("Address must be a string")
			.trim()
			.min(5, "Address must be at least 5 characters")
			.max(300, "Address cannot exceed 300 characters")
			.optional(),

	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required for update",
	});

export const ServiceHolderValidations = {
	UpdateServiceHolderZodSchema,
};