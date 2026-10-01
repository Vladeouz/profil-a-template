import type { Logger } from 'pino';

// Variabel per request yang tersedia lewat `c.var`.
export type AppEnv = {
  Variables: {
    requestId: string;
    log: Logger;
  };
};
