type Props = {
  dashOn: boolean
  rpm: number
  won: boolean
}

export function Dashboard({ dashOn, rpm, won }: Props) {
  const needle = won ? 42 : Math.min(55, rpm * 1.4)
  const lit = dashOn || won

  return (
    <div
      className="pointer-events-none absolute top-2 left-2 z-20 flex items-end gap-1.5 rounded-md border border-[#2a2a30] bg-[#121214] px-2 py-1.5 shadow-lg"
      aria-hidden
    >
      <div className="relative h-[3.6rem] w-[3.6rem] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="46" fill="#0c0c0e" stroke="#333" strokeWidth="2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e22" strokeWidth="6" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const a = (-120 + n * 30) * (Math.PI / 180)
            const x1 = 50 + Math.cos(a) * 28
            const y1 = 50 + Math.sin(a) * 28
            const x2 = 50 + Math.cos(a) * 34
            const y2 = 50 + Math.sin(a) * 34
            return (
              <line
                key={n}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#666"
                strokeWidth="1.5"
              />
            )
          })}
          <text
            x="50"
            y="72"
            textAnchor="middle"
            fill="#666"
            fontSize="7"
            fontFamily="ui-monospace, monospace"
          >
            x1000
          </text>
          <line
            x1="50"
            y1="50"
            x2={50 + Math.cos((-120 + needle) * (Math.PI / 180)) * 30}
            y2={50 + Math.sin((-120 + needle) * (Math.PI / 180)) * 30}
            stroke={won ? '#e24a4a' : '#c44'}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: 'x2 80ms linear, y2 80ms linear' }}
          />
          <circle cx="50" cy="50" r="3" fill="#888" />
        </svg>
      </div>
      <div className="mb-0.5 flex flex-col gap-1.5 font-mono text-[0.55rem] font-bold tracking-wider">
        <DashLamp label="BAT" color="#e24a4a" on={lit} />
        <DashLamp label="OIL" color="#e24a4a" on={lit} />
        <DashLamp label="CHK" color="#e8c84a" on={lit} />
      </div>
    </div>
  )
}

function DashLamp({
  label,
  color,
  on
}: {
  label: string
  color: string
  on: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{
          background: on ? color : '#2a2a2e',
          boxShadow: on ? `0 0 8px ${color}` : 'none',
          opacity: on ? 1 : 0.45
        }}
      />
      <span style={{ color: on ? color : '#555' }}>{label}</span>
    </div>
  )
}
