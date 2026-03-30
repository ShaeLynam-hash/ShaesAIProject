import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  timezone: z.string().default("America/New_York"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoUrl: z.string().optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
