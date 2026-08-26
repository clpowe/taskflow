import { rmSync } from 'node:fs'

const files = [
  new URL('../data/taskflow.sqlite', import.meta.url),

  new URL('../data/taskflow.sqlite-wal', import.meta.url),

  new URL('../data/taskflow.sqlite-shm', import.meta.url),
]

for (const file of files) {
  rmSync(file, {
    force: true,
  })
}

await import('./migrate.ts')
await import('./seed.ts')

console.log('Database reset')
