// src/pages/player/Trainings.jsx
import React, { useMemo, useState, useEffect } from 'react'
import './Trainings.module.css'
import { loadPlayerTrainings } from '../../utils/playerTrainings'





const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'Dekabr',
]

const UZ_WEEKDAYS_LONG = [
  'yakshanba',
  'dushanba',
  'Seshanba',
  'chorshanba',
  'payshanba',
  'juma',
  'shanba',
]


/* helpers */
function useMonthMatrix(year, month, weekStart = 0) {
	const first = new Date(year, month, 1)
	const firstDow = first.getDay()
	const offset = (firstDow - weekStart + 7) % 7
	const startDate = new Date(first)
	startDate.setDate(first.getDate() - offset)

	const weeks = []
	let cur = new Date(startDate)
	for (let w = 0; w < 6; w++) {
		const week = []
		for (let d = 0; d < 7; d++) {
			week.push({
				date: new Date(cur),
				inMonth: cur.getMonth() === month,
			})
			cur.setDate(cur.getDate() + 1)
		}
		weeks.push(week)
	}
	return weeks
}

function formatMonthTitle(date) {
  const year = date.getFullYear()
  const monthName = UZ_MONTHS[date.getMonth()] || ''
  return `${monthName} ${year}`
}


function isoDateKey(d) {
	const y = d.getFullYear()
	const m = `${d.getMonth() + 1}`.padStart(2, '0')
	const dt = `${d.getDate()}`.padStart(2, '0')
	return `${y}-${m}-${dt}`
}

function getWeekDays(baseDate) {
  const d = new Date(baseDate)
  const day = d.getDay() // 0 = Yakshanba, 1 = Dushanba, ... 6 = Shanba

  // Haftani DUSHANBADAN boshlab olaylik
  const diffFromMonday = (day + 6) % 7 // Dushanba uchun 0 bo'ladi
  const monday = new Date(d)
  monday.setDate(d.getDate() - diffFromMonday)

  const days = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday)
    cur.setDate(monday.getDate() + i)
    days.push(cur)
  }
  return days
}


