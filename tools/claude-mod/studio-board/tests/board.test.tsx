import { expect, test } from 'claude-code/testing'

const stage = (key: string, state: string, note = '', cmd = '') => ({ key, label: key, state, note, cmd })
const BOARD = {
  generatedAt: '2026-11-18T09:00:00.000Z',
  episodes: [
    {
      id: 'alaska-1867', series: 'REDRAWN', tag: 'EP 2', title: 'How Alaska became American', da: 1, hasRemaster: false,
      stages: [stage('sources', 'done'), stage('render', 'away', 'rendered before'), stage('posted', 'todo', 'not posted', '/post alaska-1867')],
      progress: '9/10', scores: { reel: 9, viral: 97 }, totals: { views: 0 }, posts: {},
      next: { stage: 'Publish', note: 'not posted', cmd: '/post alaska-1867' },
      issues: { errors: [], warnings: ['figure 1856 is not in SOURCES.md'] },
    },
  ],
  backlog: [{ series: 'REDRAWN', n: '20', title: 'How Czechoslovakia split without a shot (1993)' }],
  doctor: [{ name: 'node_modules', ok: false, fix: 'npm install' }],
}

const PANE = {
  plugin: 'studio-board', component: 'Pane', requestId: 'studio-board',
  props: { title: 'Studio', isFocused: false, bodyColumns: 100, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} },
} as const

test('the pane draws the board the repo script prints, and a press opens one reel', async ($, on) => {
  on('command.register', () => ({ value: { command: 'board' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('clock.every', () => ({ value: undefined }))
  on('clock.now', () => ({ value: 1_763_456_400_000 }))
  on('session.root', () => ({ value: '/repo' }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: JSON.stringify(BOARD), stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/repo', surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'board', args: '' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /alaska-1867/ }))?.text).toContain('EP 2')
    expect(await ui.find({ type: 'Text', text: /Czechoslovakia/ })).toBeTruthy()
    await ui.press({ key: 'ep-alaska-1867' })
    expect(await ui.find({ type: 'Text', text: /\/post alaska-1867/ })).toBeTruthy()
    expect(await ui.find({ type: 'Text', text: /1856/ })).toBeTruthy()
    await ui.press({ key: 'ep-alaska-1867' })
    await ui.unmount()
  }
})

test('a failing board script shows its error instead of a stale board', async ($, on) => {
  on('clock.now', () => ({ value: 1_763_456_400_000 }))
  on('session.root', () => ({ value: '/repo' }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('process.run', () => ({ value: { exitCode: 1, stdout: '', stderr: 'SyntaxError: bad episode.json', isStdoutTruncated: false, isStderrTruncated: false } }))
  await $.command.run({ command: 'board', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /board failed/ }))?.text).toContain('bad episode.json')
  await ui.unmount()
})
