import type { Temporal as TemporalType } from '@js-temporal/polyfill'

import { db } from '../app/db.ts'

declare const Temporal: typeof TemporalType

function dateThisWeek(dayIndex: number) {
  const today = Temporal.Now.plainDateISO()

  const monday = today.subtract({
    days: today.dayOfWeek - 1,
  })

  return monday.add({ days: dayIndex }).toString()
}

await db`
  INSERT OR IGNORE INTO users (
    id,
    name,
    initials,
    avatar_color
  )
  VALUES (
    1,
    'Bruce',
    'BR',
    '#F36B55'
  )
`

await db`
  INSERT OR IGNORE INTO users (
    id,
    name,
    initials,
    avatar_color
  )
  VALUES (
    2,
    'Amelia',
    'AM',
    '#48C2C3'
  )
`

await db`
  INSERT OR IGNORE INTO users (
    id,
    name,
    initials,
    avatar_color
  )
  VALUES (
    3,
    'James',
    'JT',
    '#F8C445'
  )
`

await db`
  INSERT OR IGNORE INTO users (
    id,
    name,
    initials,
    avatar_color
  )
  VALUES (
    4,
    'Lena',
    'LK',
    '#4F9DF9'
  )
`

const [countRow] = await db`
  SELECT COUNT(*) AS count
  FROM tasks
`

const existingTaskCount = Number(countRow?.count ?? 0)

if (existingTaskCount === 0) {
  const tasks = [
    {
      title: 'Website for Rune.io',

      description:
        'Effectively manage and coordinate the tasks involved in the development and enhancement of the Rune.io job finder website. Ensure alignment with project goals, timelines, and quality standards.',

      status: 'in_progress',

      category: 'Design',

      dueDate: dateThisWeek(4),

      alertEnabled: true,

      assignees: [1, 2, 3, 4],

      checklist: [
        [
          'Collaborate with the design team to outline the requirements for the website redesign.',
          true,
        ],
        [
          'Coordinate with the content creation team to ensure the development of engaging and informative content.',
          true,
        ],
        ['Task the development team with enhancing the user profile functionality.', false],
        ['Work closely with the tech team to optimize the job matching algorithm.', false],
        ['Task the mobile team with ensuring the website is mobile responsive.', false],
      ],
    },

    {
      title: 'Dashboard for ProSavvy',

      description: 'Design and build the analytics dashboard for the ProSavvy product.',

      status: 'ongoing',

      category: 'User Experience',

      dueDate: dateThisWeek(2),

      alertEnabled: false,

      assignees: [1, 2],

      checklist: [
        ['Create dashboard wireframes.', true],
        ['Review data requirements.', true],
        ['Build responsive prototype.', true],
        ['Run usability review.', false],
      ],
    },

    {
      title: 'Mobile Apps for Track.id',

      description: 'Plan and execute the next iteration of the Track.id mobile experience.',

      status: 'ongoing',

      category: 'Development',

      dueDate: dateThisWeek(3),

      alertEnabled: true,

      assignees: [1, 3],

      checklist: [
        ['Review current application.', true],
        ['Create navigation model.', true],
        ['Implement new screens.', false],
        ['Complete QA.', false],
      ],
    },

    {
      title: 'Website for CourierGo.com',

      description: 'Improve the CourierGo marketing and customer experience.',

      status: 'in_progress',

      category: 'Coding',

      dueDate: dateThisWeek(5),

      alertEnabled: false,

      assignees: [2, 4],

      checklist: [
        ['Audit current pages.', true],
        ['Create component plan.', true],
        ['Implement homepage.', false],
        ['Implement service pages.', false],
        ['Run accessibility audit.', false],
      ],
    },

    {
      title: 'Design system cleanup',

      description: 'Consolidate duplicated design system components.',

      status: 'completed',

      category: 'Design',

      dueDate: dateThisWeek(0),

      alertEnabled: false,

      assignees: [1],

      checklist: [
        ['Audit components.', true],
        ['Merge duplicates.', true],
        ['Update documentation.', true],
        ['Publish changes.', true],
      ],
    },

    {
      title: 'User interviews',

      description: 'Interview customers about task management workflows.',

      status: 'completed',

      category: 'User Experience',

      dueDate: dateThisWeek(1),

      alertEnabled: false,

      assignees: [2],

      checklist: [
        ['Recruit participants.', true],
        ['Conduct interviews.', true],
        ['Summarize findings.', true],
      ],
    },

    {
      title: 'QA handoff',

      description: 'Prepare the current release for QA.',

      status: 'cancelled',

      category: 'Development',

      dueDate: dateThisWeek(5),

      alertEnabled: false,

      assignees: [3],

      checklist: [
        ['Prepare build.', false],
        ['Create QA notes.', false],
      ],
    },

    {
      title: 'Analytics review',

      description: 'Review product analytics and identify the next optimization opportunities.',

      status: 'ongoing',

      category: 'Meeting',

      dueDate: dateThisWeek(6),

      alertEnabled: true,

      assignees: [1, 4],

      checklist: [
        ['Review dashboard.', true],
        ['Identify anomalies.', false],
        ['Create recommendations.', false],
      ],
    },
  ] as const

  await db.begin(async (sql) => {
    for (const task of tasks) {
      const [taskRow] = await sql`
        INSERT INTO tasks (
          title,
          description,
          status,
          category,
          due_date,
          alert_enabled
        )
        VALUES (
          ${task.title},
          ${task.description},
          ${task.status},
          ${task.category},
          ${task.dueDate},
          ${task.alertEnabled ? 1 : 0}
        )
        RETURNING id
      `

      if (!taskRow) {
        throw new Error(`Failed to create task: ${task.title}`)
      }

      const taskId = Number(taskRow.id)

      for (const userId of task.assignees) {
        await sql`
          INSERT INTO task_assignees (
            task_id,
            user_id
          )
          VALUES (
            ${taskId},
            ${userId}
          )
        `
      }

      for (const [index, item] of task.checklist.entries()) {
        const [label, completed] = item

        await sql`
          INSERT INTO checklist_items (
            task_id,
            label,
            completed,
            position
          )
          VALUES (
            ${taskId},
            ${label},
            ${completed ? 1 : 0},
            ${index}
          )
        `
      }
    }
  })
}

console.log('Database seeded')
