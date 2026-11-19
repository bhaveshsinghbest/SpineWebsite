// The website has a single administrator account. This script creates it when it does not exist, or
// resets its username, email and password (for example when the password is lost and email is not set up).
//   npm run admin:create -- --username admin --email person@spineadvisory.com --name "Full Name"
// A strong random password is generated and shown once.
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { asc, eq } from 'drizzle-orm';
import { connect, db, disconnect } from '../config/db.ts';
import { adminSessions, adminUsers } from '../models/schema.ts';
import { hashPassword } from '../utils/password.ts';

const { values } = parseArgs({ options: { username: { type: 'string', default: 'admin' }, email: { type: 'string' }, name: { type: 'string', default: 'Administrator' } } });
if (!/^[A-Za-z0-9._-]{3,60}$/.test(values.username!)) {
  console.error('Usage: npm run admin:create -- --username <username> [--email <email>] [--name "<name>"]');
  process.exit(1);
}
await connect();
const password = `Sa-${randomBytes(12).toString('base64url')}9`;
const [existing] = await db().select().from(adminUsers).where(eq(adminUsers.role, 'admin')).orderBy(asc(adminUsers.id)).limit(1);
if (existing) {
  await db().update(adminUsers).set({
    username: values.username, email: values.email?.toLowerCase() ?? existing.email, name: values.name ?? existing.name, active: true,
    passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null,
  }).where(eq(adminUsers.id, existing.id));
  await db().delete(adminSessions).where(eq(adminSessions.userId, existing.id));
  console.log(`Reset the administrator account.\n  username: ${values.username}\n  password: ${password}\nSign in at /admin/login and change the password straight away.`);
} else {
  if (!values.email) { console.error('--email is required when creating the administrator.'); process.exit(1); }
  await db().insert(adminUsers).values({ username: values.username, email: values.email.toLowerCase(), name: values.name!, role: 'admin', passwordHash: await hashPassword(password) });
  console.log(`Created the administrator account.\n  username: ${values.username}\n  password: ${password}\nSign in at /admin/login and change the password straight away.`);
}
await disconnect();
