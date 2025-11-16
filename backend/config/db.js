import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('db.json')
const defaultData = { users: [], tickets: [] }

const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= { students: [], tickets: [] };
  await db.write();
}

export default db;
