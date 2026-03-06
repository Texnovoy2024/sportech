import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
	loadPlayerProfiles,
	savePlayerProfiles,
} from '../../utils/playerProfiles'

export default function PlayerProfile() {
	const { id } = useParams()
	const navigate = useNavigate()

	const [isEditing, setIsEditing] = useState(false)
	const [player, setPlayer] = useState(null)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const fileRef = useRef()

	/* LOAD PLAYER */

	useEffect(() => {
		const store = loadPlayerProfiles()
		const found = store.players.find(
			p => p.playerId === id || String(p.id) === id,
		)

		if (found) {
			setPlayer({
				...found,
				metrics: found.metrics || {
					speed: 30,
					shotAccuracy: 70,
					passCompletion: 75,
					distance: 10,
					aerial: 60,
					tackles: 65,
				},
				potential: found.potential || 80,
				ranking: found.ranking || {
					pace: 80,
					shooting: 75,
					dribbling: 78,
				},
				matches: found.matches || [1, 2, 1, 3, 2],
			})
		}
	}, [id])

	if (!player) return <div>Yuklanmoqda...</div>

	/* CHANGE */
	const handleImageChange = e => {
		const file = e.target.files[0]
		if (!file) return

		const reader = new FileReader()

		reader.onload = () => {
			setPlayer(p => ({
				...p,
				avatarUrl: reader.result,
			}))
		}

		reader.readAsDataURL(file)
	}

	const change = (k, v) => setPlayer(p => ({ ...p, [k]: v }))

	const changeMetric = (k, v) =>
		setPlayer(p => ({
			...p,
			metrics: { ...p.metrics, [k]: Number(v) },
		}))

	const changeRanking = (k, v) =>
		setPlayer(p => ({
			...p,
			ranking: { ...p.ranking, [k]: Number(v) },
		}))

	const changeMatch = (i, v) => {
		const arr = [...player.matches]
		arr[i] = Number(v)
		setPlayer(p => ({ ...p, matches: arr }))
	}

	/* SAVE */

	const toggleEdit = () => {
		if (isEditing) {
			const store = loadPlayerProfiles()

			const updated = store.players.map(p =>
				p.playerId === player.playerId ? player : p,
			)

			savePlayerProfiles({ players: updated })
		}

		setIsEditing(!isEditing)
	}

	/* DELETE */

	const handleDelete = () => {
		const store = loadPlayerProfiles()

		const filtered = store.players.filter(p => p.playerId !== player.playerId)

		savePlayerProfiles({ players: filtered })

		navigate('/coach')
	}

	/* UI */

	return (
		<div className='pp-page'>
			{/* HEADER */}
			<div className='pp-header'>
				<div className='pp-player'>
					<div style={{ position: 'relative' }}>
						<img
							src={player.avatarUrl || 'https://i.pravatar.cc/150'}
							className='pp-avatar'
							onClick={() => {
								if (isEditing) fileRef.current.click()
							}}
							style={{
								cursor: isEditing ? 'pointer' : 'default',
							}}
						/>

						{isEditing && (
							<input
								type='file'
								accept='image/*'
								ref={fileRef}
								style={{ display: 'none' }}
								onChange={handleImageChange}
							/>
						)}
					</div>

					<div>
						{isEditing ? (
							<input
								value={player.fullName}
								onChange={e => change('fullName', e.target.value)}
							/>
						) : (
							<h2>{player.fullName}</h2>
						)}

						{isEditing ? (
							<input
								value={player.position}
								onChange={e => change('position', e.target.value)}
							/>
						) : (
							<p>{player.position}</p>
						)}

						<div className='pp-meta'>
							{isEditing ? (
								<>
									<input
										value={player.age}
										onChange={e => change('age', e.target.value)}
									/>

									<input
										value={player.heightCm}
										onChange={e => change('heightCm', e.target.value)}
									/>

									<input
										value={player.weightKg}
										onChange={e => change('weightKg', e.target.value)}
									/>
								</>
							) : (
								<>
									<span>Yosh: {player.age}</span>
									<span>Bo‘y: {player.heightCm} sm</span>
									<span>Vazn: {player.weightKg} kg</span>
								</>
							)}
						</div>
					</div>
				</div>

				<div className='pp-actions'>
					<button onClick={() => navigate(-1)}>← Orqaga</button>

					<button onClick={toggleEdit}>
						{isEditing ? 'Saqlash' : 'Tahrirlash'}
					</button>

					<button className='danger' onClick={() => setShowDeleteModal(true)}>
						O‘chirish
					</button>
				</div>
			</div>

			{/* GRID */}
			<div className='pp-grid'>
				<div className='card metrics'>
					<h4>Asosiy ko‘rsatkichlar</h4>

					{Object.entries(player.metrics).map(([k, v]) => (
						<Metric
							key={k}
							title={metricNames[k]}
							value={v}
							editing={isEditing}
							onChange={val => changeMetric(k, val)}
						/>
					))}
				</div>

				<div className='card chart'>
					<h4>Oxirgi 5 o‘yin (Gollar)</h4>

					<div className='bars'>
						{player.matches.map((g, i) =>
							isEditing ? (
								<input
									key={i}
									type='number'
									value={g}
									onChange={e => changeMatch(i, e.target.value)}
								/>
							) : (
								<div key={i} style={{ height: g * 28 }} />
							),
						)}
					</div>
				</div>

				<div className='card score'>
					<div className='circle'>
						{isEditing ? (
							<input
								type='number'
								value={player.potential}
								onChange={e => change('potential', e.target.value)}
							/>
						) : (
							<span>{player.potential}</span>
						)}
					</div>
					<p>Salohiyat bahosi</p>
				</div>

				<div className='card rank'>
					<h4>Foizlik reyting</h4>

					{Object.entries(player.ranking).map(([k, v]) => (
						<Rank
							key={k}
							title={rankingNames[k]}
							value={v}
							editing={isEditing}
							onChange={val => changeRanking(k, val)}
						/>
					))}
				</div>
			</div>

			{/* DELETE MODAL */}

			{showDeleteModal && (
				<div className='delete-modal-overlay'>
					<div className='delete-modal'>
						<h3>Futbolchini o‘chirmoqchimisiz?</h3>
						<p>{player.fullName}</p>

						<div className='delete-actions'>
							<button onClick={() => setShowDeleteModal(false)}>Bekor</button>

							<button className='danger' onClick={handleDelete}>
								Ha, o‘chirish
							</button>
						</div>
					</div>

					<style>{`

            .delete-modal-overlay{
              position:fixed;
              inset:0;
              background:rgba(0,0,0,.35);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index:999;
            }

            .delete-modal{
              background:white;
              padding:28px 32px;
              border-radius:18px;
              width:360px;
              text-align:center;
              box-shadow:0 20px 60px rgba(0,0,0,.18);
            }

            .delete-actions{
              display:flex;
              gap:12px;
              justify-content:center;
              margin-top:18px;
            }

          `}</style>
				</div>
			)}
		</div>
	)
}

