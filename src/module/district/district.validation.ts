import z from "zod";

const CreateDistrictZodSchema = z.object({
	name: z
		.string("District name must be a string")
		.trim()
		.min(3, "District name must be at least 3 characters")
		.max(100, "District name cannot exceed 100 characters"),

	division: z
		.string("Division must be a string")
		.trim()
		.min(3, "Division must be at least 3 characters")
		.max(100, "Division cannot exceed 100 characters"),

	code: z
		.string("District code must be a string")
		.trim()
		.min(2, "District code must be at least 2 characters")
		.max(10, "District code cannot exceed 10 characters")
		.toUpperCase(),
});

const UpdateDistrictZodSchema = z
	.object({
		name: z
			.string("District name must be a string")
			.trim()
			.min(3, "District name must be at least 3 characters")
			.max(100, "District name cannot exceed 100 characters")
			.optional(),

		division: z
			.string("Division must be a string")
			.trim()
			.min(3, "Division must be at least 3 characters")
			.max(100, "Division cannot exceed 100 characters")
			.optional(),

		code: z
			.string("District code must be a string")
			.trim()
			.min(2, "District code must be at least 2 characters")
			.max(10, "District code cannot exceed 10 characters")
			.toUpperCase()
			.optional(),

		isActive: z.boolean().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required for update",
	});

export const DistrictValidation = {
	CreateDistrictZodSchema,
	UpdateDistrictZodSchema,
};
