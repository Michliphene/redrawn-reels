// studio-board: the reel studio's pipeline, live, beside the chat.
// The data comes from the repo's own `node scripts/board.mjs --json` (the same board as `npm run board`),
// so the pane never disagrees with the terminal. Read-only: it renders, records and posts nothing.
import { atom, read, update } from 'claude-code'
import type { Register, EngineInterface } from 'claude-code'

import type { Episode, Job, Snapshot, StageState } from '../types'

const PANE = 'studio-board'
const snapshot = atom({ plugin: 'studio-board', key: 'snapshot' } as const, null as Snapshot | null, { shape: 'snapshot-1' })
const selected = atom({ plugin: 'studio-board', key: 'selected' } as const, null as string | null, { shape: 'selected-1' })
const jobs = atom({ plugin: 'studio-board', key: 'jobs' } as const, [] as Job[], { shape: 'jobs-1' })
const error = atom({ plugin: 'studio-board', key: 'error' } as const, null as string | null, { shape: 'error-1' })

// pipeline commands the pane follows when Claude runs them (status line while they run, a toast when they end)
const JOBS: { kind: string; re: RegExp }[] = [
  { kind: 'render', re: /(?:pipeline\/render\.sh|npm run render(?: --)?)\s+([\w-]+)/ },
  { kind: 'stills', re: /(?:scripts\/stills\.mjs|npm run stills(?: --)?)\s+([\w-]+)/ },
  { kind: 'pre-flight', re: /(?:scripts\/validate\.mjs|npm run validate(?: --)?)\s+([\w-]+)/ },
  { kind: 'voice', re: /pipeline\/tts\.py\s+([\w-]+)/ },
  { kind: 'post kit', re: /pipeline\/post\.sh\s+([\w-]+)/ },
  { kind: 'tracker', re: /(?:scripts\/track\.mjs|npm run track(?: --)?)\s+\w+\s+([\w-]+)/ },
]
// files whose change moves the board
const WATCHED = /\/(public\/episodes|public\/data|tracker|docs\/review|docs\/REVIEW_|deliverables|out)\b/

const DOT: Record<StageState, string> = { done: '●', away: '◌', skip: '·', todo: '○', stale: '◐', warn: '!', fail: '✗' }
const TONE: Record<StageState, string | undefined> = { done: 'success', away: 'inactive', skip: 'inactive', todo: 'inactive', stale: 'warning', warn: 'warning', fail: 'error' }
const SHORT = ['Src', 'Map', 'Pre', 'Voi', 'Mus', 'Sti', 'Ren', 'Rev', 'Kit', 'Pub']

