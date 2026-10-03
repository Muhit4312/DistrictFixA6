import z from "zod";

const CreateServiceHolderApplicationZodSchema = z.object({
	districtId: z
		.string("District ID must be a string")
		.trim()
		.min(1, "District ID is required"),

	businessName: z
		.string("Business name must be a string")
		.trim()
		.min(3, "Business name must be at least 3 characters")
		.max(150, "Business name cannot exceed 150 characters"),

	phone: z
		.string("Phone number must be a string")
		.trim()
		.regex(
			/^(?:\+8801|01)[3-9]\d{8}$/,
			"Please provide a valid Bangladeshi phone number",
		),

	address: z
		.string("Address must be a string")
		.trim()
		.min(5, "Address must be at least 5 characters")
		.max(300, "Address cannot exceed 300 characters"),

	description: z
		.string("Description must be a string")
		.trim()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description cannot exceed 1000 characters"),
});

const RejectServiceHolderApplicationZodSchema = z.object({
	rejectionReason: z
		.string("Rejection reason must be a string")
		.trim()
		.min(5, "Rejection reason must be at least 5 characters")
		.max(500, "Rejection reason cannot exceed 500 characters"),
});

export const ServiceHolderApplicationValidation = {
	CreateServiceHolderApplicationZodSchema,
	RejectServiceHolderApplicationZodSchema,
};
