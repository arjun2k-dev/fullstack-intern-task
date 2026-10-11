import { pathToFileURL } from 'node:url';
import { connectDB, describeConnection, disconnectDB } from './connection.js';
import { Favorite } from '../models/Favorite.js';
import { Template } from '../models/Template.js';
import { User } from '../models/User.js';

/**
 * MongoDB creates databases and collections on first write, so there is no schema to apply.
 * What does need setting up is indexes (unique email, unique template name, unique favorite pair).
 * Idempotent, so it is safe to call before every seed.
 */
export async function runMigrations() {
  await connectDB();
  for (const model of [User, Template, Favorite]) {
    await model.createCollection().catch((err) => {
      // 48 = NamespaceExists: the collection is already there
      if (err.code !== 48) throw err;
    });
    await model.syncIndexes();
  }
}

// Allow `npm run migrate`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMigrations()
    .then(() => {
      console.log(`Database "${describeConnection()}" is ready (indexes applied).`);
    })
    .catch((err) => {
      console.error('Migration failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => disconnectDB());
}
