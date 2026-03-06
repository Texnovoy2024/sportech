// src/pages/coach/CoachTrainings.jsx
import React, { useEffect, useState } from 'react'
import {
	loadPlayerTrainings,
	savePlayerTrainings,
} from '../../utils/playerTrainings'
import './CoachTrainings.css'

function isoDateKeyFromString(str) {
	return str
}

export default function CoachTrainings() {
	const [store, setStore] = useState(() => loadPlayerTrainings())
	const [form, setForm] = useState({
		date: '',
		type: "Jismoniy mashg'ulot",
		title: '',
		timeFrom: '09:00',
		timeTo: '10:30',
		duration: 90,
		load: 8,
		label: 'Shaxsiy reja',
		theme: 'green', 
	})

	const [selectedDate, setSelectedDate] = useState('')

	useEffect(() => {
		const fresh = loadPlayerTrainings()
		setStore(fresh)
	}, [])

	const handleChange = e => {
		const { name, value } = e.target
		setForm(f => ({ ...f, [name]: value }))
	}

	const handleSubmit = e => {
		e.preventDefault()
		if (!form.date || !form.title) return

		const dateKey = isoDateKeyFromString(form.date)
		const currentSessions = store.sessions[dateKey] || []

		const newSession = {
			id: Date.now(),
			type: form.type,
			title: form.title,
			timeFrom: form.timeFrom,
			timeTo: form.timeTo,
			duration: Number(form.duration) || 0,
			load: Number(form.load) || 0,
			label: form.label,
			labelVariant: form.theme === 'blue' ? 'light' : undefined,
			theme: form.theme,
			color: form.theme === 'blue' ? 'blue' : 'green',
		}

		const updatedSessionsForDay = [...currentSessions, newSession]

		const updatedSessions = {
			...store.sessions,
			[dateKey]: updatedSessionsForDay,
		}

		const updatedEvents = {
			...store.events,
			[dateKey]: updatedSessionsForDay.map(s => ({
				color: s.color || 'blue',
			})),
		}

		const next = savePlayerTrainings({
			sessions: updatedSessions,
			events: updatedEvents,
		})

		setStore(next)
		setSelectedDate(dateKey)

		setForm(f => ({
			...f,
			title: '',
		}))
	}

	const handleDelete = (dateKey, id) => {
		const currentSessions = store.sessions[dateKey] || []
		const updatedSessionsForDay = currentSessions.filter(s => s.id !== id)

		const updatedSessions = { ...store.sessions }
		if (updatedSessionsForDay.length === 0) {
			delete updatedSessions[dateKey]
		} else {
			updatedSessions[dateKey] = updatedSessionsForDay
		}

		const updatedEvents = { ...store.events }
		if (updatedSessionsForDay.length === 0) {
			delete updatedEvents[dateKey]
		} else {
			updatedEvents[dateKey] = updatedSessionsForDay.map(s => ({
				color: s.color || 'blue',
			}))
		}

		const next = savePlayerTrainings({
			sessions: updatedSessions,
			events: updatedEvents,
		})

		setStore(next)
	}

	const selectedKey = selectedDate || form.date || ''
	const sessionsForSelected = (selectedKey && store.sessions[selectedKey]) || []

	return (
		<div>
			<div className='pl-gridTwo'>
				<div className='pl-card'>
					<div className='pl-cardTitle'>
						Yangi mashg&apos;ulot qo&apos;shish
					</div>

					<form onSubmit={handleSubmit} className='pl-form'>
						<div className='pl-fieldRow'>
							<div className='pl-field'>
								<label>Sana</label>
								<input
									type='date'
									name='date'
									value={form.date}
									onChange={e => {
										handleChange(e)
										setSelectedDate(e.target.value)
									}}
									required
								/>
							</div>

							<div className='pl-field'>
								<label>Tur</label>
								<select name='type' value={form.type} onChange={handleChange}>
									<option value="Jismoniy mashg'ulot">
										Jismoniy mashg&apos;ulot
									</option>
									<option value="Taktik mashg'ulot">
										Taktik mashg&apos;ulot
									</option>
									<option value="Texnik mashg'ulot">
										Texnik mashg&apos;ulot
									</option>
									<option value="Tiklanish mashg'uloti">
										Tiklanish mashg&apos;uloti
									</option>
								</select>
							</div>
						</div>

						<div className='pl-field'>
							<label>Nomi</label>
							<input
								type='text'
								name='title'
								placeholder="Masalan: Yuqori intensivlikdagi interval mashg'uloti"
								value={form.title}
								onChange={handleChange}
								required
							/>
						</div>

						<div className='pl-fieldRow'>
							<div className='pl-field'>
								<label>Boshlanish vaqti (24 soat)</label>
								<input
									type='text'
									name='timeFrom'
									value={form.timeFrom}
									onChange={handleChange}
									placeholder='09:00'
									inputMode='numeric'
									pattern='^([01]\d|2[0-3]):[0-5]\d$'
									title='Vaqtni HH:MM (masalan, 09:00 yoki 21:30) formatda kiriting'
									required
								/>
							</div>

							<div className='pl-field'>
								<label>Tugash vaqti (24 soat)</label>
								<input
									type='text'
									name='timeTo'
									value={form.timeTo}
									onChange={handleChange}
									placeholder='10:30'
									inputMode='numeric'
									pattern='^([01]\d|2[0-3]):[0-5]\d$'
									title='Vaqtni HH:MM (masalan, 10:30 yoki 22:15) formatda kiriting'
									required
								/>
							</div>

							<div className='pl-field'>
								<label>Davomiyligi (daq.)</label>
								<input
									type='number'
									name='duration'
									value={form.duration}
									onChange={handleChange}
									min={0}
								/>
							</div>
						</div>

						<div className='pl-fieldRow'>
							<div className='pl-field'>
								<label>Yuklama (1–10)</label>
								<input
									type='number'
									name='load'
									value={form.load}
									onChange={handleChange}
									min={1}
									max={10}
								/>
							</div>
							<div className='pl-field'>
								<label>Turi (badge)</label>
								<select name='label' value={form.label} onChange={handleChange}>
									<option value='Shaxsiy reja'>Shaxsiy reja</option>
									<option value="Guruh mashg'uloti">
										Guruh mashg&apos;uloti
									</option>
									<option value='Tiklanish'>Tiklanish</option>
								</select>
							</div>
							<div className='pl-field'>
								<label>Karta rangi</label>
								<select name='theme' value={form.theme} onChange={handleChange}>
									<option value='green'>Yashil (jismoniy)</option>
									<option value='blue'>Ko&apos;k (taktik)</option>
								</select>
							</div>
						</div>

						<button type='submit' className='primary-button'>
							Mashg&apos;ulotni saqlash
						</button>
					</form>
				</div>

				<div className='pl-card'>
					<div className='pl-cardTitle'>
						Tanlangan sana bo&apos;yicha mashg&apos;ulotlar
					</div>

					{!selectedKey && (
						<div className='pl-cardMeta'>Avval formdan sana tanlang.</div>
					)}

					{selectedKey && sessionsForSelected.length === 0 && (
						<div className='pl-cardMeta'>
							Bu sana uchun mashg&apos;ulot rejalashtirilmagan.
						</div>
					)}

					{selectedKey && sessionsForSelected.length > 0 && (
						<div className='sessions-list'>
							{sessionsForSelected.map(s => (
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
											{s.load}/10
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
										<button
											type='button'
											className='pl-linkDanger'
											onClick={() => handleDelete(selectedKey, s.id)}
										>
											O&apos;chirish
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
