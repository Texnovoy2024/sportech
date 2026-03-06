// src/pages/coach/CoachGames.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { loadPlayerGames, savePlayerGames } from '../../utils/playerGames'
import './CoachGames.css'
import { Pencil, Trash2 } from 'lucide-react'

const POSITION_OPTIONS = [
	'Darvozabon',
	'Markaziy himoyachi',
	'Chap qanot himoyachisi',
	"O'ng qanot himoyachisi",
	'Yarim himoyachi (markaz)',
	'Himoyaviy yarim himoyachi',
	'Hujumkor yarim himoyachi',
	'Chap qanot hujumchisi',
	"O'ng qanot hujumchisi",
	'Markaziy hujumchi',
]

const PAGE_SIZE = 5

const DEFAULT_FORM = {
	date: '',
	competition: '',
	homeTeam: 'FC Progress',
	awayTeam: 'Rakib FC',
	scoreHome: 0,
	scoreAway: 0,
	resultLabel: "G'alaba",

	playerId: 'demo-player-1',
	playerName: '',
	playerPos: 'Markaziy hujumchi',
	playerNumber: 9,
	coachNote: '',
}

function formatDateUz(dateStr) {
	if (!dateStr) return ''
	const d = new Date(dateStr)
	if (Number.isNaN(d.getTime())) return dateStr

	const months = [
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
	return `${d.getFullYear()} yil ${d.getDate()} ${months[d.getMonth()]}`
}

export default function CoachGames() {
	const [form, setForm] = useState(DEFAULT_FORM)
	const [games, setGames] = useState([])
	const [page, setPage] = useState(0)
	const [editingId, setEditingId] = useState(null)

	// 🔴 delete modal state
	const [deleteGame, setDeleteGame] = useState(null)

	useEffect(() => {
		const stored = loadPlayerGames()
		setGames(stored.games || [])
	}, [])

	const handleChange = e => {
		const { name, value } = e.target
		setForm(f => ({ ...f, [name]: value }))
	}

	/* ---------------- SAVE / UPDATE ---------------- */
	const handleSubmit = e => {
		e.preventDefault()

		const stored = loadPlayerGames()
		const prev = stored.games || []

		const game = {
			id: editingId || Date.now(),
			date: form.date,
			competition: form.competition,
			home: { name: form.homeTeam },
			away: { name: form.awayTeam },
			scoreHome: Number(form.scoreHome),
			scoreAway: Number(form.scoreAway),
			resultLabel: form.resultLabel,
			playerId: form.playerId,
			player: {
				name: form.playerName,
				pos: form.playerPos,
				number: Number(form.playerNumber),
				coachNote: form.coachNote,
			},
		}

		const next = editingId
			? prev.map(g => (g.id === editingId ? game : g))
			: [...prev, game]

		savePlayerGames({ games: next })
		setGames(next)
		setEditingId(null)
		setForm(DEFAULT_FORM)
		setPage(0)
	}

	/* ---------------- EDIT ---------------- */
	const handleEdit = game => {
		setEditingId(game.id)
		setForm({
			date: game.date,
			competition: game.competition || '',
			homeTeam: game.home?.name || '',
			awayTeam: game.away?.name || '',
			scoreHome: game.scoreHome,
			scoreAway: game.scoreAway,
			resultLabel: game.resultLabel,
			playerId: game.playerId,
			playerName: game.player?.name || '',
			playerPos: game.player?.pos || 'Markaziy hujumchi',
			playerNumber: game.player?.number || 9,
			coachNote: game.player?.coachNote || '',
		})
	}

	/* ---------------- DELETE ---------------- */
	const confirmDelete = () => {
		const stored = loadPlayerGames()
		const next = (stored.games || []).filter(g => g.id !== deleteGame.id)
		savePlayerGames({ games: next })
		setGames(next)
		setDeleteGame(null)
	}

	/* ---------------- SORT + PAGINATION ---------------- */
	const sortedGames = useMemo(
		() => [...games].sort((a, b) => (a.date < b.date ? 1 : -1)),
		[games],
	)

	const maxPage = Math.max(0, Math.ceil(sortedGames.length / PAGE_SIZE) - 1)
	const currentPage = Math.min(page, maxPage)

	const pageGames = sortedGames.slice(
		currentPage * PAGE_SIZE,
		currentPage * PAGE_SIZE + PAGE_SIZE,
	)

	return (
		<div>
			<div className='cg-grid'>
				{/* LEFT */}
				<div className='pl-card'>
					<div className='pl-cardTitle'>
						{editingId ? 'O‘yinni tahrirlash' : 'Yangi o‘yin qo‘shish'}
					</div>

					<form onSubmit={handleSubmit} className='cg-form'>
						<div className='pl-fieldRow'>
							<div className='pl-field'>
								<label>Sana</label>
								<input
									type='date'
									name='date'
									value={form.date}
									onChange={handleChange}
									required
								/>
							</div>

							<div className='pl-field'>
								<label>Musobaqa</label>
								<input
									name='competition'
									value={form.competition}
									onChange={handleChange}
								/>
							</div>

							<div className='pl-field'>
								<label>Natija</label>
								<input
									name='resultLabel'
									value={form.resultLabel}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className='pl-fieldRow'>
							<div className='pl-field'>
								<label>Home</label>
								<input
									name='homeTeam'
									value={form.homeTeam}
									onChange={handleChange}
								/>
							</div>

							<div className='pl-field'>
								<label>Away</label>
								<input
									name='awayTeam'
									value={form.awayTeam}
									onChange={handleChange}
								/>
							</div>

							<div className='pl-field'>
								<label>Hisob</label>
								<div className='cg-scoreRow'>
									<input
										type='number'
										name='scoreHome'
										value={form.scoreHome}
										onChange={handleChange}
									/>
									<span>-</span>
									<input
										type='number'
										name='scoreAway'
										value={form.scoreAway}
										onChange={handleChange}
									/>
								</div>
							</div>
						</div>

						<hr className='cg-divider' />

						<div className='cg-sectionTitle'>Futbolchi statistikasi</div>

						<div className='pl-fieldRow'>
							<div className='pl-field'>
								<label>Ism</label>
								<input
									name='playerName'
									value={form.playerName}
									onChange={handleChange}
								/>
							</div>

							<div className='pl-field'>
								<label>Pozitsiya</label>
								<select
									name='playerPos'
									value={form.playerPos}
									onChange={handleChange}
								>
									{POSITION_OPTIONS.map(p => (
										<option key={p}>{p}</option>
									))}
								</select>
							</div>

							<div className='pl-field'>
								<label>Raqam</label>
								<input
									type='number'
									name='playerNumber'
									value={form.playerNumber}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className='pl-field'>
							<label>Murabbiy izohi</label>
							<textarea
								className='cg-textarea'
								name='coachNote'
								value={form.coachNote}
								onChange={handleChange}
							/>
						</div>

						<div className='cg-formButtons'>
							<button className='primary-button' type='submit'>
								{editingId ? 'O‘zgarishlarni saqlash' : 'Saqlash'}
							</button>
						</div>
					</form>
				</div>

				{/* RIGHT */}
				<div className='pl-card cg-side'>
					<div className='pl-cardTitle'>O'yinlar ro'yxati</div>

					<table className='cg-table'>
						<thead>
							<tr>
								<th>Sana</th>
								<th>Jamoalar</th>
								<th>Hisob</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{pageGames.map(g => (
								<tr key={g.id}>
									<td>{formatDateUz(g.date)}</td>
									<td>
										{g.home.name} – {g.away.name}
									</td>
									<td>
										{g.scoreHome}:{g.scoreAway}
									</td>
									<td>
										<td>
											<div className='cg-actions'>
												<button
													className='cg-action cg-edit'
													onClick={() => handleEdit(g)}
													title='Tahrirlash'
												>
													<Pencil size={16} />
													<span>Tahrirlash</span>
												</button>

												<button
													className='cg-action cg-delete'
													onClick={() => setDeleteGame(g)}
													title='O‘chirish'
												>
													<Trash2 size={16} />
													<span>O‘chirish</span>
												</button>
											</div>
										</td>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{sortedGames.length > PAGE_SIZE && (
						<div className='cg-pagination'>
							<button
								disabled={currentPage === 0}
								onClick={() => setPage(p => p - 1)}
							>
								‹ Oldingi
							</button>
							<span>
								{currentPage + 1} / {maxPage + 1}
							</span>
							<button
								disabled={currentPage === maxPage}
								onClick={() => setPage(p => p + 1)}
							>
								Keyingi ›
							</button>
						</div>
					)}
				</div>
			</div>

			{/* 🔴 DELETE MODAL */}
			{deleteGame && (
				<div className='cg-modalOverlay'>
					<div className='cg-modal'>
						<h3>O‘yinni o‘chirmoqchimisiz?</h3>
						<p>
							{formatDateUz(deleteGame.date)} — {deleteGame.home.name} vs{' '}
							{deleteGame.away.name}
						</p>

						<div className='cg-modalActions'>
							<button onClick={() => setDeleteGame(null)}>Bekor</button>
							<button className='danger' onClick={confirmDelete}>
								Ha, o‘chirish
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
