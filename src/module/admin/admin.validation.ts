import z from "zod";

const RejectServiceHolderApplicationZodSchema = z.object({
	rejectionReason: z
		.string("Rejection reason must be a string")
		.trim()
		.min(5, "Rejection reason must be at least 5 characters")
		.max(500, "Rejection reason must not exceed 500 characters"),
});


export const ServiceHolderApplicationValidations = {
    RejectServiceHolderApplicationZodSchema
}