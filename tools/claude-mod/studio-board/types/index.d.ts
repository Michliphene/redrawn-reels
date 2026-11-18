export type StageState = 'done' | 'away' | 'skip' | 'todo' | 'stale' | 'warn' | 'fail'
export type Stage = { key: string; label: string; state: StageState; note: string; cmd: string }
export type Episode = {
  id: string
  series: string
  tag: string
  title: string
  da: number
  hasRemaster: boolean
  stages: Stage[]
  progress: string
  reel: number | null
  viral: number | null
  views: number
  platforms: string[]
  next: { stage: string; note: string; cmd: string } | null
  issues: string[]
}
export type Snapshot = {
  at: string
  episodes: Episode[]
  backlog: { series: string; n: string; title: string }[]
  missing: string[]
}
export type Job = {
  key: string
  kind: string
  episode: string
  startedAt: number
  endedAt: number | null
  ok: boolean | null
  background: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'studio-board': {
      snapshot: Shaped<Snapshot | null>
      selected: Shaped<string | null>
      jobs: Shaped<Job[]>
      error: Shaped<string | null>
    }
  }
}