function WeeklyLoadCard({ store, activeDate }) {
	// Tanlangan sana bo'yicha hafta (dushanba–yakshanba)
	const baseDate = activeDate || new Date()
	const weekDays = getWeekDays(baseDate)

	const bars = weekDays.map(d => {
		const key = isoDateKey(d)
		const sessions = store.sessions[key] || []
		const totalLoad = sessions.reduce((sum, s) => sum + (s.load || 0), 0)
		return {
			date: d,
			key,
			total: totalLoad,
		}
	})

	const maxValue = bars.reduce((m, b) => (b.total > m ? b.total : m), 0) || 1
	const totalWeekLoad = bars.reduce((sum, b) => sum + b.total, 0)
	const weekdayNamesUz = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

	const weekRangeLabel = (() => {
		if (!weekDays.length) return ''
		const from = weekDays[0].toLocaleDateString('uz-UZ', {
			day: '2-digit',
			month: '2-digit',
		})
		const to = weekDays[6].toLocaleDateString('uz-UZ', {
			day: '2-digit',
			month: '2-digit',
		})
		return `${from} — ${to}`
	})()

	// ---- Line chart uchun nuqtalar (0..100 % koordinata) ----
	const linePoints = (() => {
		if (bars.length === 0) return ''

		const n = bars.length
		const stepX = n > 1 ? 100 / (n - 1) : 0

		return bars
			.map((b, idx) => {
				const ratio = b.total / maxValue // 0..1
				const x = stepX * idx
				// yuqoriga yaqin bo'lishi uchun 10..90 diapazonida chizamiz
				const y = 90 - ratio * 70 // 90 past, 20 yuqori tomoni
				return `${x},${y}`
			})
			.join(' ')
	})()

	return (
		<div className='card mini-card'>
			<h4 className='mini-title'>Haftalik mashg&apos;ulot yuklamam</h4>
			<p className='mini-sub'>
				Tanlangan hafta bo&apos;yicha yuklama dinamikasi
				<br />
				<span style={{ fontSize: 11, opacity: 0.8 }}>{weekRangeLabel}</span>
			</p>

			<div className='weekly-chart'>
				<div className='weekly-chart-header'>
					<span>Umumiy yuklama: {totalWeekLoad || 0}</span>
					<span style={{ fontSize: 11 }}>Murabbiy mashg'ulotlari asosida</span>
				</div>

				{/* 🔹 Mini line-chart */}
				<div className='weekly-linechart'>
					<svg viewBox='0 0 100 100' preserveAspectRatio='none'>
						{/* fon to'rini xohlasang o'chirib yuborishing mumkin */}
						<polyline
							points='0,90 100,90'
							fill='none'
							stroke='rgba(148,163,184,0.4)'
							strokeWidth='0.5'
						/>
						{linePoints && (
							<polyline
								points={linePoints}
								fill='none'
								stroke='#2563eb' // ko'k chiziq
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						)}
					</svg>
				</div>

				{/* Pastdagi ustunchalar (bars) o'z holicha qoladi */}
				<div className='weekly-bars'>
					{bars.map((b, idx) => {
						const ratio = b.total / maxValue
						const height = `${Math.max(ratio * 100, 6)}%`
						const dow = b.date.getDay() // 0..6
						const weekday = weekdayNamesUz[dow] || ''
						const hasData = b.total > 0

						return (
							<div key={idx} className='weekly-bar'>
								<div className='weekly-bar-value'>
									{b.total > 0 ? b.total : ''}
								</div>
								<div
									className={
										'weekly-bar-inner' +
										(hasData ? ' weekly-bar-inner--active' : '')
									}
									style={{ height }}
								/>
								<div className='weekly-bar-label'>{weekday}</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

function computeDailyFatigue(store, date) {
	const key = isoDateKey(date)
	const sessions = store.sessions[key] || []

	// shu kundagi jami load
	const totalLoad = sessions.reduce((sum, s) => sum + (s.load || 0), 0)

	// oddiy model: 3 ta mashg'ulot * 10 ball = 30 ball = 100%
	const MAX_DAILY_LOAD = 30

	const percentRaw = MAX_DAILY_LOAD > 0 ? (totalLoad / MAX_DAILY_LOAD) * 100 : 0
	const percent = Math.max(0, Math.min(100, Math.round(percentRaw)))

	let level = 'Past'
	if (percent > 66) level = 'Yuqori'
	else if (percent > 33) level = "O'rtacha"

	let desc = ''
	if (level === 'Past') {
		desc =
			"Yuklama past – qo'shimcha mashg'ulot yoki tiklanish uchun yaxshi imkoniyat."
	} else if (level === "O'rtacha") {
		desc =
			"Holatingiz optimal holatda, ammo kechki tiklanish va uxlashga e'tibor bering."
	} else {
		desc =
			'Yuklama yuqori – ortiqcha charchoq va jarohat xavfini kamaytirish uchun dam olish zarur.'
	}

	return { percent, level, desc, totalLoad }
}

function computeWeeklyStats(store, baseDate) {
	const days = getWeekDays(baseDate)

	let totalMinutes = 0
	let totalLoad = 0
	let sessionCount = 0
	let activeDays = 0

	days.forEach(d => {
		const key = isoDateKey(d)
		const sessions = store.sessions[key] || []

		if (sessions.length > 0) activeDays++

		sessions.forEach(s => {
			totalMinutes += s.duration || 0
			totalLoad += s.load || 0
			sessionCount++
		})
	})

	const avgLoad = sessionCount > 0 ? totalLoad / sessionCount : 0
	const attendancePct =
		days.length > 0 ? Math.round((activeDays / days.length) * 100) : 0

	return {
		totalMinutes,
		avgLoad: Math.round(avgLoad * 10) / 10,
		attendancePct,
	}
}

/* MiniCalendar – faqat HAFTA / KUN */
/* MiniCalendar – faqat HAFTA / KUN */
function MiniCalendar({ onDaySelect, events = {} }) {
  const today = new Date()
  const [view, setView] = useState('week') // 'week' | 'day'
  const [activeMonthDate, setActiveMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selected, setSelected] = useState(today)

  useEffect(() => {
    onDaySelect && onDaySelect(today)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const year = activeMonthDate.getFullYear()
  const month = activeMonthDate.getMonth()
  const weeks = useMonthMatrix(year, month, 1) // 1 = dushanba haftaning boshi
  const monthTitle = useMemo(
    () => formatMonthTitle(activeMonthDate),
    [activeMonthDate]
  )

  const prev = () => {
    if (view === 'week') {
      // 1 hafta orqaga
      setSelected(s => {
        const n = new Date(s)
        n.setDate(n.getDate() - 7)
        setActiveMonthDate(new Date(n.getFullYear(), n.getMonth(), 1))
        onDaySelect && onDaySelect(n)
        return n
      })
    } else {
      // kun rejimi – 1 kun orqaga
      setSelected(s => {
        const n = new Date(s)
        n.setDate(n.getDate() - 1)
        setActiveMonthDate(new Date(n.getFullYear(), n.getMonth(), 1))
        onDaySelect && onDaySelect(n)
        return n
      })
    }
  }

  const next = () => {
    if (view === 'week') {
      setSelected(s => {
        const n = new Date(s)
        n.setDate(n.getDate() + 7)
        setActiveMonthDate(new Date(n.getFullYear(), n.getMonth(), 1))
        onDaySelect && onDaySelect(n)
        return n
      })
    } else {
      setSelected(s => {
        const n = new Date(s)
        n.setDate(n.getDate() + 1)
        setActiveMonthDate(new Date(n.getFullYear(), n.getMonth(), 1))
        onDaySelect && onDaySelect(n)
        return n
      })
    }
  }

  const goToday = () => {
    const t = new Date()
    setSelected(t)
    setActiveMonthDate(new Date(t.getFullYear(), t.getMonth(), 1))
    onDaySelect && onDaySelect(t)
  }

  const weekdays = ['D', 'S', 'C', 'P', 'J', 'S', 'Y']

  const getWeekToRender = () => {
    const selectedKey = isoDateKey(selected)
    for (let i = 0; i < weeks.length; i++) {
      const w = weeks[i]
      if (w.some(cell => isoDateKey(cell.date) === selectedKey)) return w
    }
    return weeks[0]
  }

  return (
    <div className='calendar-wrapper' aria-hidden='false'>
      <div className='calendar-topRow'>
        <div className='calendar-tabs'>
          <button
            className={`tab ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Hafta
          </button>
          <button
            className={`tab ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Kun
          </button>
        </div>

        <div className='calendar-header'>
          <div className='cal-nav'>
            <button aria-label='prev' onClick={prev}>
              ‹
            </button>
          </div>
          <div className='cal-title'>{monthTitle}</div>
          <div className='cal-nav'>
            <button aria-label='next' onClick={next}>
              ›
            </button>
          </div>
        </div>

        <div>
          <button className='cal-today' onClick={goToday}>
            Bugun
          </button>
        </div>
      </div>

      <div className='tc-card'>
        {/* weekdays header */}
        <div className='tc-grid' style={{ marginBottom: 6 }}>
          {weekdays.map((w, i) => (
            <div key={i} className='tc-weekday'>
              {w}
            </div>
          ))}
        </div>

        {/* WEEK VIEW */}
        {view === 'week' && (
          <div
            className='tc-card'
            style={{
              padding: 0,
              boxShadow: 'none',
              border: 'none',
              background: 'transparent',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 10,
              }}
            >
              {getWeekToRender().map((cell, i) => {
                const key = isoDateKey(cell.date)
                const isSelected =
                  isoDateKey(cell.date) === isoDateKey(selected)
                const dayEvents = events[key] || []
                const cls = ['tc-day']
                if (!cell.inMonth) cls.push('other')
                if (isSelected) cls.push('active')
                return (
                  <div
                    key={i}
                    className={cls.join(' ')}
                    onClick={() => {
                      const d = new Date(cell.date)
                      setSelected(d)
                      onDaySelect && onDaySelect(d)
                    }}
                  >
                    <div className='num'>{cell.date.getDate()}</div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 6,
                      }}
                    >
                      {dayEvents.slice(0, 3).map((e, idx) => (
                        <span key={idx} className={`tc-dot ${e.color || ''}`} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DAY VIEW – bitta, lokalizatsiya qilingan variant */}
        {view === 'day' && (
          <div className='tc-card' style={{ padding: 0 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  minWidth: 72,
                  minHeight: 72,
                  borderRadius: 12,
                  background: 'linear-gradient(180deg, #fff, #f1f7ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 24,
                }}
              >
                {selected.getDate()}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {(() => {
                    const day = selected.getDate()
                    const monthName = UZ_MONTHS[selected.getMonth()] || ''
                    const year = selected.getFullYear()
                    const weekdayName =
                      UZ_WEEKDAYS_LONG[selected.getDay()] || ''
                    return `${day} ${monthName} ${year}, ${weekdayName}`
                  })()}
                </div>

                <div style={{ color: 'var(--muted)', marginTop: 8 }}>
                  {(events[isoDateKey(selected)] || []).length} mashg'ulot
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default function Trainings() {
	const [selectedDay, setSelectedDay] = useState(null)
	const [store, setStore] = useState(() => loadPlayerTrainings())

	const today = new Date()
	const activeDate = selectedDay || today

	// 3-karta: tanlangan haftaning statistikasi
	const weeklyStats = useMemo(
		() => computeWeeklyStats(store, activeDate),
		[store, activeDate]
	)

	// 2-karta: tanlangan kunning charchoq darajasi
	const fatigue = useMemo(
		() => computeDailyFatigue(store, activeDate),
		[store, activeDate]
	)

	useEffect(() => {
		setStore(loadPlayerTrainings())
	}, [])

	const formattedSelected = (() => {
  const day = activeDate.getDate()
  const monthName = UZ_MONTHS[activeDate.getMonth()] || ''
  return `${day} ${monthName}`
})()


	const selectedKey = isoDateKey(activeDate)
	const sessionsForDay = store.sessions[selectedKey] || []

	const handleDownloadReport = async () => {
		const { jsPDF } = await import('jspdf')
		const doc = new jsPDF()

		let y = 20

		// Sarlavha
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(18)
		doc.text('Shaxsiy haftalik hisobot', 20, y)

		y += 12
		doc.setFontSize(11)
		doc.setFont('helvetica', 'normal')
		doc.setTextColor(100)
		doc.text(
			'Bu hisobotda haftalik yuklama, charchoq darajasi va shaxsiy statistika keltirilgan.',
			20,
			y
		)

		// === 1-bo'lim: Haftalik yuklama ===
		y += 14
		doc.setTextColor(0)
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(13)
		doc.text("1. Haftalik mashg'ulot yuklamam", 20, y)

		y += 8
		doc.setFont('helvetica', 'normal')
		doc.setFontSize(11)
		doc.setTextColor(80)
		doc.text("So'nggi 7 kunlik yuklama dinamikasi.", 20, y)

		y += 8
		doc.text(
			"- [Grafik: shaxsiy yuklama charti (ilova ichida ko'rinadi)]",
			20,
			y
		)

		// === 2-bo'lim: Charchoq darajasi ===
		y += 16
		doc.setTextColor(0)
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(13)
		doc.text('2. Mening umumiy charchoq darajam', 20, y)

		y += 8
		doc.setFont('helvetica', 'normal')
		doc.setFontSize(11)
		doc.setTextColor(0)
		doc.text(`Umumiy charchoq: ${fatigue.percent}%`, 20, y)

		y += 7
		doc.setTextColor(245, 158, 11) // O'rtacha rangiga o'xshash
		doc.text(`Daraja: ${fatigue.level}`, 20, y)

		y += 8
		doc.setTextColor(80)
		doc.text(fatigue.desc, 20, y, { maxWidth: 170 })

		// legend
		y += 14
		doc.setTextColor(0)
		doc.text('Legend:', 20, y)
		y += 7
		doc.setTextColor(34, 197, 94)
		doc.text('- Past', 26, y)
		y += 6
		doc.setTextColor(251, 191, 36)
		doc.text("- O'rta", 26, y)
		y += 6
		doc.setTextColor(239, 68, 68)
		doc.text('- Yuqori', 26, y)

		// === 3-bo'lim: Shaxsiy haftalik hisobot (statlar) ===
		y += 14
		doc.setTextColor(0)
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(13)
		doc.text('3. Shaxsiy haftalik statistika', 20, y)

		doc.setFont('helvetica', 'normal')
		doc.setFontSize(11)
		doc.setTextColor(80)

		const totalHours = Math.floor(weeklyStats.totalMinutes / 60)
		const totalMinutesR = weeklyStats.totalMinutes % 60

		y += 8
		doc.text("Umumiy mashg'ulot vaqti:", 20, y)
		doc.setFont('helvetica', 'bold')
		doc.setTextColor(0)
		doc.text(`${totalHours} soat ${totalMinutesR} daqiqa`, 100, y)

		y += 7
		doc.setFont('helvetica', 'normal')
		doc.setTextColor(80)
		doc.text("O'rtacha yuklama:", 20, y)
		doc.setFont('helvetica', 'bold')
		doc.setTextColor(0)
		doc.text(`${weeklyStats.avgLoad} / 10`, 100, y)

		y += 7
		doc.setFont('helvetica', 'normal')
		doc.setTextColor(80)
		doc.text("O'rtacha davom etish:", 20, y)
		doc.setFont('helvetica', 'bold')
		doc.setTextColor(0)
		doc.text(`${weeklyStats.attendancePct}%`, 100, y)

		// Faylni yuklash
		doc.save('shaxsiy-haftalik-hisobot.pdf')
	}

	return (
		<div className='trainings-page'>
			<div className='trainings-grid'>
				{/* Left: calendar / main */}
				<div className='main-col'>
					<div className='card calendar-card'>
						<div className='calendar-top'>{/* controls in MiniCalendar */}</div>

						<div className='calendar-body'>
							<MiniCalendar
								onDaySelect={setSelectedDay}
								events={store.events}
							/>
						</div>
					</div>

					<h3 className='section-title'>
						Bugungi mashg'ulotlarim ({formattedSelected})
					</h3>

					<div className='sessions-list'>
						{sessionsForDay.length === 0 && (
							<div className='session-card session-card--empty'>
								Bu kunda mashg'ulot rejalashtirilmagan.
							</div>
						)}

						{sessionsForDay.map(s => (
							<div
								key={s.id}
								className={`session-card ${
									s.theme === 'blue'
										? 'session-card--blue'
										: s.theme === 'green'
										? 'session-card--green'
										: ''
								}`}
							>
								<div className='session-left'>
									<div className='session-type'>{s.type}</div>
									<div className='session-title'>{s.title}</div>
									<div className='session-meta'>
										{s.timeFrom} - {s.timeTo} • {s.duration} daqiqa • Yuklama:{' '}
										{s.load}
										/10
									</div>
								</div>
								<div className='session-right'>
									{s.label && (
										<div
											className={`session-status ${
												s.labelVariant === 'light'
													? 'session-status--light'
													: ''
											}`}
										>
											{s.label}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Right: sidebar – faqat shu o'yinchi uchun */}
				<aside className='side-col'>
					{/* 1-karta: haftalik yuklama – coach sessiyalaridan hisoblanadi */}
					<WeeklyLoadCard store={store} activeDate={activeDate} />

					{/* 2-karta: charchoq darajasi – tanlangan kun bo'yicha */}
					<div className='card mini-card fatigue-card'>
						<h4 className='mini-title'>Mening umumiy charchoq darajam</h4>

						<div className='fatigue-main'>
							<div
								className='percent-circle'
								style={{
									background: `conic-gradient(#dbeafe 0 ${fatigue.percent}%, #ffffff ${fatigue.percent}% 100%)`,
								}}
							>
								<span>{fatigue.percent}%</span>
							</div>

							<div className='fatigue-text-block'>
								<div className='fatigue-level'>{fatigue.level}</div>
								<div className='fatigue-desc'>{fatigue.desc}</div>
							</div>
						</div>

						<div className='fatigue-legend'>
							<span className='dot dot--green' /> Past
							<span className='dot dot--yellow' /> O'rta
							<span className='dot dot--red' /> Yuqori
						</div>
					</div>

					{/* 3-karta: shaxsiy haftalik hisobot */}
					<div className='card mini-card'>
						<h4 className='mini-title'>Shaxsiy haftalik hisobot</h4>

						<div className='report'>
							<div className='report-row'>
								<div className='report-label'>Umumiy mashg'ulot vaqti</div>
								<div className='report-value'>
									{Math.floor(weeklyStats.totalMinutes / 60)} soat{' '}
									{weeklyStats.totalMinutes % 60} daqiqa
								</div>
							</div>

							<div className='report-row'>
								<div className='report-label'>O'rtacha yuklama</div>
								<div className='report-value'>{weeklyStats.avgLoad} / 10</div>
							</div>

							<div className='report-row'>
								<div className='report-label'>O'rtacha davom etish</div>
								<div className='report-value'>{weeklyStats.attendancePct}%</div>
							</div>
						</div>

						<button
							className='primary-link-button'
							onClick={handleDownloadReport}
						>
							Hisobotlarni yuklab olish
						</button>
					</div>
				</aside>
			</div>
		</div>
	)
}