/* NAMES */

const metricNames = {
	speed: 'Eng yuqori tezlik',
	shotAccuracy: 'Zarba aniqligi',
	passCompletion: 'Pas aniqligi',
	distance: 'Masofa / 90 daqiqa',
	aerial: 'Havo kurashlari',
	tackles: 'To‘p olib qo‘yish',
}

const rankingNames = {
	pace: 'Tezlik',
	shooting: 'Zarba',
	dribbling: 'Dribling',
}

/* COMPONENTS */

function Metric({ title, value, editing, onChange }) {
	return (
		<div>
			<small>{title}</small>

			{editing ? (
				<input
					type='number'
					value={value}
					onChange={e => onChange(e.target.value)}
				/>
			) : (
				<h3>{value}</h3>
			)}
		</div>
	)
}

function Rank({ title, value, editing, onChange }) {
	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
				}}
			>
				{title}

				{editing ? (
					<input
						type='number'
						value={value}
						onChange={e => onChange(e.target.value)}
					/>
				) : (
					<span>{value}%</span>
				)}
			</div>

			<div className='rank-bar'>
				<div style={{ width: value + '%' }} />
			</div>

			{/* 🔥 SEN BERGAN STYLE — JOYIGA QO‘YILDI */}
			<style>{`

      /* OVERLAY */

      .delete-modal-overlay{
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        backdrop-filter:blur(6px);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:999;
        animation:fade .18s ease;
      }

      /* MODAL BOX */

      .delete-modal{
        background:white;
        padding:32px 36px;
        border-radius:22px;
        width:420px;
        max-width:92%;
        text-align:center;
        box-shadow:
          0 30px 80px rgba(0,0,0,.25),
          0 6px 18px rgba(0,0,0,.12);
        animation:pop .18s ease;
      }

      /* TITLE */

      .delete-modal h3{
        margin:0 0 10px;
        font-size:22px;
        font-weight:800;
        color:#0f172a;
      }

      /* PLAYER NAME */

      .delete-modal p{
        margin:0 0 26px;
        font-size:16px;
        color:#64748b;
        font-weight:500;
      }

      /* ACTIONS */

      .delete-actions{
        display:flex;
        gap:14px;
        justify-content:center;
      }

      /* BUTTON BASE */

      .delete-actions button{
        padding:12px 22px;
        border:none;
        border-radius:12px;
        font-weight:700;
        font-size:14px;
        cursor:pointer;
        transition:.18s ease;
      }

      /* CANCEL */

      .delete-actions button:first-child{
        background:#f1f5f9;
        color:#0f172a;
      }

      .delete-actions button:first-child:hover{
        background:#e2e8f0;
      }

      /* DELETE */

      .delete-actions .danger{
        background:#dc2626;
        color:white;
        box-shadow:0 6px 16px rgba(220,38,38,.35);
      }

      .delete-actions .danger:hover{
        background:#b91c1c;
        transform:translateY(-1px);
        box-shadow:0 10px 22px rgba(220,38,38,.45);
      }

      /* ANIMATIONS */

      @keyframes fade{
        from{opacity:0}
        to{opacity:1}
      }

      @keyframes pop{
        from{
          transform:scale(.92);
          opacity:0;
        }
        to{
          transform:scale(1);
          opacity:1;
        }
      }

      `}</style>

			<style>{`

      /* PAGE */

      .pp-page{
        display:flex;
        flex-direction:column;
        gap:24px;
        padding:4px;
      }

      .pp-header{
        background:var(--card-bg);
        padding:20px 24px;
        border-radius:16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        box-shadow:0 8px 26px var(--shadow);
      }

      .pp-player{
        display:flex;
        gap:16px;
        align-items:center;
      }

      .pp-avatar{
        width:84px;
        height:84px;
        border-radius:50%;
        object-fit:cover;
        box-shadow:0 4px 12px rgba(0,0,0,.12);
      }

      .pp-header h2{
        margin:0;
        font-size:22px;
        font-weight:800;
        color:var(--text-dark);
      }

      .pp-header p{
        margin:2px 0 6px;
        color:var(--muted);
      }

      .pp-meta{
        display:flex;
        gap:14px;
        font-size:13px;
        color:var(--muted);
      }

      .pp-actions button{
        margin-left:10px;
        padding:10px 16px;
        border:none;
        border-radius:10px;
        font-weight:600;
        cursor:pointer;
        background:#eef2ff;
      }

      .danger{
        background:#dc2626 !important;
        color:white;
      }

      .pp-grid{
        display:grid;
        grid-template-columns:1.2fr 2fr 1fr;
        gap:20px;
      }

      .card{
        background:white;
        padding:20px;
        border-radius:16px;
        box-shadow:0 6px 18px rgba(0,0,0,.05);
      }

      .metrics{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:14px;
      }

      .chart .bars{
        display:flex;
        gap:14px;
        align-items:flex-end;
        height:160px;
        margin-top:20px;
      }

      .chart .bars div{
        width:28px;
        background:#10b981;
        border-radius:8px;
      }

      .score{
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
      }

      .circle{
        width:120px;
        height:120px;
        border-radius:50%;
        border:10px solid #10b981;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
        font-weight:800;
        margin-bottom:10px;
      }

      .rank-bar{
        height:6px;
        background:#e5e7eb;
        border-radius:6px;
        margin-top:6px;
      }

      .rank-bar div{
        height:100%;
        background:#10b981;
        border-radius:6px;
      }

      `}</style>
		</div>
	)
}
