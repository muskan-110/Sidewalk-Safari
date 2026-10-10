import { useCallback, useEffect, useRef, useState } from 'react'
import Hills from './components/Hills'
import Landing from './screens/Landing'
import Setup from './screens/Setup'
import Loading from './screens/Loading'
import Active from './screens/Active'
import Complete from './screens/Complete'
import History from './screens/History'
import ErrorScreen from './screens/ErrorScreen'
import { fetchMissions } from './lib/api'

const TIMEOUT_MS = 150000 // backend can take two ~50 s attempts on a CPU-only laptop

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [settings, setSettings] = useState({ duration: 10, surroundings: 'campus', difficulty: 'easy' })
  const [pack, setPack] = useState(null)
  const [done, setDone] = useState([])
  const [startedAt, setStartedAt] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const controller = useRef(null)
  const mainRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus()
  }, [screen])

  const start = useCallback(async (s) => {
    setSettings(s)
    setError('')
    setScreen('loading')
    const ctrl = new AbortController()
    controller.current = ctrl
    const timer = setTimeout(() => ctrl.abort('timeout'), TIMEOUT_MS)
    try {
      const data = await fetchMissions(s, ctrl.signal)
      setPack(data)
      setDone(data.missions.map(() => false))
      setStartedAt(Date.now())
      setScreen('active')
    } catch (e) {
      const reason = ctrl.signal.reason
      if (ctrl.signal.aborted && reason === 'cancel') return
      let msg = e?.message || 'Something went wrong.'
      if (ctrl.signal.aborted && reason === 'timeout') msg = 'The local model took too long to answer.'
      else if (e instanceof TypeError) msg = "Couldn't reach the Safari server. Is the backend running?"
      setError(msg)
      setScreen('error')
    } finally {
      clearTimeout(timer)
    }
  }, [])

  const cancel = () => {
    controller.current?.abort('cancel')
    setScreen('setup')
  }

  const toggle = (i) => setDone((d) => d.map((v, j) => (j === i ? !v : v)))

  const finish = () => {
    setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    setScreen('complete')
  }

  let view = null
  if (screen === 'landing') view = <Landing onStart={() => setScreen('setup')} onHistory={() => setScreen('history')} />
  if (screen === 'setup') view = <Setup initial={settings} onStart={start} onBack={() => setScreen('landing')} />
  if (screen === 'loading') view = <Loading onCancel={cancel} />
  if (screen === 'active' && pack)
    view = <Active pack={pack} done={done} startedAt={startedAt} onToggle={toggle} onFinish={finish} />
  if (screen === 'complete' && pack)
    view = (
      <Complete
        pack={pack}
        done={done}
        elapsed={elapsed}
        settings={settings}
        onAgain={() => setScreen('setup')}
        onHistory={() => setScreen('history')}
      />
    )
  if (screen === 'history') view = <History onBack={() => setScreen('landing')} onStart={() => setScreen('setup')} />
  if (screen === 'error')
    view = <ErrorScreen message={error} onRetry={() => start(settings)} onBack={() => setScreen('setup')} />

  return (
    <>
      <Hills />
      <main className="app-shell" ref={mainRef} tabIndex={-1}>
        {view}
      </main>
    </>
  )
}