import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const apiRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('server startup', () => {
  it('exits with a message naming the missing env variable', () => {
    const { CORS_ORIGINS: _omitted, ...env } = process.env;

    const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
      cwd: apiRoot,
      env,
      encoding: 'utf8',
      timeout: 20_000,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid environment variables');
    expect(result.stderr).toContain('CORS_ORIGINS');
  });
});
