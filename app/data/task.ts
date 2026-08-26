import type { AppDatabase } from '../db.ts'

export const TASK_STATUSES = ['ongoing', 'in_progress', 'completed', 'cancelled'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_CATEGORIES = [
  'Design',
  'Development',
  'Coding',
  'Meeting',
  'Office Time',
  'User Experience',
] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  ongoing: 'Ongoing',
  in_progress: 'In Process',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export interface UserOption {
  id: number
  name: string
  initials: string
  avatarColor: string
}

export interface TaskSummary {
  id: number
  title: string
  category: string
  status: TaskStatus
  dueDate: string | null
  progress: number
}

export interface ChecklistItem {
  id: number
  label: string
  completed: boolean
  position: number
}

export interface TaskDetail {
  id: number
  title: string
  description: string
  category: string
  status: TaskStatus
  dueDate: string | null
  alertEnabled: boolean
  progress: number
  assignees: UserOption[]
  checklist: ChecklistItem[]
}

export interface DashboardData {
  counts: Record<TaskStatus, number>

  tasks: TaskSummary[]
}

export interface OverviewData {
  counts: Record<TaskStatus, number>

  inProgressByDay: number[]

  completedByDay: number[]

  projectProgressByDay: number[]
}

export interface CreateTaskInput {
  title: string
  description: string
  category: TaskCategory
  dueDate: string
  assigneeId: number
  alertEnabled: boolean
}

type StatusCountRow = {
  status: TaskStatus
  count: number
}

type TaskSummaryRow = {
  id: number
  title: string
  category: string
  status: TaskStatus
  dueDate: string | null
  progress: number
}

async function getStatusCounts(db: AppDatabase) {
  const counts: Record<TaskStatus, number> = {
    ongoing: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  }

  const rows = (await db`
      SELECT
        status,
        COUNT(*) AS count
      FROM tasks
      GROUP BY status
    `) as StatusCountRow[]

  for (const row of rows) {
    counts[row.status] = Number(row.count)
  }

  return counts
}

export async function getTaskSummaries(db: AppDatabase, limit = 8): Promise<TaskSummary[]> {
  const rows = (await db`
      SELECT
        t.id,
        t.title,
        t.category,
        t.status,
        t.due_date AS "dueDate",

        CASE
          WHEN COUNT(ci.id) = 0
            THEN 0

          ELSE CAST(
            ROUND(
              100.0 *
              SUM(
                CASE
                  WHEN ci.completed = 1
                    THEN 1
                  ELSE 0
                END
              )
              /
              COUNT(ci.id)
            )
            AS INTEGER
          )
        END AS progress

      FROM tasks AS t

      LEFT JOIN checklist_items AS ci
        ON ci.task_id = t.id

      GROUP BY t.id

      ORDER BY
        t.created_at DESC,
        t.id DESC

      LIMIT ${limit}
    `) as TaskSummaryRow[]

  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    progress: Number(row.progress),
  }))
}

export async function getDashboard(db: AppDatabase): Promise<DashboardData> {
  const [counts, tasks] = await Promise.all([getStatusCounts(db), getTaskSummaries(db)])

  return {
    counts,
    tasks,
  }
}

export async function getUsers(db: AppDatabase): Promise<UserOption[]> {
  const rows = (await db`
      SELECT
        id,
        name,
        initials,
        avatar_color
          AS "avatarColor"

      FROM users

      ORDER BY id
    `) as UserOption[]

  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
  }))
}

