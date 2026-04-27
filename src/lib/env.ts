import 'server-only';
import { z } from 'zod';

const EnvSchema = z.object({
  ETG_USE_MOCKS: z.enum(['true', 'false']).default('true'),
  ETG_BASE_URL: z.string().url().default('https://api-sandbox.worldota.net'),
  ETG_KEY_ID: z.string().default(''),
  ETG_KEY: z.string().default(''),
  ETG_DEFAULT_RESIDENCY: z.string().length(2).default('gb'),
  DATABASE_URL: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
  );
}

export const env = {
  ...parsed.data,
  USE_MOCKS: parsed.data.ETG_USE_MOCKS === 'true',
};
