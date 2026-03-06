import React, { useMemo, useState } from 'react'
import styles from './Games.module.css'
import { loadPlayerGames } from '../../utils/playerGames'

// Oddiy demo heatmap generatsiyasi:
// agar selectedGame.heatmap bo'lmasa, pozitsiya va statistikaga qarab nuqtalar chizamiz
function buildDefaultHeatmap(player) {
	const raw = player.pos || ''
	const pos = raw.toLowerCase()

	// maydon: x (0–100 chapdan o'ngga), y (0–100 yuqoridan pastga)

	// 🔹 DARVOZABON
	if (pos === 'darvozabon') {
		return [
			{ x: 12, y: 45, intensity: 1 },
			{ x: 18, y: 55, intensity: 0.8 },
			{ x: 15, y: 50, intensity: 0.9 },
		]
	}

	// 🔹 MARKAZIY HIMOYACHI
	if (pos === 'markaziy himoyachi') {
		return [
			{ x: 25, y: 40, intensity: 0.9 },
			{ x: 28, y: 55, intensity: 0.8 },
			{ x: 22, y: 65, intensity: 0.7 },
		]
	}

	// 🔹 CHAP QANOT HIMOYACHISI
	if (pos === 'chap qanot himoyachisi') {
		return [
			{ x: 25, y: 30, intensity: 0.9 },
			{ x: 30, y: 40, intensity: 0.8 },
			{ x: 22, y: 55, intensity: 0.7 },
		]
	}

	// 🔹 O'NG QANOT HIMOYACHISI
	if (pos === "o'ng qanot himoyachisi" || pos === 'ong qanot himoyachisi') {
		return [
			{ x: 25, y: 70, intensity: 0.9 },
			{ x: 30, y: 60, intensity: 0.8 },
			{ x: 22, y: 80, intensity: 0.7 },
		]
	}

	// 🔹 YARIM HIMOYACHI (MARKAZ)
	if (pos === 'yarim himoyachi (markaz)') {
		return [
			{ x: 45, y: 45, intensity: 0.9 },
			{ x: 50, y: 55, intensity: 0.9 },
			{ x: 40, y: 60, intensity: 0.8 },
		]
	}

	// 🔹 HIMOYAVIY YARIM HIMOYACHI
	if (pos === 'himoyaviy yarim himoyachi') {
		return [
			{ x: 40, y: 45, intensity: 0.9 },
			{ x: 35, y: 55, intensity: 0.8 },
			{ x: 45, y: 60, intensity: 0.7 },
		]
	}

	// 🔹 Hujumkor yarim himoyachi
	if (pos === 'hujumkor yarim himoyachi') {
		return [
			{ x: 55, y: 45, intensity: 0.9 },
			{ x: 60, y: 55, intensity: 0.8 },
			{ x: 50, y: 60, intensity: 0.7 },
		]
	}

	// 🔹 Chap qanot hujumchisi
	if (pos === 'chap qanot hujumchisi') {
		return [
			{ x: 70, y: 30, intensity: 0.9 },
			{ x: 65, y: 40, intensity: 0.8 },
			{ x: 75, y: 45, intensity: 0.7 },
		]
	}

	// 🔹 O'ng qanot hujumchisi
	if (pos === "o'ng qanot hujumchisi" || pos === 'ong qanot hujumchisi') {
		return [
			{ x: 70, y: 70, intensity: 0.9 },
			{ x: 65, y: 60, intensity: 0.8 },
			{ x: 75, y: 55, intensity: 0.7 },
		]
	}

	// 🔹 Markaziy hujumchi
	if (pos === 'markaziy hujumchi' || pos === 'hujumchi') {
		return [
			{ x: 78, y: 45, intensity: 1 },
			{ x: 72, y: 55, intensity: 0.85 },
			{ x: 70, y: 35, intensity: 0.7 },
		]
	}

	// 🔹 Eski yozuvlar yoki notanish pozitsiya – umumiy fallback
	if (pos.includes('hujum')) {
		return [
			{ x: 75, y: 45, intensity: 0.95 },
			{ x: 70, y: 55, intensity: 0.8 },
			{ x: 68, y: 35, intensity: 0.7 },
		]
	}
	if (pos.includes('yarim')) {
		return [
			{ x: 50, y: 50, intensity: 0.9 },
			{ x: 45, y: 40, intensity: 0.75 },
			{ x: 55, y: 60, intensity: 0.75 },
		]
	}
	if (pos.includes('himoy')) {
		return [
			{ x: 30, y: 45, intensity: 0.9 },
			{ x: 28, y: 60, intensity: 0.8 },
			{ x: 32, y: 35, intensity: 0.7 },
		]
	}

	// default super-soddalashtirilgan markaz
	return [
		{ x: 50, y: 50, intensity: 0.9 },
		{ x: 45, y: 45, intensity: 0.7 },
		{ x: 55, y: 55, intensity: 0.7 },
	]
}

