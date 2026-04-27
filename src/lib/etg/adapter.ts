import 'server-only';
import { env } from '@/lib/env';
import { realClient, type EtgClient } from './client';
import { mockClient } from './mock-client';

export const etg: EtgClient = env.USE_MOCKS ? (mockClient as unknown as EtgClient) : realClient;
