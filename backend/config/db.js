import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('db.json')
const defaultData = { users: [], students: [], tickets: [], departments: [] }

const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= { users: [], students: [], tickets: [], departments: [] };
  await db.write();
}

export default db;
