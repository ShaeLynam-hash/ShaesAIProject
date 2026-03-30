import { z } from "zod";
import { MemberRole } from "@prisma/client";

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(MemberRole),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
