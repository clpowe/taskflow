import { form, get, post, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: get('/'),
  overview: route('overview', {
    index: get('/'),
  }),
  tasks: route('tasks', {
    create: form('new'),
    show: get('/:taskId'),
    status: post('/:taskId/status'),
    checklist: route('/:taskId/checklist', {
      add: post('/'),
      toggle: post('/:itemId/toggle'),
    }),
  }),
})
