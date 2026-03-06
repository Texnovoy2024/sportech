import React, { useState, useRef, useEffect } from 'react'
import './Profile.module.css'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useAuth } from '../../auth/AuthProvider'
import { findPlayerById } from '../../utils/playerProfiles'
import { loadPlayerDashboard } from '../../utils/playerDashboard'
import { loadPlayerTrainings } from '../../utils/playerTrainings'
import { loadPlayerGames } from '../../utils/playerGames'

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
	BarChart,
	Bar,
} from 'recharts'

const TABS = {
	OVERVIEW: 'overview',
	BIOMETRIC: 'biometric',
	TRAININGS: 'trainings',
	MATCHES: 'matches',
	MEDICAL: 'medical',
}

/* ---------- HELPERS ---------- */

// games massividan statistikalar chiqarish (faqat shu playerId bo‘yicha)
function buildGamesStats(games = [], playerId) {
	const filtered = playerId ? games.filter(g => g.playerId === playerId) : games

	const sorted = filtered
		.slice()
		.filter(g => g.date)
		.sort((a, b) => (a.date < b.date ? 1 : -1)) // eng yangi tepada

	const last5 = sorted.slice(0, 5)

	const sumGoals = arr =>
		arr.reduce((acc, g) => acc + (g.player?.goals || 0), 0)
	const sumAssists = arr =>
		arr.reduce((acc, g) => acc + (g.player?.assists || 0), 0)

	const totalGoals = sumGoals(sorted)
	const totalAssists = sumAssists(sorted)

	const last5Goals = sumGoals(last5)
	const last5Assists = sumAssists(last5)

	return {
		totalGames: sorted.length,
		totalGoals,
		totalAssists,
		last5Goals,
		last5Assists,
		recentGames: sorted.slice(0, 10),
	}
}

// trainings store sessions -> flat array
function flattenSessions(sessionsMap = {}) {
	const rows = []
	Object.entries(sessionsMap).forEach(([date, list]) => {
		;(list || []).forEach(s => {
			rows.push({ ...s, date })
		})
	})

	return rows.filter(r => r.date).sort((a, b) => (a.date < b.date ? 1 : -1)) // eng yangi tepada
}

function buildTrainingStats(sessions = []) {
	const now = new Date()
	const sevenDaysAgo = new Date(now)
	sevenDaysAgo.setDate(now.getDate() - 7)

	const inLastWeek = sessions.filter(s => {
		const d = new Date(s.date)
		return !Number.isNaN(d.getTime()) && d >= sevenDaysAgo && d <= now
	})

	const countWeek = inLastWeek.length
	const avgLoad =
		inLastWeek.length === 0
			? null
			: inLastWeek.reduce((acc, s) => acc + (s.load || 0), 0) /
			  inLastWeek.length

	return {
		weekCount: countWeek,
		weekAvgLoad: avgLoad,
		// jadval uchun hamma sessiyalar (allSessions allaqachon sort qilingan)
		recentSessions: sessions.slice(),
	}
}

// Oxirgi o‘yinlar bo‘yicha line chart data (overview uchun)
function buildGamesTrendData(recentGames = []) {
	return recentGames
		.slice()
		.reverse() // eng eski chapda
		.map((g, idx, arr) => ({
			id: g.id || idx,
			label: g.date || `O'yin ${arr.length - idx}`,
			goals: g.player?.goals ?? 0,
			assists: g.player?.assists ?? 0,
		}))
		.slice(-8)
}

// Biometrik trend: summary.biometricHistory asosida
function buildBiometricTrend(summary) {
	const history = summary?.biometricHistory
	if (!Array.isArray(history)) return []

	return history
		.filter(item => item.date)
		.sort((a, b) => (a.date > b.date ? 1 : -1))
		.map(item => ({
			date: item.date,
			height: item.heightCm ?? item.height ?? null,
			weight: item.weightKg ?? item.weight ?? null,
		}))
}

