import { timestamp, uuid } from 'drizzle-orm/pg-core';

// Kolom bersama untuk semua tabel. Tabel baru memakai helper ini, bukan menulis ulang definisinya.

// UUID yang dibuat database (`gen_random_uuid()`).
export const id = () => uuid('id').primaryKey().defaultRandom();

// Semua timestamp bertipe timestamptz dan dibaca sebagai `Date` (UTC).
export const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

export const createdAt = () => timestamptz('created_at').notNull().defaultNow();

// Diperbarui otomatis oleh Drizzle pada setiap `update()`; SQL mentah harus mengisinya sendiri.
export const updatedAt = () =>
  timestamptz('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
