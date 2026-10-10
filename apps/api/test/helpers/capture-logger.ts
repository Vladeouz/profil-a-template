import { Writable } from 'node:stream';
import type { LevelWithSilent } from 'pino';
import { createLogger } from '../../src/core/logger.js';

// Logger yang menampung setiap baris JSON di `lines`; `raw()` untuk memeriksa bahwa nilai
// sensitif tidak muncul di mana pun. Berikan `logger` ke `createTestApp({ logger })`.
export function captureLogger(level: LevelWithSilent = 'info') {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) lines.push(JSON.parse(line));
      callback();
    },
  });
  // Stream sinkron dari Writable: pino menulis langsung, tanpa buffer async.
  const logger = createLogger({ level }, stream);
  return { logger, lines, raw: () => JSON.stringify(lines) };
}
