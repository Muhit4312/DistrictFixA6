import z from "zod";

const UpdateWorkerProfileZodSchema = z
	.object({
		businessName: z
			.string("Business name must be a string")
			.trim()
			.min(
				2,
				"Business name must be at least 2 characters",
			)
			.max(
				150,
				"Business name cannot exceed 150 characters",
			)
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
			.max(
				300,
				"Address cannot exceed 300 characters",
			)
			.optional(),

		experience: z
			.string("Experience must be a string")
			.trim()
			.max(
				100,
				"Experience cannot exceed 100 characters",
			)
			.optional(),

		bio: z
			.string("Bio must be a string")
			.trim()
			.min(10, "Bio must be at least 10 characters")
			.max(
				1000,
				"Bio cannot exceed 1000 characters",
			)
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required for update",
	});

const RejectServiceRequestZodSchema = z.object({
	rejectionReason: z
		.string("Rejection reason must be a string")
		.trim()
		.min(
			5,
			"Rejection reason must be at least 5 characters",
		)
		.max(
			500,
			"Rejection reason cannot exceed 500 characters",
		),
});

export const CompleteServiceRequestZodSchema = z.object({
	serviceCharge: z
		.number()
		.positive("Service charge must be greater than 0"),
});

export const WorkerValidations = {
	UpdateWorkerProfileZodSchema,
	RejectServiceRequestZodSchema,
	CompleteServiceRequestZodSchema
};