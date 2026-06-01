import * as dotenv from 'dotenv';
import * as path from 'path';

const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log('Dotenv result:', result.parsed ? 'parsed successfully' : result.error);
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);

async function test() {
  try {
    const { db } = await import('../src/db');
    const { users } = await import('../src/db/schema');
    console.log('Querying users...');
    const allUsers = await db.select().from(users).all();
    console.log('Success! Users count:', allUsers.length);
    console.log('Users:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

test();
