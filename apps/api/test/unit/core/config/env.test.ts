import { describe, expect, it } from 'vitest';
import { EnvError, loadEnv } from '../../../../src/core/config/env.js';

const base = { CORS_ORIGINS: 'http://localhost:8081' };

describe('loadEnv', () => {
  it('applies defaults', () => {
    expect(loadEnv(base)).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      CORS_ORIGINS: ['http://localhost:8081'],
    });
  });

  it('coerces PORT from a string', () => {
    expect(loadEnv({ ...base, PORT: '8080' }).PORT).toBe(8080);
  });

  it('splits CORS_ORIGINS on commas, trims, and normalizes to origins', () => {
    const env = loadEnv({ CORS_ORIGINS: ' http://localhost:8081 , https://app.example.com/ ,' });

    expect(env.CORS_ORIGINS).toEqual(['http://localhost:8081', 'https://app.example.com']);
  });

  it('throws EnvError naming a missing required variable', () => {
    expect(() => loadEnv({})).toThrow(EnvError);
    expect(() => loadEnv({})).toThrow(/CORS_ORIGINS/);
  });

  it('throws naming every invalid variable', () => {
    const invalid = { CORS_ORIGINS: 'not-a-url', PORT: '70000', LOG_LEVEL: 'loud' };

    let message = '';
    try {
      loadEnv(invalid);
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain('CORS_ORIGINS');
    expect(message).toContain('PORT');
    expect(message).toContain('LOG_LEVEL');
  });

  it('rejects an empty CORS_ORIGINS list', () => {
    expect(() => loadEnv({ CORS_ORIGINS: ' , ' })).toThrow(/CORS_ORIGINS/);
  });
});