const fmt = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n))
const ago = (ms: number) => { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 3600)}h` }

type Raw = {
  generatedAt: string
  episodes: { id: string; series: string; tag: string; title: string; da: number; hasRemaster: boolean; stages: Episode['stages']; progress: string; scores: { reel: number | null; viral: number | null }; totals: { views: number }; posts: Record<string, unknown>; next: Episode['next']; issues: { errors: string[]; warnings: string[] } }[]
  backlog: { series: string; n: string; title: string }[]
  doctor: { name: string; ok: boolean; optional?: boolean; fix: string }[]
}

let refreshing: Promise<void> | null = null
function refresh($: EngineInterface): Promise<void> {
  // one board run at a time; a request during a run waits for that run
  refreshing ??= (async () => {
    try {
      const root = await $.session.root()
      const r = await $.process.run(['node', 'scripts/board.mjs', '--json'], { cwd: root, timeoutMs: 90_000 })
      if (r.exitCode !== 0) throw new Error((r.stderr || r.stdout).trim().split('\n').slice(-1)[0] || `exit ${r.exitCode}`)
      const raw = JSON.parse(r.stdout) as Raw
      const snap: Snapshot = {
        at: raw.generatedAt,
        episodes: raw.episodes.map((e) => ({
          id: e.id, series: e.series, tag: e.tag, title: e.title, da: e.da, hasRemaster: e.hasRemaster,
          stages: e.stages, progress: e.progress, reel: e.scores.reel, viral: e.scores.viral,
          views: e.totals.views, platforms: Object.keys(e.posts), next: e.next,
          issues: [...e.issues.errors.map((x) => '✗ ' + x), ...e.issues.warnings.map((x) => '! ' + x)],
        })),
        backlog: raw.backlog.slice(0, 6),
        missing: raw.doctor.filter((d) => !d.ok && !d.optional).map((d) => `${d.name} → ${d.fix}`),
      }
      await update($, snapshot, () => snap)
      await update($, error, () => null)
    } catch (err) {
      await update($, error, () => `board failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'board', description: 'Studio board: every reel, its pipeline stage and next step (/board <id> for one)' })
    void $.ui.open({ id: PANE, title: 'Studio' })
    void refresh($)
    // the board also moves when the owner edits files outside this chat
    $.clock.every(120_000, () => refresh($))
    return next(e)
  })

  on('command.run', { command: 'board' }, async ($, e) => {
    const want = e.args.trim()
    await refresh($)
    const snap = await read($, snapshot)
    await $.ui.open({ id: PANE, title: 'Studio' })
    if (!want) {
      const n = snap?.episodes.length ?? 0
      const todo = snap?.episodes.filter((x) => x.next).length ?? 0
      return { text: `Studio board: ${n} episodes, ${todo} with a next step. Pane opened.` }
    }
    const ep = snap?.episodes.find((x) => x.id === want || x.tag.replace(/\D/g, '') === want.replace(/\D/g, ''))
    if (!ep) return { text: `No episode "${want}".` }
    await update($, selected, () => ep.id)
    const lines = ep.stages.map((s) => `${DOT[s.state]} ${s.label.padEnd(10)} ${s.note}${s.cmd && !['done', 'skip'].includes(s.state) ? `  → ${s.cmd}` : ''}`)
    return { text: [`${ep.series} ${ep.tag} · ${ep.title} (${ep.id})`, ...lines, ...ep.issues.map((x) => '   ' + x), ep.next ? `next → ${ep.next.stage}: ${ep.next.cmd || ep.next.note}` : 'nothing to do'].join('\n') }
  })

  // follow pipeline commands: status line while one runs, a toast and a board refresh when it ends
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const hit = JOBS.map((j) => ({ j, m: e.command.match(j.re) })).find((x) => x.m)
    if (!hit) return next(e)
    const job: Job = { key: e.tool_use_id, kind: hit.j.kind, episode: hit.m![1]!, startedAt: await $.clock.now(), endedAt: null, ok: null, background: !!e.run_in_background }
    await update($, jobs, (list) => [...list, job].slice(-12))
    $.ui.status(`${job.kind} ${job.episode}…`)
    const ran = await next(e)
    const end = await $.clock.now()
    const ok = !e.run_in_background && ran.deny === undefined ? ran.isError !== true : null
    await update($, jobs, (list) => list.map((x) => (x.key === job.key ? { ...x, endedAt: e.run_in_background ? null : end, ok } : x)))
    if (!e.run_in_background) {
      $.ui.status(undefined)
      if (ran.deny === undefined && (job.kind === 'render' || job.kind === 'post kit' || ok === false)) {
        $.ui.toast(`${ok ? '✓' : '✗'} ${job.kind} ${job.episode} ${ok ? 'done' : 'failed'} in ${ago(end - job.startedAt)}`)
      }
    } else $.ui.status(`${job.kind} ${job.episode} running in background`)
    void refresh($)
    return ran
  })

  // edits to episodes, data, reviews, kits or the tracker move the board
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const file = (e as { file_path?: unknown }).file_path
    if ((e.tool === 'Edit' || e.tool === 'Write') && typeof file === 'string' && WATCHED.test(file)) void refresh($)
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const snap = await read($, snapshot)
    const sel = await read($, selected)
    const list = await read($, jobs)
    const err = await read($, error)
    const now = await $.clock.now()
    const narrow = (e.viewport?.columns ?? 100) < 70

    const running = list.filter((j) => j.endedAt === null && !j.background)
    const recent = list.filter((j) => j.endedAt !== null).slice(-3).reverse()

    const row = (ep: Episode) => {
      const isSel = ep.id === sel
      return (
        <Box key={ep.id} flexDirection="column">
          <Button key={`ep-${ep.id}`} plain onPress={() => update($, selected, (s) => (s === ep.id ? null : ep.id))}>
            <Text bold={isSel}>{ep.tag.padEnd(5)} {ep.id.padEnd(narrow ? 0 : 18)} </Text>
            {!narrow && ep.stages.map((s) => <Text color={TONE[s.state]}>{DOT[s.state]} </Text>)}
            <Text color="claude">{ep.viral != null ? ` ${ep.viral}` : ''}</Text>
            <Text dimColor>{ep.views ? ` · ${fmt(ep.views)} views` : ''}{ep.next ? ` → ${ep.next.stage}` : ' ✓'}</Text>
          </Button>
          {isSel && (
            <Box flexDirection="column" marginLeft={2} marginBottom={1}>
              <Text dimColor>{ep.title} · DA {ep.da}{ep.hasRemaster ? ' · has a DA 2 remaster' : ''} · {ep.progress}</Text>
              {ep.stages.map((s) => (
                <Text>
                  <Text color={TONE[s.state]}>{DOT[s.state]} </Text>
                  <Text>{s.label.padEnd(10)} </Text>
                  <Text dimColor>{s.note}</Text>
                </Text>
              ))}
              {ep.issues.slice(0, 4).map((x) => <Text color={x.startsWith('✗') ? 'error' : 'warning'}>  {x}</Text>)}
              {ep.next && (
                <Box flexDirection="row" marginTop={1}>
                  <Text>next: <Text bold>{ep.next.cmd || ep.next.note}</Text> </Text>
                  {ep.next.cmd && (
                    <Button key={`copy-${ep.id}`} onPress={(press) => { void $.ui.copy({ text: ep.next!.cmd, surface: press.surface }) }}>Copy</Button>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )
    }

    const series = snap ? [...new Set(snap.episodes.map((x) => x.series))] : []
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between">
          <Text bold>STUDIO</Text>
          <Box flexDirection="row">
            <Text dimColor>{snap ? `${snap.episodes.length} reels · ${new Date(snap.at).toISOString().slice(11, 16)} UTC ` : 'loading… '}</Text>
            <Button key="refresh" onPress={() => { void refresh($) }}>Refresh</Button>
          </Box>
        </Box>
        {err && <Text color="error">{err}</Text>}
        {running.map((j) => <Text color="warning">▶ {j.kind} {j.episode} · {ago(now - j.startedAt)}</Text>)}
        {!narrow && snap && <Text dimColor>{' '.repeat(25)}{SHORT.join(' ').replace(/ /g, ' ')}</Text>}
        {series.map((s) => (
          <Box key={s} flexDirection="column" marginTop={1}>
            <Text bold color="suggestion">{s}</Text>
            {snap!.episodes.filter((x) => x.series === s).map(row)}
          </Box>
        ))}
        {recent.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Recent runs</Text>
            {recent.map((j) => <Text color={j.ok === false ? 'error' : undefined} dimColor={j.ok !== false}>{j.ok === false ? '✗' : '✓'} {j.kind} {j.episode} · {ago(j.endedAt! - j.startedAt)} · {ago(now - j.endedAt!)} ago</Text>)}
          </Box>
        )}
        {snap && snap.missing.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="warning">Toolchain</Text>
            {snap.missing.map((m) => <Text dimColor>○ {m}</Text>)}
          </Box>
        )}
        {snap && snap.backlog.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Next topics</Text>
            {snap.backlog.slice(0, 4).map((b) => <Text dimColor>{b.series} {b.n} · {b.title}</Text>)}
          </Box>
        )}
        <Text dimColor>● done ◌ done before ◐ stale ! look ✗ fail ○ todo · tap a reel</Text>
      </Box>
    )
  })
}
