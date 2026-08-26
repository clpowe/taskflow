import { createContextKey, type Middleware } from 'remix/router'

import { db, type AppDatabase } from '../db.ts'

export const databaseContext = createContextKey<AppDatabase>

export function loadDatabase(): Middleware<{
  key: typeof databaseContext
  value: AppDatabase
  property: 'db'
}> {
  return (context, next) => {
    context.set(databaseContext, db, {
      property: 'db',
    })

    return next()
  }
}
