import { z } from "zod";
import { IsoDateTimeSchema } from "../schemas";

export const GenerationInputRefSchema = z.object({
  path: z.string().min(1),
  sha256: z.string().min(1).nullable(),
  present: z.boolean(),
});

export const GenerationManifestSchema = z.object({
  generatedAt: IsoDateTimeSchema,
  methodologyVersion: z.string().min(1),
  teamCount: z.literal(30),
  inputs: z.object({
    editorialSnapshot: GenerationInputRefSchema,
    coreStats: GenerationInputRefSchema.extend({
      sourceName: z.string().nullable(),
      asOf: IsoDateTimeSchema.nullable(),
      season: z.string().nullable(),
    }),
    yunoballEnrichment: GenerationInputRefSchema.extend({
      status: z.enum(["applied", "skipped", "absent"]),
      exportVersion: z.string().nullable(),
    }),
  }),
  protectedEditorialFields: z.array(z.string().min(1)).min(1),
  automatedFieldsApplied: z.array(z.string().min(1)).min(1),
});

export type GenerationManifest = z.infer<typeof GenerationManifestSchema>;
export type GenerationInputRef = z.infer<typeof GenerationInputRefSchema>;

/** Editorial fields automation must never overwrite. */
export const PROTECTED_EDITORIAL_FIELDS = [
  "competitiveState",
  "summary",
  "tankScore",
  "scoreBand",
  "confidence",
  "teamStrength",
  "draftIncentive",
  "competitiveIntent",
  "components",
  "pickContext",
  "evidenceIds",
  "identity",
  "mode",
  "season",
  "methodologyVersion",
] as const;

/** Team-level factual fields automation may refresh. */
export const AUTOMATED_TEAM_FIELDS = ["record", "recentForm", "sourceRetrievedAt"] as const;
