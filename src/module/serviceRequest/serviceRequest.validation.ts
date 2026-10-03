import z from "zod";
import {
	ServiceRequestStatus,
	ServiceType,
} from "../../../generated/prisma/enums";

const CreateServiceRequestZodSchema = z.object({
	serviceType: z.enum(ServiceType),

	serviceName: z
		.string("Service name must be a string")
		.trim()
		.min(3, "Service name must be at least 3 characters")
		.max(100, "Service name cannot exceed 100 characters"),

	description: z
		.string("Description must be a string")
		.trim()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description cannot exceed 1000 characters"),

	address: z
		.string("Address must be a string")
		.trim()
		.min(5, "Address must be at least 5 characters")
		.max(300, "Address cannot exceed 300 characters"),

	phone: z
		.string("Phone number must be a string")
		.trim()
		.regex(
			/^(?:\+8801|01)[3-9]\d{8}$/,
			"Please provide a valid Bangladeshi phone number",
		)
		.optional(),

	districtId: z
		.string("District ID must be a string")
		.trim()
		.min(1, "District ID is required"),
});

const UpdateServiceRequestZodSchema = z
	.object({
		serviceType: z.enum(ServiceType).optional(),

		serviceName: z
			.string("Service name must be a string")
			.trim()
			.min(3, "Service name must be at least 3 characters")
			.max(100, "Service name cannot exceed 100 characters")
			.optional(),

		description: z
			.string("Description must be a string")
			.trim()
			.min(10, "Description must be at least 10 characters")
			.max(1000, "Description cannot exceed 1000 characters")
			.optional(),

		address: z
			.string("Address must be a string")
			.trim()
			.min(5, "Address must be at least 5 characters")
			.max(300, "Address cannot exceed 300 characters")
			.optional(),

		phone: z
			.string("Phone number must be a string")
			.trim()
			.regex(
				/^(?:\+8801|01)[3-9]\d{8}$/,
				"Please provide a valid Bangladeshi phone number",
			)
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required for update",
	});

const CancelServiceRequestZodSchema = z.object({
	cancellationReason: z
		.string("Cancellation reason must be a string")
		.trim()
		.min(5, "Cancellation reason must be at least 5 characters")
		.max(500, "Cancellation reason cannot exceed 500 characters"),
});

const ServiceRequestQueryZodSchema = z.object({
	searchTerm: z.string().trim().optional(),

	status: z.enum(ServiceRequestStatus).optional(),

	serviceType: z.enum(ServiceType).optional(),

	page: z.string().regex(/^\d+$/, "Page must be a valid number").optional(),

	limit: z.string().regex(/^\d+$/, "Limit must be a valid number").optional(),

	sortBy: z.enum(["createdAt", "serviceName"]).optional(),

	sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const ServiceRequestValidation = {
	CreateServiceRequestZodSchema,
	UpdateServiceRequestZodSchema,
	CancelServiceRequestZodSchema,
	ServiceRequestQueryZodSchema,
};
