import { db } from '../app/db.ts'

await db`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    avatar_color TEXT NOT NULL
  )
`
await db`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,

    description TEXT NOT NULL
      DEFAULT '',

    status TEXT NOT NULL
      DEFAULT 'ongoing'
      CHECK (
        status IN (
          'ongoing',
          'in_progress',
          'completed',
          'cancelled'
        )
      ),

    category TEXT NOT NULL
      DEFAULT 'Design',

    due_date TEXT,

    alert_enabled INTEGER NOT NULL
      DEFAULT 0
      CHECK (
        alert_enabled IN (0, 1)
      ),

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP
  )
`

await db`
  CREATE TABLE IF NOT EXISTS task_assignees (
    task_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    PRIMARY KEY (
      task_id,
      user_id
    ),

    FOREIGN KEY (task_id)
      REFERENCES tasks(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`

await db`
  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    task_id INTEGER NOT NULL,

    label TEXT NOT NULL,

    completed INTEGER NOT NULL
      DEFAULT 0
      CHECK (
        completed IN (0, 1)
      ),

    position INTEGER NOT NULL
      DEFAULT 0,

    FOREIGN KEY (task_id)
      REFERENCES tasks(id)
      ON DELETE CASCADE
  )
`

await db`
  CREATE INDEX IF NOT EXISTS
  checklist_items_task_id_index
  ON checklist_items(task_id)
`

await db`
  CREATE INDEX IF NOT EXISTS
  tasks_status_index
  ON tasks(status)
`

console.log('Database migrated')
