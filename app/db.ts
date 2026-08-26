import { mkdirSync } from 'node:fs'
import { SQL } from 'bun'

const dataDirectory = new URL('../data/', import.meta.url)
const databaseFile = new URL('../data/taskflow.sqlite', import.meta.url)

mkdirSync(dataDirectory, {
  recursive: true,
})

export const db = new SQL({
  adapter: 'sqlite',
  filename: process.env.NODE_ENV === 'test' ? ':memory:' : databaseFile,
  create: true,
  strict: true,
})

await db`PRAGMA foreign_keys = ON`

if (process.env.NODE_ENV !== 'test') {
  await db`PRAGMA journal_mode = WAL`
}

export type AppDatabase = typeof db
