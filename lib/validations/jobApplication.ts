import { z } from "zod";

/**
 * An optional URL field: an empty string is treated as "not provided"
 * rather than failing URL validation.
 */
const optionalUrl = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z
    .string()
    .trim()
    .max(2000, "Job URL is too long")
    .url("Enter a valid URL")
    .optional(),
);

const jobApplicationFields = {
  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(200, "Company name is too long"),
  position: z
    .string()
    .trim()
    .min(1, "Position is required")
    .max(200, "Position is too long"),
  location: z.string().trim().max(200, "Location is too long").optional(),
  notes: z.string().trim().max(5000, "Notes are too long").optional(),
  salary: z.string().trim().max(100, "Salary is too long").optional(),
  jobUrl: optionalUrl,
  tags: z.string().trim().max(500, "Tags are too long").optional(),
  description: z.string().trim().max(5000, "Description is too long").optional(),
};

export const createJobApplicationSchema = z.object({
  ...jobApplicationFields,
  columnId: z.string().trim().min(1, "Column is required"),
  boardId: z.string().trim().min(1, "Board is required"),
});

export const updateJobApplicationSchema = z
  .object({
    ...jobApplicationFields,
    columnId: z.string().trim().min(1, "Column is required").optional(),
    targetIndex: z.number().int().min(0).optional(),
  })
  .partial();

export type CreateJobApplicationInput = z.infer<
  typeof createJobApplicationSchema
>;
export type UpdateJobApplicationInput = z.infer<
  typeof updateJobApplicationSchema
>;

/** Flattens a ZodError into a simple field -> messages map for the UI. */
export function flattenFieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
