// src/pages/player/DashboardContent.jsx
import React, { useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import { loadPlayerDashboard } from '../../utils/playerDashboard'

/**
 * PlayerDashboard (DashboardContent.jsx)
 * Endi barcha kartalar va bloklar bitta o'yinchi (player) uchun.
 */

export default function PlayerDashboard() {
	// coach kiritgan ma'lumotlar
	const [summary, setSummary] = useState(() => loadPlayerDashboard())

	useEffect(() => {
		// component mount bo'lganda localStorage'dan o'qib oladi
		setSummary(loadPlayerDashboard())
	}, [])

	const isEmpty = !summary?.configured
	const now = new Date()

	const monthNames = [
		'Yanvar',
		'Fevral',
		'Mart',
		'Aprel',
		'May',
		'Iyun',
		'Iyul',
		'Avgust',
		'Sentyabr',
		'Oktyabr',
		'Noyabr',
		'Dekabr',
	]

	const currentYear = now.getFullYear()
	const currentMonthIndex = now.getMonth() // 0..11
	const currentDay = now.getDate() // 1..31

	const monthLabel = `${monthNames[currentMonthIndex]} ${currentYear}`

	const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate()

	// 🔹 bo'y / massa kartasi uchun
	const hasBodyStats =
		!isEmpty && (summary.heightCm || summary.weightKg || summary.heightChange)

	// 🔹 shaxsiy statistika kartasi uchun
	const hasPersonalStats =
		!isEmpty && (summary.goals || summary.assists || summary.seasonImprovement)

	return (
		<div className={styles.container}>
			{/* Top stat cards — coach boshqaradigan qism */}
			<div className={styles.statsGrid}>
				{/* O'ynagan o'yinlar */}
				<div className={styles.statCard}>
					<div className={styles.muted}>O'ynagan o'yinlar</div>
					<div className={styles.statValue}>
						{isEmpty ? '—' : summary.matches ?? '—'}
					</div>
					<div className={styles.statDelta} style={{ color: '#059669' }}>
						{isEmpty ? "Murabbiy hali ma'lumot kiritmagan" : 'Joriy mavsum'}
					</div>
				</div>

				{/* O'rtacha reyting */}
				<div className={styles.statCard}>
					<div className={styles.muted}>O'rtacha reyting</div>
					<div className={styles.statValue}>
						{isEmpty ? '—' : summary.avgRating ?? '—'}
					</div>
					<div className={styles.statDelta} style={{ color: '#ef4444' }}>
						{isEmpty ? '' : "Oxirgi 5 o'yin bo'yicha"}
					</div>
				</div>

				{/* Mashg'ulot yuklamasi */}
				<div className={styles.statCard}>
					<div className={styles.muted}>Mashg'ulot yuklamasi</div>
					<div className={styles.statValue}>
						{isEmpty ? '—' : summary.trainingLoad || '—'}
					</div>
					<div className={styles.statDelta} style={{ color: '#059669' }}>
						{isEmpty || !summary.trainingTrend
							? ''
							: `↑ ${summary.trainingTrend}`}
					</div>
				</div>

				{/* Sog'liq holati */}
				<div className={styles.statCard}>
					<div className={styles.muted}>Sog'liq holati</div>
					<div className={styles.statValue}>
						{isEmpty ? '—' : summary.healthStatus || '—'}
					</div>
					<div className={styles.statDelta} style={{ color: '#059669' }}>
						{isEmpty ? '' : `Oxirgi jarohat: ${summary.lastInjury || '—'}`}
					</div>
				</div>
			</div>
			{/* main dashboard area (chart + calendar) */}
			<div className={styles.dashboard}>
				<div>
					<div className={styles.mainGrid}>
						<div className={styles.chartCard}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<div>
									<div className={styles.chartTitle}>
										Bo'y/massa o'sish grafigi
									</div>

									<div className={styles.chartSub}>
										{hasBodyStats ? (
											<>
												{summary.heightCm ? `${summary.heightCm} sm` : '—'} /{' '}
												{summary.weightKg ? `${summary.weightKg} kg` : '—'}
												{summary.heightChange && (
													<span
														style={{ marginLeft: 12, color: 'var(--muted)' }}
													>
														{summary.heightChange}
													</span>
												)}
											</>
										) : (
											<>
												182 sm / 75 kg
												<span style={{ marginLeft: 12, color: 'var(--muted)' }}>
													Oxirgi 6 oy +1.5%
												</span>
											</>
										)}
									</div>
								</div>
							</div>

							{/* Simple SVG wave placeholder (replace with chart lib later) */}
							<div style={{ marginTop: 18 }}>
								<svg
									viewBox='0 0 800 180'
									width='100%'
									height='180'
									preserveAspectRatio='none'
								>
									<defs>
										<linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
											<stop offset='0%' stopColor='#dbeafe' stopOpacity='0.9' />
											<stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
										</linearGradient>
									</defs>
									<path
										d='M0,120 C120,40 240,120 360,80 C480,40 600,120 720,60 L800,60 L800,200 L0,200 Z'
										fill='url(#g)'
									/>
									<path
										d='M0,120 C120,40 240,120 360,80 C480,40 600,120 720,60'
										fill='none'
										stroke='#1e40af'
										strokeWidth='6'
										strokeLinecap='round'
									/>
								</svg>
							</div>
						</div>

						<aside className={styles.calendarCard}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<div style={{ fontWeight: 800 }}>Mashg'ulot intensivligi</div>

								<div style={{ textAlign: 'right' }}>
									<div className={styles.muted}>{monthLabel}</div>

									{/* Murabbiy yuklama ma'lumotini kiritsa – shu yerda ko'rinadi */}
									{!isEmpty &&
										(summary.trainingLoad || summary.trainingTrend) && (
											<div
												style={{
													marginTop: 2,
													fontSize: 12,
													fontWeight: 600,
													color: '#16a34a',
												}}
											>
												Yuklama: {summary.trainingLoad || '—'}
												{summary.trainingTrend && ` • ${summary.trainingTrend}`}
											</div>
										)}
								</div>
							</div>

							<div className={styles.calendarGrid} style={{ marginTop: 12 }}>
								{Array.from({ length: daysInMonth }).map((_, i) => {
									const day = i + 1
									const isActive = [4, 5, 12, 19, 26].includes(day)
									const isToday = day === currentDay

									const className =
										isActive || isToday
											? `${styles.calendarDay} ${styles.active}`
											: styles.calendarDay

									return (
										<div key={day} className={className}>
											{day}
										</div>
									)
								})}
							</div>
						</aside>
					</div>

					{/* bottom part: PERSONAL stats + activity */}
					<div className={styles.bottomGrid} style={{ marginTop: 18 }}>
						<div className={styles.teamStats}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<div>
									<div className={styles.bigTitle}>Shaxsiy statistikasi</div>
									<div className={styles.muted}>
										{hasPersonalStats ? (
											<>
												{summary.goals ?? 0} gol • {summary.assists ?? 0} assist{' '}
												{summary.seasonImprovement && (
													<span style={{ marginLeft: 10, color: '#059669' }}>
														{summary.seasonImprovement}
													</span>
												)}
											</>
										) : (
											<>
												18 gol • 7 assist{' '}
												<span style={{ marginLeft: 10, color: '#059669' }}>
													Joriy mavsum +12%
												</span>
											</>
										)}
									</div>
								</div>
							</div>

							<div
								style={{
									marginTop: 18,
									display: 'flex',
									gap: 12,
									alignItems: 'end',
								}}
							>
								<div
									style={{
										flex: 1,
										height: 80,
										background: 'rgba(99,102,241,0.12)',
										borderRadius: 8,
									}}
								/>
								<div
									style={{
										flex: 1,
										height: 50,
										background: 'rgba(99,102,241,0.12)',
										borderRadius: 8,
									}}
								/>
								<div
									style={{
										flex: 1,
										height: 110,
										background: 'rgba(99,102,241,0.12)',
										borderRadius: 8,
									}}
								/>
								<div
									style={{
										flex: 1,
										height: 120,
										background: 'rgba(99,102,241,0.12)',
										borderRadius: 8,
									}}
								/>
								<div
									style={{
										flex: 1,
										height: 70,
										background: 'rgba(99,102,241,0.12)',
										borderRadius: 8,
									}}
								/>
							</div>
						</div>

						<div className={styles.activityCard}>
							<div style={{ fontWeight: 800 }}>So'nggi faoliyat</div>
							<div
								style={{
									color: 'var(--muted)',
									marginTop: 6,
									marginBottom: 12,
								}}
							>
								Shaxsiy yangiliklar va xabarlar
							</div>

							{/* 1-faoliyat */}
							<div className={styles.activityItem}>
								<div
									className={styles.activityIcon}
									style={{ background: 'rgba(16,185,129,0.12)' }}
								>
									✓
								</div>
								<div>
									<div style={{ fontWeight: 800 }}>
										{summary.activity1 ||
											"Bugungi mashg'ulot muvaffaqiyatli yakunlandi"}
									</div>
									<div className={styles.muted} style={{ fontSize: 13 }}>
										15 daqiqa oldin
									</div>
								</div>
							</div>

							{/* 2-faoliyat */}
							<div className={styles.activityItem}>
								<div
									className={styles.activityIcon}
									style={{ background: 'rgba(14,165,233,0.12)' }}
								>
									🏃
								</div>
								<div>
									<div style={{ fontWeight: 800 }}>
										{summary.activity2 || 'Shaxsiy fitnes testi yangilandi'}
									</div>
									<div className={styles.muted} style={{ fontSize: 13 }}>
										1 soat oldin
									</div>
								</div>
							</div>

							{/* 3-faoliyat */}
							<div className={styles.activityItem}>
								<div
									className={styles.activityIcon}
									style={{ background: 'rgba(139,92,246,0.12)' }}
								>
									📅
								</div>
								<div>
									<div style={{ fontWeight: 800 }}>
										{summary.activity3 ||
											"Oxirgi o'yin statistikasi yangilandi"}
									</div>
									<div className={styles.muted} style={{ fontSize: 13 }}>
										3 soat oldin
									</div>
								</div>
							</div>

							{/* 4-faoliyat */}
							<div className={styles.activityItem}>
								<div
									className={styles.activityIcon}
									style={{ background: 'rgba(239,68,68,0.08)' }}
								>
									⚕️
								</div>
								<div>
									<div style={{ fontWeight: 800 }}>
										{summary.activity4 ||
											"Tibbiy bo'lim: sog'liq holati yangilandi"}
									</div>
									<div className={styles.muted} style={{ fontSize: 13 }}>
										Kecha, 18:30
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>{' '}
			{/* end dashboard */}
		</div>
	)
}
