// Spike T-003: satu route @hono/zod-openapi dengan skema error PRD bagian 5.
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { ZodError } from 'zod';

export const ErrorCode = z
  .enum([
    'BAD_REQUEST',
    'UNAUTHENTICATED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'VALIDATION_ERROR',
    'INTERNAL_ERROR',
  ])
  .openapi('ErrorCode');

const ErrorIssue = z
  .object({
    code: z.string().openapi({ example: 'too_small' }),
    message: z.string(),
  })
  .openapi('ErrorIssue');

// Objek dalam diberi nama sendiri; tanpa nama, swagger_parser membuat kelas `Error`
// yang menutupi `Error` bawaan dart:core.
const ApiError = z
  .object({
    code: ErrorCode,
    message: z.string(),
    details: z.record(z.string(), z.array(ErrorIssue)).optional(),
  })
  .openapi('ApiError');

const ErrorBody = z.object({ error: ApiError }).openapi('ErrorBody');

const Note = z
  .object({
    id: z.uuid(),
    title: z.string(),
    body: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('Note');

const CreateNoteBody = z
  .object({
    title: z.string().min(1).max(120),
    body: z.string().max(5000).optional(),
  })
  .openapi('CreateNoteBody');

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: ErrorBody } },
});

const createNote = createRoute({
  method: 'post',
  path: '/v1/notes',
  operationId: 'createNote',
  tags: ['notes'],
  request: {
    body: { required: true, content: { 'application/json': { schema: CreateNoteBody } } },
  },
  responses: {
    201: { description: 'Note dibuat', content: { 'application/json': { schema: Note } } },
    401: errorResponse('Token tidak ada atau tidak valid'),
    422: errorResponse('Validasi gagal'),
    500: errorResponse('Error tak terduga'),
  },
});

// Bentuk details bagian 5: path digabung titik, `_root` tanpa path, `required` untuk field hilang.
function toDetails(error: ZodError) {
  const details: Record<string, { code: string; message: string }[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length === 0 ? '_root' : issue.path.join('.');
    const missing = issue.code === 'invalid_type' && issue.input === undefined;
    const entry = {
      code: missing ? 'required' : issue.code,
      message: missing ? 'Required' : issue.message,
    };
    details[key] = [...(details[key] ?? []), entry];
  }
  return details;
}

export const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR' as const,
            message: 'Request validation failed',
            details: toDetails(result.error),
          },
        },
        422,
      );
    }
  },
});

app.openapi(createNote, (c) => {
  const input = c.req.valid('json');
  const now = '2026-09-30T00:00:00.000Z';
  return c.json(
    {
      id: '0b7e5f7c-9a8e-4c1a-bb7e-2f4f9f0c1d2e',
      title: input.title,
      body: input.body ?? '',
      createdAt: now,
      updatedAt: now,
    },
    201,
  );
});

export function openApiDocument() {
  return app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: { title: 'Spike Contract API', version: '0.0.0' },
  });
}