/* ---------- SECTION COMPONENTS ---------- */

function OverviewSection({ summary, gamesStats, trendData }) {
	const isEmpty = !summary?.configured
	const goalsLabel =
		gamesStats.last5Goals || gamesStats.last5Assists
			? `${gamesStats.last5Goals || 0}G / ${gamesStats.last5Assists || 0}A`
			: '3G / 2A'

	const rating = isEmpty ? '—' : summary.avgRating ?? '—'

	return (
		<>
			<div className='cards-row'>
				<div className='stat-card'>
					<div className='stat-title'>Oxirgi 5 o'yin</div>
					<div className='stat-value'>{goalsLabel}</div>
					<div className='stat-note'>
						{isEmpty
							? "Murabbiy hali ma'lumot kiritmagan"
							: summary.seasonImprovement || "Joriy mavsum bo'yicha"}
					</div>
				</div>

				<div className='stat-card'>
					<div className='stat-title'>O'rtacha reyting</div>
					<div className='stat-value'>{rating}</div>
					<div className='stat-note'>
						{isEmpty ? '' : "Oxirgi 5 o'yin bo'yicha"}
					</div>
				</div>
			</div>

			<div className='chart-card'>
				<div className='chart-title'>Rivojlanish trendi</div>

				{trendData && trendData.length > 0 ? (
					<div style={{ width: '100%', height: 260 }}>
						<ResponsiveContainer>
							<LineChart
								data={trendData}
								margin={{ top: 8, right: 16, left: -16, bottom: 8 }}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='label' tick={{ fontSize: 11 }} />
								<YAxis tick={{ fontSize: 11 }} />
								<Tooltip />
								<Legend />
								<Line
									type='monotone'
									dataKey='goals'
									name='Gollar'
									stroke='#16a34a'
									strokeWidth={2}
									dot={{ r: 4 }}
								/>
								<Line
									type='monotone'
									dataKey='assists'
									name='Assistlar'
									stroke='#0ea5e9'
									strokeWidth={2}
									dot={{ r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className='chart-placeholder'>Hali o‘yinlar kiritilmagan.</div>
				)}
			</div>
		</>
	)
}

function BiometricSection({ summary, biometricTrend, playerProfile }) {
  const height = playerProfile?.heightCm ?? summary?.heightCm;
  const weight = playerProfile?.weightKg ?? summary?.weightKg;
  const isEmpty = height == null && weight == null && !summary?.configured;

  // 👇 Grafikka beriladigan data:
  const trendData = biometricTrend || [];

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Biometrik o'sish</div>
          <div className="section-caption">
            Bo&apos;y, vazn va o&apos;sish bo&apos;yicha asosiy ko&apos;rsatkichlar
          </div>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="stat-title">Bo'y</div>
          <div className="stat-value">
            {height == null ? "—" : `${height} sm`}
          </div>
          <div className="stat-note muted">Murabbiy kiritgan qiymat</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Vazn</div>
          <div className="stat-value">
            {weight == null ? "—" : `${weight} kg`}
          </div>
          <div className="stat-note muted">Joriy vazn</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">O&apos;sish bo&apos;yicha izoh</div>
          <div className="stat-value">
            {isEmpty || !summary.heightChange ? "—" : summary.heightChange}
          </div>
          <div className="stat-note">
            {isEmpty ? "" : "So‘nggi davr bo‘yicha murabbiy izohi"}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">Jismoniy ko‘rsatkichlar trendi</div>

        {trendData && trendData.length > 0 ? (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart
                data={trendData}
                margin={{ top: 8, right: 16, left: -16, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  // Sana ko‘rinishini biroz chiroyliroq qilish (YYYY-12-10 -> 12-10)
                  tickFormatter={(d) => (d ? d.slice(5) : "")}
                />

                {/* chap – bo‘y (sm) */}
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  domain={["dataMin - 5", "dataMax + 5"]} // 👉 diapazonni maʼlumot atrofida toraytirish
                  label={{
                    value: "Bo'y (sm)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />

                {/* o‘ng – vazn (kg) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  domain={["dataMin - 5", "dataMax + 5"]}
                  label={{
                    value: "Vazn (kg)",
                    angle: 90,
                    position: "insideRight",
                    fontSize: 11,
                  }}
                />

                <Tooltip />
                <Legend />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="height"
                  name="Bo'y (sm)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="weight"
                  name="Vazn (kg)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-placeholder">
            Biometrik tarix hali kiritilmagan.
          </div>
        )}
      </div>
    </>
  );
}


function TrainingsSection({ trainingStats }) {
	const { weekCount, weekAvgLoad, recentSessions } = trainingStats

	const PAGE_SIZE = 5
	const [page, setPage] = useState(0)

	const totalPages = Math.max(1, Math.ceil(recentSessions.length / PAGE_SIZE))
	const safePage = Math.min(page, totalPages - 1)
	const start = safePage * PAGE_SIZE
	const pageSessions = recentSessions.slice(start, start + PAGE_SIZE)

	const handlePrev = () => {
		if (safePage > 0) setPage(safePage - 1)
	}

	const handleNext = () => {
		if (safePage < totalPages - 1) setPage(safePage + 1)
	}

	return (
		<>
			<div className='section-header'>
				<div>
					<div className='section-title'>Mashg'ulotlar</div>
					<div className='section-caption'>
						Murabbiy rejalashtirgan mashg&apos;ulotlar bo&apos;yicha qisqacha
						ko&apos;rinish
					</div>
				</div>
			</div>

			<div className='cards-row'>
				<div className='stat-card'>
					<div className='stat-title'>Haftalik mashg'ulotlar</div>
					<div className='stat-value'>{weekCount || 0} ta</div>
					<div className='stat-note'>
						{weekCount
							? 'Oxirgi 7 kun ichida'
							: "Hali mashg'ulotlar kiritilmagan"}
					</div>
				</div>

				<div className='stat-card'>
					<div className='stat-title'>O'rtacha yuklama</div>
					<div className='stat-value'>
						{weekAvgLoad != null ? `${weekAvgLoad.toFixed(1)} / 10` : '—'}
					</div>
					<div className='stat-note'>Treninglar bo‘yicha o‘rtacha ball</div>
				</div>
			</div>

			<div className='chart-card'>
				<div className='chart-title'>Kuch / tezlik / chidamlilik balansi</div>

				<div className='chart-placeholder' style={{ height: 260 }}>
					{recentSessions.length === 0 ? (
						<div className='chart-empty'>
							Hali mashg&apos;ulotlar kiritilmagan, shu sabab grafik yo&apos;q.
						</div>
					) : (
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={recentSessions
									.slice()
									.reverse()
									.map(s => ({
										date: s.date,
										load: s.load || 0,
									}))}
								margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='date' />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey='load' name='Yuklama (0–10)' />
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>

			<div className='table-card'>
				<div className='table-header'>
					<span>Sana</span>
					<span>Turi</span>
					<span>Yuklama</span>
					<span>Davomiyligi</span>
				</div>

				{pageSessions.length === 0 && (
					<div className='table-row'>
						<span colSpan={4}>Hali mashg'ulotlar kiritilmagan.</span>
					</div>
				)}

				{pageSessions.map(s => (
					<div key={s.id} className='table-row'>
						<span>{s.date}</span>
						<span>{s.type}</span>
						<span>{s.load ? `${s.load}/10` : '—'}</span>
						<span>{s.duration ? `${s.duration} daq.` : '—'}</span>
					</div>
				))}

				{recentSessions.length > PAGE_SIZE && (
					<div className='table-pagination'>
						<button onClick={handlePrev} disabled={safePage === 0}>
							{'<'}
						</button>
						<span>
							{safePage + 1} / {totalPages}
						</span>
						<button onClick={handleNext} disabled={safePage === totalPages - 1}>
							{'>'}
						</button>
					</div>
				)}
			</div>
		</>
	)
}

function MatchesSection({ gamesStats }) {
	const { totalGames, totalGoals, totalAssists, recentGames } = gamesStats

	const PAGE_SIZE = 5
	const [page, setPage] = useState(0)

	const totalPages = Math.max(
		1,
		Math.ceil((recentGames || []).length / PAGE_SIZE)
	)
	const safePage = Math.min(page, totalPages - 1)
	const start = safePage * PAGE_SIZE
	const pageGames = (recentGames || []).slice(start, start + PAGE_SIZE)

	const handlePrev = () => {
		if (safePage > 0) setPage(safePage - 1)
	}

	const handleNext = () => {
		if (safePage < totalPages - 1) setPage(safePage + 1)
	}

	return (
		<>
			<div className='section-header'>
				<div>
					<div className='section-title'>O'yinlar statistikasi</div>
					<div className='section-caption'>
						Oxirgi uchrashuvlar va ularning ta’siri
					</div>
				</div>
			</div>

			<div className='cards-row'>
				<div className='stat-card'>
					<div className='stat-title'>Jami o‘yinlar</div>
					<div className='stat-value'>{totalGames}</div>
					<div className='stat-note muted'>Bu mavsum (kiritilganlari)</div>
				</div>

				<div className='stat-card'>
					<div className='stat-title'>Jami G+A</div>
					<div className='stat-value'>
						{totalGoals + totalAssists} ({totalGoals}G / {totalAssists}A)
					</div>
					<div className='stat-note'>
						Gol + assist samaradorligi ko‘rsatkichlari
					</div>
				</div>
			</div>

			<div className='chart-card'>
				<div className='chart-title'>Oxirgi o‘yinlar dinamikasi</div>

				<div className='chart-placeholder' style={{ height: 260 }}>
					{recentGames.length === 0 ? (
						<div className='chart-empty'>
							Hali o&apos;yinlar kiritilmagan, grafik uchun ma&apos;lumot
							yo&apos;q.
						</div>
					) : (
						<ResponsiveContainer width='100%' height='100%'>
							<LineChart
								data={recentGames
									.slice()
									.reverse()
									.map(g => ({
										date: g.date,
										goals: g.player?.goals || 0,
										assists: g.player?.assists || 0,
										ga: (g.player?.goals || 0) + (g.player?.assists || 0),
									}))}
								margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='date' />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Legend />
								<Line
									type='monotone'
									dataKey='goals'
									name='Gollar'
									strokeWidth={2}
									dot={{ r: 3 }}
								/>
								<Line
									type='monotone'
									dataKey='assists'
									name='Assistlar'
									strokeWidth={2}
									dot={{ r: 3 }}
								/>
								<Line
									type='monotone'
									dataKey='ga'
									name='G+A'
									strokeWidth={2}
									strokeDasharray='4 4'
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>

			<div className='table-card'>
				<div className='table-header'>
					<span>Raqib</span>
					<span>Natija</span>
					<span>G/A</span>
					<span>Izoh</span>
				</div>

				{recentGames.length === 0 && (
					<div className='table-row'>
						<span>—</span>
						<span colSpan={3}>Hali o&apos;yinlar kiritilmagan.</span>
					</div>
				)}

				{pageGames.map(g => (
					<div key={g.id} className='table-row'>
						<span>
							{g.home?.name} vs {g.away?.name}
						</span>
						<span>
							{g.scoreHome}:{g.scoreAway} ({g.resultLabel})
						</span>
						<span>
							{g.player?.goals || 0}G / {g.player?.assists || 0}A
						</span>
						<span>{g.competition || '—'}</span>
					</div>
				))}

				{recentGames.length > PAGE_SIZE && (
					<div className='table-pagination'>
						<button onClick={handlePrev} disabled={safePage === 0}>
							{'<'}
						</button>
						<span>
							{safePage + 1} / {totalPages}
						</span>
						<button onClick={handleNext} disabled={safePage === totalPages - 1}>
							{'>'}
						</button>
					</div>
				)}
			</div>
		</>
	)
}

function MedicalSection({ summary }) {
	const isEmpty = !summary?.configured

	return (
		<>
			<div className='section-header'>
				<div>
					<div className='section-title'>Tibbiy bo'lim</div>
					<div className='section-caption'>
						Jarohatlar tarixi va sog‘liq holati bo‘yicha qisqacha ma’lumot
					</div>
				</div>
			</div>

			<div className='cards-row'>
				<div className='stat-card'>
					<div className='stat-title'>Joriy holat</div>
					<div className='stat-value'>
						{isEmpty || !summary.healthStatus ? '—' : summary.healthStatus}
					</div>
					<div className='stat-note badge badge-success inline-badge'>
						{isEmpty ? "Murabbiy hali ma'lumot kiritmagan" : 'O‘ynashga tayyor'}
					</div>
				</div>

				<div className='stat-card'>
					<div className='stat-title'>Oxirgi jarohat</div>
					<div className='stat-value'>
						{isEmpty || !summary.lastInjury ? '—' : summary.lastInjury}
					</div>
					<div className='stat-note muted'>
						Murabbiy dashboarddan kiritgan sana
					</div>
				</div>
			</div>

			<div className='table-card'>
				<div className='table-header'>
					<span>Sana</span>
					<span>Tur</span>
					<span>Davomiyligi</span>
					<span>Status</span>
				</div>
				<div className='table-row'>
					<span>{summary.lastInjury || '—'}</span>
					<span>Jarohat ma’lumoti</span>
					<span>—</span>
					<span className='badge'>Murabbiy tomonidan kiritiladi</span>
				</div>
			</div>
		</>
	)
}

/* ---------- SKELETON KOMPONENTLAR ---------- */

function ProfileHeaderSkeleton() {
	return (
		<div className='profile-card main'>
			<div className='avatar-skel' />
			<div className='profile-meta'>
				<div className='skel skel-line skel-line-lg' />
				<div className='skel skel-line skel-line-md' />
				<div className='skel skel-line skel-line-sm' />
			</div>
		</div>
	)
}

function ProfileTabsSkeleton() {
	return (
		<>
			<div className='tabs'>
				<div className='skel skel-pill' />
				<div className='skel skel-pill' />
				<div className='skel skel-pill' />
				<div className='skel skel-pill' />
				<div className='skel skel-pill' />
			</div>

			<div className='cards-row'>
				<div className='stat-card'>
					<div className='skel skel-line skel-line-md' />
					<div className='skel skel-line skel-line-lg' />
					<div className='skel skel-line skel-line-sm' />
				</div>
				<div className='stat-card'>
					<div className='skel skel-line skel-line-md' />
					<div className='skel skel-line skel-line-lg' />
					<div className='skel skel-line skel-line-sm' />
				</div>
			</div>

			<div className='chart-card'>
				<div
					className='skel skel-line skel-line-md'
					style={{ marginBottom: 12 }}
				/>
				<div className='skel skel-block' />
			</div>
		</>
	)
}

function PotentialCardSkeleton() {
	return (
		<div className='potent-card'>
			<div
				className='skel skel-line skel-line-md'
				style={{ width: '60%', marginBottom: 16 }}
			/>
			<div
				className='skel skel-circle'
				style={{
					width: 72,
					height: 72,
					borderRadius: '9999px',
					margin: '0 auto',
				}}
			/>
			<div
				className='skel skel-line skel-line-sm'
				style={{ width: '80%', margin: '16px auto 0' }}
			/>
		</div>
	)
}

/* ---------- ASOSIY KOMPONENT ---------- */

export default function Profile() {
	const { user } = useAuth()
	const currentPlayerId = user?.id || user?.playerId || 'demo-player-1'

	const [activeTab, setActiveTab] = useState(TABS.OVERVIEW)
	const pdfRef = useRef(null)

	const [summary, setSummary] = useState(() => loadPlayerDashboard())
	const [trainingsStore, setTrainingsStore] = useState(() =>
		loadPlayerTrainings()
	)
	const [gamesStore, setGamesStore] = useState(() => loadPlayerGames())

	const [playerProfile, setPlayerProfile] = useState(null)
	const [profileLoading, setProfileLoading] = useState(true)

	useEffect(() => {
		setSummary(loadPlayerDashboard())
		setTrainingsStore(loadPlayerTrainings())
		setGamesStore(loadPlayerGames())
	}, [])

	useEffect(() => {
		let cancelled = false
		setProfileLoading(true)

		const dashboard = loadPlayerDashboard()
		const trainings = loadPlayerTrainings()
		const games = loadPlayerGames()
		const profile = currentPlayerId ? findPlayerById(currentPlayerId) : null

		if (!cancelled) {
			setSummary(dashboard)
			setTrainingsStore(trainings)
			setGamesStore(games)
			setPlayerProfile(profile || null)
			setProfileLoading(false)
		}

		return () => {
			cancelled = true
		}
	}, [currentPlayerId])

	const allSessions = flattenSessions(trainingsStore.sessions)
	const trainingStats = buildTrainingStats(allSessions)
	const gamesStats = buildGamesStats(gamesStore.games || [], currentPlayerId)
	const overviewTrendData = buildGamesTrendData(gamesStats.recentGames || [])
	const biometricTrendData = buildBiometricTrend(summary)

	const renderTabContent = () => {
		switch (activeTab) {
			case TABS.OVERVIEW:
				return (
					<OverviewSection
						summary={summary}
						gamesStats={gamesStats}
						trendData={overviewTrendData}
					/>
				)
			case TABS.BIOMETRIC:
				return (
					<BiometricSection
						summary={summary}
						biometricTrend={biometricTrendData}
						playerProfile={playerProfile} // 👈 MUHIM!
					/>
				)
			case TABS.TRAININGS:
				return <TrainingsSection trainingStats={trainingStats} />
			case TABS.MATCHES:
				return <MatchesSection gamesStats={gamesStats} />
			case TABS.MEDICAL:
				return <MedicalSection summary={summary} />
			default:
				return null
		}
	}

	const handleDownloadPdf = async () => {
		if (!pdfRef.current) return

		const element = pdfRef.current

		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
		})

		const imgData = canvas.toDataURL('image/png')
		const pdf = new jsPDF('p', 'mm', 'a4')
		const pdfWidth = pdf.internal.pageSize.getWidth()
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width
		const pageHeight = pdf.internal.pageSize.getHeight()

		let heightLeft = pdfHeight
		let position = 0

		pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
		heightLeft -= pageHeight

		while (heightLeft > 0) {
			position -= pageHeight
			pdf.addPage()
			pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
			heightLeft -= pageHeight
		}

		pdf.save('player-profil.pdf')
	}

	const renderHeader = () => {
		if (profileLoading && !playerProfile) {
			return <ProfileHeaderSkeleton />
		}

		const hasProfile = !!playerProfile

		return (
			<div className='profile-card main'>
				{hasProfile && playerProfile.avatarUrl ? (
					<img
						src={playerProfile.avatarUrl}
						alt={playerProfile.fullName || 'Futbolchi'}
						className='avatar-img'
					/>
				) : (
					<div className='avatar-placeholder'>
						{hasProfile
							? (playerProfile.shortName || playerProfile.fullName || 'P')[0]
							: 'A'}
					</div>
				)}

				<div className='profile-meta'>
					<h2 className='player-name'>
						{hasProfile ? playerProfile.fullName : "Azizbek G'aniyev"}
					</h2>
					<div className='player-sub'>
						{hasProfile ? playerProfile.position : 'Hujumchi'}
					</div>
					<div className='player-mini'>
						{hasProfile ? (
							<>
								{playerProfile.age || '—'} yosh •{' '}
								{playerProfile.heightCm || '—'} sm •{' '}
								{playerProfile.weightKg || '—'} kg •{' '}
								{playerProfile.foot || "O'ng oyoq"}
							</>
						) : (
							<>21 yosh • 185 sm • 78 kg • O&apos;ng oyoq</>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			{/* PDF uchun yashirin layout */}
			<div className='profile-pdf-root' ref={pdfRef}>
				<div className='player-page'>
					<div className='player-container'>
						<div className='player-left-col'>
							<div className='profile-top'>
								{profileLoading ? <ProfileHeaderSkeleton /> : renderHeader()}
							</div>

							<div className='profile-tabs-card'>
								<OverviewSection
									summary={summary}
									gamesStats={gamesStats}
									trendData={overviewTrendData}
								/>
								<BiometricSection
									summary={summary}
									biometricTrend={biometricTrendData}
									playerProfile={playerProfile}
								/>
								<TrainingsSection trainingStats={trainingStats} />
								<MatchesSection gamesStats={gamesStats} />
								<MedicalSection summary={summary} />
							</div>
						</div>

						<aside className='player-right-col'>
							<div className='potent-card'>
								<div className='potent-title'>Potential Baholash</div>
								<div className='potent-ring'>Top 10%</div>
								<div className='potent-sub'>
									O&apos;z yosh toifasidagi eng yaxshi 10%
								</div>
							</div>
						</aside>
					</div>
				</div>
			</div>

			{/* Ekranda ko‘rinadigan layout */}
			<div className='player-page'>
				<div className='player-container'>
					<div className='player-left-col'>
						<div className='profile-top'>
							{profileLoading ? <ProfileHeaderSkeleton /> : renderHeader()}
						</div>

						<div className='profile-tabs-card'>
							<div className='tabs'>
								<button
									className={`tab ${
										activeTab === TABS.OVERVIEW ? 'active' : ''
									}`}
									onClick={() => setActiveTab(TABS.OVERVIEW)}
								>
									Umumiy ko&apos;rinish
								</button>
								<button
									className={`tab ${
										activeTab === TABS.BIOMETRIC ? 'active' : ''
									}`}
									onClick={() => setActiveTab(TABS.BIOMETRIC)}
								>
									Biometrik o&apos;sish
								</button>
								<button
									className={`tab ${
										activeTab === TABS.TRAININGS ? 'active' : ''
									}`}
									onClick={() => setActiveTab(TABS.TRAININGS)}
								>
									Mashg&apos;ulotlar
								</button>
								<button
									className={`tab ${
										activeTab === TABS.MATCHES ? 'active' : ''
									}`}
									onClick={() => setActiveTab(TABS.MATCHES)}
								>
									O&apos;yinlar
								</button>
								<button
									className={`tab ${
										activeTab === TABS.MEDICAL ? 'active' : ''
									}`}
									onClick={() => setActiveTab(TABS.MEDICAL)}
								>
									Tibbiy bo&apos;lim
								</button>
							</div>

							{profileLoading ? <ProfileTabsSkeleton /> : renderTabContent()}
						</div>
					</div>

					<aside className='player-right-col'>
						{profileLoading ? (
							<PotentialCardSkeleton />
						) : (
							<div className='potent-card'>
								<div className='potent-title'>Potential Baholash</div>
								<div className='potent-ring'>Top 10%</div>
								<div className='potent-sub'>
									O&apos;z yosh toifasidagi eng yaxshi 10%
								</div>
							</div>
						)}

						<div className='action-card'>
							<button
								className='btn-primary btn-full'
								onClick={handleDownloadPdf}
							>
								PDF sifatida yuklab olish
							</button>
						</div>
					</aside>
				</div>
			</div>
		</>
	)
}
