type Props = {
  dashOn: boolean
  /** Tach in x1000 marks (release at ~2). */
  rpm: number
  won: boolean
}

export function Dashboard({ dashOn, rpm, won }: Props) {
  // Needle angle offset: mark n sits at n * 30° from the 0 tick
  const mark = won ? 2.05 : Math.min(8, Math.max(0, rpm))
  const needle = mark * 30
  const lit = dashOn || won

  return (
    <div
      className="pointer-events-none absolute top-2 left-2 z-20 flex items-end gap-2 rounded-md border border-[#2a2a30] bg-[#121214] px-2.5 py-2 shadow-lg"
      aria-hidden
    >
      <div className="relative h-[6.25rem] w-[6.25rem] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="46" fill="#0c0c0e" stroke="#333" strokeWidth="2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e22" strokeWidth="6" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const a = (-120 + n * 30) * (Math.PI / 180)
            const x1 = 50 + Math.cos(a) * 28
            const y1 = 50 + Math.sin(a) * 28
            const x2 = 50 + Math.cos(a) * (n === 2 ? 36 : 34)
            const y2 = 50 + Math.sin(a) * (n === 2 ? 36 : 34)
            return (
              <g key={n}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={n === 2 ? '#e8c84a' : '#666'}
                  strokeWidth={n === 2 ? 2.2 : 1.5}
                />
                {n === 2 ? (
                  <text
                    x={50 + Math.cos(a) * 22}
                    y={50 + Math.sin(a) * 22 + 2.5}
                    textAnchor="middle"
                    fill="#e8c84a"
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="700"
                  >
                    2
                  </text>
                ) : null}
              </g>
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
            stroke={won ? '#5dff7a' : '#e24a4a'}
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="3" fill="#888" />
        </svg>
      </div>
      <div className="mb-1 flex flex-col gap-1.5 font-mono text-[0.65rem] font-bold tracking-wider">
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
