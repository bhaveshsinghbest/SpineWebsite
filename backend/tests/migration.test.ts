// The Admin Panel migration converts existing data correctly: a database created by the first migration,
// holding enquiries and applications with the old statuses, is upgraded with the later migrations.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { MIGRATIONS_DIR } from '../src/config/db.ts';

const statements = (file: string) =>
  fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);

describe('migration 0001 (Admin Panel)', () => {
  it('maps old statuses, keeps employment types and sets up the single administrator', async () => {
    const pg = new PGlite('memory://');
    for (const st of statements('0000_initial_schema.sql')) await pg.exec(st);

    await pg.exec(`
      INSERT INTO admin_users (email, name, password_hash, role) VALUES ('a@x.in', 'A', 'h', 'admin'), ('e@x.in', 'E', 'h', 'editor');
      INSERT INTO media (kind, original_name, stored_name, mime_type, size_bytes, is_public) VALUES ('cv', 'cv.pdf', 's1', 'application/pdf', 1, false);
      INSERT INTO job_openings (slug, title, department, location, experience, employment_type, posted_on, status)
        VALUES ('j', 'J', 'D', 'L', '1', 'Contract', '2026-01-01', 'open');
      INSERT INTO enquiries (name, organisation, email, phone, area, status) VALUES
        ('n1', 'o', 'e@x.in', '1', 'a', 'new'), ('n2', 'o', 'e@x.in', '1', 'a', 'spam'), ('n3', 'o', 'e@x.in', '1', 'a', 'in_progress');
      INSERT INTO job_applications (position, name, email, phone, location, qualification, experience_years, cv_media_id, consent, status) VALUES
        ('p', 'a1', 'e', '1', 'l', 'q', 1, 1, true, 'new'), ('p', 'a2', 'e', '1', 'l', 'q', 1, 1, true, 'interview'),
        ('p', 'a3', 'e', '1', 'l', 'q', 1, 1, true, 'hired'), ('p', 'a4', 'e', '1', 'l', 'q', 1, 1, true, 'rejected');
    `);

    for (const file of ['0001_admin_panel.sql', '0002_drop_employment_type_enum.sql']) {
      for (const st of statements(file)) await pg.exec(st);
    }

    const enq = await pg.query<{ name: string; status: string }>('SELECT name, status FROM enquiries ORDER BY name');
    expect(enq.rows).toEqual([{ name: 'n1', status: 'new' }, { name: 'n2', status: 'closed' }, { name: 'n3', status: 'in_progress' }]);
    const apps = await pg.query<{ name: string; status: string }>('SELECT name, status FROM job_applications ORDER BY name');
    expect(apps.rows.map((r) => r.status)).toEqual(['pending', 'shortlisted', 'selected', 'rejected']);
    const job = await pg.query<{ employment_type: string }>('SELECT employment_type FROM job_openings');
    expect(job.rows[0].employment_type).toBe('Contract');
    const users = await pg.query<{ email: string; username: string | null; active: boolean }>('SELECT email, username, active FROM admin_users ORDER BY id');
    expect(users.rows).toEqual([{ email: 'a@x.in', username: 'admin', active: true }, { email: 'e@x.in', username: null, active: false }]);
    // New columns have defaults; new enquiry statuses are accepted.
    await pg.exec(`UPDATE enquiries SET status = 'resolved' WHERE name = 'n1'`);
    await pg.close();
  });
});