function formatDateUz(dateStr) {
  if (!dateStr) return ''

  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr

  const year = d.getFullYear()
  const day = d.getDate()
  const monthIndex = d.getMonth() // 0–11

  const monthsUz = [
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

  const monthName = monthsUz[monthIndex] || ''

  // 2025 yil 22 Dekabr
  return `${year} yil ${day} ${monthName}`
}


const PAGE_SIZE = 5

export default function Games() {
	const stored = loadPlayerGames()
	const games = stored.games || []

	// 🔹 Hozircha demo player ID (keyin auth'dan olasan)
	const currentPlayerId = 'demo-player-1'

	const [filterResult, setFilterResult] = useState('all') // all | win | draw | lose
	const [selectedId, setSelectedId] = useState(null)
	const [page, setPage] = useState(0) // 🔹 yangi

	// 🔹 Faqat shu playerga tegishli o'yinlar
	const myGames = useMemo(() => {
		if (!currentPlayerId) return games
		// playerId yo'q eski o'yinlar ham shu playerga tegishli deb qabul qilamiz
		return games.filter(g => !g.playerId || g.playerId === currentPlayerId)
	}, [games, currentPlayerId])

	const filteredGames = useMemo(() => {
		let list = myGames.slice().sort((a, b) => (a.date < b.date ? 1 : -1))
		if (filterResult === 'win') {
			list = list.filter(g => g.resultLabel?.toLowerCase().includes("g'alaba"))
		} else if (filterResult === 'draw') {
			list = list.filter(g => g.resultLabel?.toLowerCase().includes('durang'))
		} else if (filterResult === 'lose') {
			list = list.filter(g => g.resultLabel?.toLowerCase().includes("mag'lub"))
		}
		return list
	}, [myGames, filterResult])

	// 🔹 Pagination uchun hisob-kitob
	const maxPage = Math.max(0, Math.ceil(filteredGames.length / PAGE_SIZE) - 1)
	const currentPage = Math.min(page, maxPage)

	const pageGames = useMemo(() => {
		const start = currentPage * PAGE_SIZE
		return filteredGames.slice(start, start + PAGE_SIZE)
	}, [filteredGames, currentPage])

	const selectedGame =
		filteredGames.find(g => g.id === selectedId) || filteredGames[0]

	if (!selectedGame) {
		// umuman o'yin bo'lmasa
		return (
			<div className={styles.container}>
				<div className={styles.card}>
					<div className={styles.cardTitle}>O&apos;yinlar statistikasi</div>
					<div className={styles.cardSub}>
						Hozircha murabbiy tomonidan o&apos;yin statistikasi kiritilmagan
						yoki bu profil uchun mos keladigan o&apos;yin yo&apos;q.
					</div>
				</div>
			</div>
		)
	}

	const match = {
		home: selectedGame.home,
		away: selectedGame.away,
		scoreHome: selectedGame.scoreHome,
		scoreAway: selectedGame.scoreAway,
		resultLabel: selectedGame.resultLabel,
		date: selectedGame.date,
		competition: selectedGame.competition,
	}

	const player = selectedGame.player
	const teamStats = selectedGame.teamStats || null
	const dateLabel = formatDateUz(match.date)

	// Heatmap nuqtalar: agar selectedGame.heatmap bo'lsa – undan,
	// bo'lmasa demo ko'rinish (pozitsiya bo'yicha)
	const hotspots =
		selectedGame.heatmap && selectedGame.heatmap.length > 0
			? selectedGame.heatmap
			: buildDefaultHeatmap(player)

	const initials =
		player.name &&
		player.name
			.split(' ')
			.map(n => n[0])
			.slice(0, 2)
			.join('')

	return (
		<div className={styles.container}>
			{/* HISTORY CARD (filter + ro'yxat) */}
			<div className={styles.card} style={{ marginBottom: 18 }}>
				<div className={styles.cardTitle}>O&apos;yinlar tarixi</div>
				<div className={styles.cardSub}>
					Oxirgi o&apos;yinlar ro&apos;yxati. Biror o&apos;yinni bosib, pastdagi
					batafsil statistikani ko&apos;rishingiz mumkin.
				</div>

				<div className={styles.gamesFilterRow}>
					<div className={styles.gamesFilterWrapper}>
						<select
							value={filterResult}
							onChange={e => {
								setFilterResult(e.target.value)
								setPage(0)
							}}
							className={styles.gamesFilterSelect}
						>
							<option value='all'>Barcha natijalar</option>
							<option value='win'>Faqat g&apos;alaba</option>
							<option value='draw'>Durang</option>
							<option value='lose'>Mag&apos;lubiyat</option>
						</select>
						<span className={styles.gamesFilterArrow}>▾</span>
					</div>
				</div>

				{/* LIST + PAGINATION */}
				{filteredGames.length === 0 ? (
					// Hech qanday o'yin topilmasa
					<div className={styles.gameEmpty}>
						Tanlangan filter bo&apos;yicha o&apos;yin topilmadi.
					</div>
				) : (
					<>
						{/* Hozirgi betdagi 5 ta o'yin */}
						<div className={styles.gamesList}>
							{pageGames.map(g => (
								<button
									key={g.id}
									type='button'
									className={`${styles.gameItem} ${
										selectedGame.id === g.id ? styles.gameItemActive : ''
									}`}
									onClick={() => setSelectedId(g.id)}
								>
									<div>
										<div className={styles.gameTeams}>
											{g.home?.name} vs {g.away?.name}
										</div>
										<div className={styles.gameMeta}>
											{formatDateUz(g.date)} • {g.competition || 'Musobaqa'}
										</div>
									</div>
									<div className={styles.gameScore}>
										{g.scoreHome}:{g.scoreAway}
										<span className={styles.gameScoreLabel}>
											{g.resultLabel || ''}
										</span>
									</div>
								</button>
							))}
						</div>

						{/* Agar o'yinlar 5 tadan ko'p bo'lsa – pastida pagination */}
						{filteredGames.length > PAGE_SIZE && (
							<div className={styles.gamesPagination}>
								<button
									type='button'
									className={styles.gamesPageBtn}
									disabled={currentPage === 0}
									onClick={() => setPage(p => Math.max(0, p - 1))}
								>
									‹
								</button>
								<span className={styles.gamesPaginationLabel}>
									{currentPage + 1} / {maxPage + 1}
								</span>
								<button
									type='button'
									className={styles.gamesPageBtn}
									disabled={currentPage === maxPage}
									onClick={() => setPage(p => Math.min(maxPage, p + 1))}
								>
									›
								</button>
							</div>
						)}
					</>
				)}
			</div>

			{/* MATCH HEADER */}
			<section className={styles.matchBlock} aria-label='match-header'>
				{/* Home */}
				<div style={{ textAlign: 'left' }}>
					<div className={styles.teamName}>{match.home?.name || 'Home'}</div>
					<div className={styles.teamSub}>Home team</div>
				</div>

				{/* spacer */}
				<div />

				{/* Score center */}
				<div className={styles.scoreCenter}>
					<div className={styles.scoreBig}>
						{match.scoreHome ?? '-'} <span>-</span> {match.scoreAway ?? '-'}
					</div>
					<div className={styles.scoreStatus}>
						{match.resultLabel || 'Natija'}
					</div>
					<div className={styles.matchMeta}>
						{dateLabel}
						{match.competition && ` • ${match.competition}`}
					</div>
				</div>

				{/* spacer */}
				<div />

				{/* Away */}
				<div style={{ textAlign: 'right' }}>
					<div className={styles.teamName}>{match.away?.name || 'Away'}</div>
					<div className={styles.teamSub}>Away team</div>
				</div>
			</section>

			{/* PLAYER HEADER CARD */}
			<div className={styles.card} style={{ marginTop: 14 }}>
				<div className={styles.playerHeader}>
					<div className={styles.playerAvatar}>{initials}</div>
					<div>
						<div className={styles.playerNameBig}>
							#{player.number} {player.name}
						</div>
						<div className={styles.playerRoleBig}>
							{player.pos} • {player.minutes}&apos; daqiqa maydonda
						</div>
						<div className={styles.playerTagRow}>
							<span className={styles.playerTag}>Gollar: {player.goals}</span>
							<span className={styles.playerTag}>
								Assistlar: {player.assists}
							</span>
							<span className={styles.playerTag}>
								Masofa: {player.distanceKm} km
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ASOSIY GRID */}
			<div className={styles.mainGrid}>
				{/* Chap – O'yinchi statistikasi */}
				<div className={styles.card}>
					<div className={styles.cardTitle}>O'yinchi statistikasi</div>
					<div className={styles.cardSub}>
						Ushbu o'yindagi asosiy ko'rsatkichlar
					</div>

					<div className={styles.statsList}>
						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Maydonda</div>
							<div className={styles.singleVal}>
								{player.minutes}&apos; daqiqa
							</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Gollar</div>
							<div className={styles.singleVal}>
								{player.goals}{' '}
								<span className={styles.mutedSmall}>xG: {player.xG}</span>
							</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Assistlar</div>
							<div className={styles.singleVal}>{player.assists}</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Zarbalari (aniq)</div>
							<div className={styles.singleVal}>
								{player.shots}{' '}
								<span className={styles.mutedSmall}>
									({player.shotsOnTarget} aniq)
								</span>
							</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Uzatilgan paslar</div>
							<div className={styles.singleVal}>
								{player.passes}{' '}
								<span className={styles.mutedSmall}>
									• {player.passAccuracy}% aniqlik
								</span>
							</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Kalit paslar</div>
							<div className={styles.singleVal}>{player.keyPasses}</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Driblinglar (yutgan)</div>
							<div className={styles.singleVal}>
								{player.dribbles}{' '}
								<span className={styles.mutedSmall}>
									({player.dribblesWon} muvaffaqiyatli)
								</span>
							</div>
						</div>

						<div className={styles.statsRow}>
							<div className={styles.statLabel}>Bosib o‘tilgan masofa</div>
							<div className={styles.singleVal}>{player.distanceKm} km</div>
						</div>
					</div>
				</div>

				{/* O'ng – mini kartalar (team stats shu yerda) */}
				<aside className={styles.rightColumn}>
					{/* 1) Hujum samaradorligi */}
					<div className={styles.card}>
						<div className={styles.cardTitle}>Hujum samaradorligi</div>
						<div className={styles.cardSub}>
							Gol va zarbalar sifati bo'yicha qisqa ko'rsatkichlar
						</div>

						<div className={styles.metricRow}>
							<span>Gol konversiyasi</span>
							<span className={styles.metricVal}>
								{player.shots > 0
									? `${Math.round((player.goals / player.shots) * 100)}%`
									: '—'}
							</span>
						</div>

						<div className={styles.metricRow}>
							<span>Aniq zarba ulushi</span>
							<span className={styles.metricVal}>
								{player.shots > 0
									? `${Math.round(
											(player.shotsOnTarget / player.shots) * 100
									  )}%`
									: '—'}
							</span>
						</div>

						<div className={styles.metricRow}>
							<span>xG farqi</span>
							<span className={styles.metricVal}>
								{player.goals - player.xG >= 0 ? '+' : ''}
								{(player.goals - player.xG).toFixed(1)}
							</span>
						</div>
					</div>

					{/* 2) Jamoa statistikasi */}
					<div className={styles.card}>
						<div className={styles.cardTitle}>Jamoa statistikasi</div>
						<div className={styles.cardSub}>
							O&apos;yin davomida jamoa bo&apos;yicha asosiy ko&apos;rsatkichlar
						</div>

						{teamStats ? (
							<>
								<div className={styles.metricRow}>
									<span>To&apos;p egallash</span>
									<span className={styles.metricVal}>
										{teamStats.possession != null
											? `${teamStats.possession}%`
											: '—'}
									</span>
								</div>

								<div className={styles.metricRow}>
									<span>Umumiy zarbalar</span>
									<span className={styles.metricVal}>
										{teamStats.shots != null ? teamStats.shots : '—'}
									</span>
								</div>

								<div className={styles.metricRow}>
									<span>Aniq zarbalar</span>
									<span className={styles.metricVal}>
										{teamStats.shotsOnTarget != null
											? teamStats.shotsOnTarget
											: '—'}
									</span>
								</div>

								<div className={styles.metricRow}>
									<span>Paslar soni</span>
									<span className={styles.metricVal}>
										{teamStats.passes != null ? teamStats.passes : '—'}
									</span>
								</div>

								<div className={styles.metricRow}>
									<span>Pas aniqligi</span>
									<span className={styles.metricVal}>
										{teamStats.passAccuracy != null
											? `${teamStats.passAccuracy}%`
											: '—'}
									</span>
								</div>
							</>
						) : (
							<div className={styles.metricRow}>
								Ma&apos;lumot kiritilmagan.
							</div>
						)}
					</div>

					{/* 3) Asosiy harakatlar */}
					<div className={styles.card}>
						<div className={styles.cardTitle}>Asosiy harakatlar</div>
						<div className={styles.cardSub}>
							Ushbu o&apos;yinda futbolchi ko&apos;proq faol bo&apos;lgan
							zonalar
						</div>

						<div className={styles.heatmapPitch}>
							{/* Maydon chiziqlari uchun overlay */}
							<div className={styles.pitchLines} />

							{hotspots.map((p, idx) => (
								<div
									key={idx}
									className={styles.heatDot}
									style={{
										left: `${p.x}%`,
										top: `${p.y}%`,
										opacity: p.intensity ?? 0.9,
									}}
								/>
							))}
						</div>
					</div>

					{/* 4) Murabbiy izohi */}
					<div className={styles.card}>
						<div className={styles.cardTitle}>Murabbiy ning qisqa izohi</div>
						<p className={styles.notesText}>
							{player.coachNote ||
								'Murabbiy izoh kiritmagan (demo matn chiqarilmoqda).'}
						</p>
					</div>
				</aside>
			</div>
		</div>
	)
}
