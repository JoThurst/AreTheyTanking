import { z } from "zod";
import { IsoDateTimeSchema } from "../schemas";

export const PipelineFailureSchema = z.object({
  source: z.string().min(1),
  step: z.enum([
    "retrieve",
    "cache",
    "map",
    "normalize",
    "validate",
    "merge",
    "publish",
    "unknown",
  ]),
  message: z.string().min(1),
});

export const PipelineStatusSchema = z.object({
  status: z.enum(["ok", "failed"]),
  stale: z.boolean(),
  lastSuccessfulUpdateAt: IsoDateTimeSchema,
  lastAttemptAt: IsoDateTimeSchema,
  failure: PipelineFailureSchema.nullable(),
});

export type PipelineFailure = z.infer<typeof PipelineFailureSchema>;
export type PipelineStatus = z.infer<typeof PipelineStatusSchema>;

/**
 * Redact likely secrets from failure messages before writing public status files.
 */
export function sanitizeFailureMessage(message: string): string {
  return message
    .replace(/(postgres|mysql|mongodb|redis):\/\/[^\s"']+/gi, "[redacted-connection]")
    .replace(
      /\b(connectionString|DATABASE_URL|API_KEY|TOKEN|PASSWORD|SECRET)\s*[=:]\s*\S+/gi,
      "$1=[redacted]",
    )
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]")
    .replace(/[A-Za-z]:\\[^\s"']+/g, "[redacted-path]")
    .replace(/\/(?:home|Users)\/[^\s"']+/g, "[redacted-path]");
}
