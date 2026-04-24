import { z } from "zod";

export const ideaSchema = z.object({
  product: z.object({
    name: z.string(),
    audience: z.string(),
    hook: z.string(),
  }),
});
