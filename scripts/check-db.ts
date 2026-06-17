import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  try {
    const { db } = await import('../src/db');
    const { projects } = await import('../src/db/schema');
    const list = await db.select().from(projects).all();
    console.log("PROJECT_DATA_START");
    console.log(JSON.stringify(list, null, 2));
    console.log("PROJECT_DATA_END");
  } catch (error) {
    console.error("Database query failed:", error);
  }
}

main().catch(console.error);