export async function getTask(db: AppDatabase, taskId: number): Promise<TaskDetail | null> {
  const [task] = (await db`
      SELECT
        id,
        title,
        description,
        category,
        status,

        due_date
          AS "dueDate",

        alert_enabled
          AS "alertEnabled"

      FROM tasks

      WHERE id = ${taskId}
    `) as Array<{
    id: number
    title: string
    description: string
    category: string
    status: TaskStatus
    dueDate: string | null
    alertEnabled: number
  }>

  if (!task) {
    return null
  }

  const assignees = (await db`
      SELECT
        u.id,
        u.name,
        u.initials,

        u.avatar_color
          AS "avatarColor"

      FROM users AS u

      INNER JOIN task_assignees AS ta
        ON ta.user_id = u.id

      WHERE
        ta.task_id = ${taskId}

      ORDER BY u.id
    `) as UserOption[]

  const checklistRows = (await db`
      SELECT
        id,
        label,
        completed,
        position

      FROM checklist_items

      WHERE
        task_id = ${taskId}

      ORDER BY
        position,
        id
    `) as Array<{
    id: number
    label: string
    completed: number
    position: number
  }>

  const checklist = checklistRows.map((item) => ({
    id: Number(item.id),

    label: item.label,

    completed: Boolean(item.completed),

    position: Number(item.position),
  }))

  const completedCount = checklist.filter((item) => item.completed).length

  const progress =
    checklist.length === 0 ? 0 : Math.round((completedCount / checklist.length) * 100)

  return {
    id: Number(task.id),

    title: task.title,

    description: task.description,

    category: task.category,

    status: task.status,

    dueDate: task.dueDate,

    alertEnabled: Boolean(task.alertEnabled),

    progress,

    assignees: assignees.map((user) => ({
      ...user,
      id: Number(user.id),
    })),

    checklist,
  }
}

export async function createTask(db: AppDatabase, input: CreateTaskInput) {
  return db.begin(async (sql) => {
    const [task] = await sql`
          INSERT INTO tasks (
            title,
            description,
            category,
            status,
            due_date,
            alert_enabled
          )
          VALUES (
            ${input.title.trim()},
            ${input.description.trim()},
            ${input.category},
            'ongoing',
            ${input.dueDate},
            ${input.alertEnabled ? 1 : 0}
          )
          RETURNING id
        `

    if (!task) {
      throw new Error('Failed to create task')
    }

    const taskId = Number(task.id)

    await sql`
        INSERT INTO task_assignees (
          task_id,
          user_id
        )
        VALUES (
          ${taskId},
          ${input.assigneeId}
        )
      `

    return taskId
  })
}

export async function updateTaskStatus(db: AppDatabase, taskId: number, status: TaskStatus) {
  await db`
    UPDATE tasks

    SET
      status = ${status},
      updated_at =
        CURRENT_TIMESTAMP

    WHERE
      id = ${taskId}
  `
}

export async function addChecklistItem(db: AppDatabase, taskId: number, label: string) {
  const [positionRow] = await db`
      SELECT
        COALESCE(
          MAX(position),
          -1
        ) + 1
          AS position

      FROM checklist_items

      WHERE
        task_id = ${taskId}
    `

  const position = Number(positionRow?.position ?? 0)

  await db`
    INSERT INTO checklist_items (
      task_id,
      label,
      completed,
      position
    )
    VALUES (
      ${taskId},
      ${label.trim()},
      0,
      ${position}
    )
  `
}

export async function toggleChecklistItem(db: AppDatabase, taskId: number, itemId: number) {
  await db`
    UPDATE checklist_items

    SET
      completed =
        CASE
          WHEN completed = 1
            THEN 0
          ELSE 1
        END

    WHERE
      id = ${itemId}
      AND
      task_id = ${taskId}
  `
}

function mondayIndex(date: string) {
  const day = new Date(`${date}T12:00:00`).getDay()

  return (day + 6) % 7
}

export async function getOverview(db: AppDatabase): Promise<OverviewData> {
  const [counts, tasks] = await Promise.all([
    getStatusCounts(db),

    getTaskSummaries(db, 500),
  ])

  const inProgressByDay = Array<number>(7).fill(0)

  const completedByDay = Array<number>(7).fill(0)

  const progressTotals = Array<number>(7).fill(0)

  const progressCounts = Array<number>(7).fill(0)

  for (const task of tasks) {
    if (!task.dueDate) {
      continue
    }

    const index = mondayIndex(task.dueDate)

    if (task.status === 'in_progress') {
      inProgressByDay[index]++
    }

    if (task.status === 'completed') {
      completedByDay[index]++
    }

    progressTotals[index] += task.progress

    progressCounts[index]++
  }

  const projectProgressByDay = progressTotals.map((total, index) => {
    const count = progressCounts[index]

    if (count === 0) {
      return 0
    }

    return Math.round(total / count)
  })

  return {
    counts,
    inProgressByDay,
    completedByDay,
    projectProgressByDay,
  }
}
