import { z } from "zod";

export const googleAuthSchema = z
  .object({
    idToken: z.string().min(1, "ID token is required"),
  })
  .strict();

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
