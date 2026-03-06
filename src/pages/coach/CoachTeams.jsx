// src/pages/coach/CoachTeams.jsx
import React, { useEffect, useState } from 'react'
import { loadCoachExams, saveCoachExams } from '../../utils/coachExams'
import './CoachTeams.css'
import { Pencil, Trash2 } from 'lucide-react'

export default function CoachTeams() {
	const [exams, setExams] = useState([])

	const [showModal, setShowModal] = useState(false)
	const [editExamId, setEditExamId] = useState(null)

	const [deleteExam, setDeleteExam] = useState(null)

	const emptyForm = {
		title: '',
		category: 'Tezlik',
		norm: '',
		age: '',
		date: '',
		description: '',
	}

	const [form, setForm] = useState(emptyForm)

	useEffect(() => {
		const data = loadCoachExams()
		setExams(data.exams || [])
	}, [])

	const handleChange = e => {
		const { name, value } = e.target
		setForm(f => ({ ...f, [name]: value }))
	}

	const openCreate = () => {
		setEditExamId(null)
		setForm(emptyForm)
		setShowModal(true)
	}

	const openEdit = exam => {
		setEditExamId(exam.id)
		setForm({
			title: exam.title,
			category: exam.category,
			norm: exam.norm,
			age: exam.age,
			date: exam.date,
			description: exam.description || '',
		})
		setShowModal(true)
	}

	const handleSave = () => {
		if (!form.title || !form.norm || !form.age || !form.date) return

		const next = editExamId
			? exams.map(e => (e.id === editExamId ? { ...e, ...form } : e))
			: [{ id: Date.now(), status: 'Faol', ...form }, ...exams]

		setExams(next)
		saveCoachExams(next)

		setShowModal(false)
		setEditExamId(null)
		setForm(emptyForm)
	}

	const confirmDelete = () => {
		const next = exams.filter(e => e.id !== deleteExam.id)
		setExams(next)
		saveCoachExams(next)
		setDeleteExam(null)
	}

	return (
		<div className='exams-page'>
			<div className='exams-header'>
				<div>
					<h3>Futbolchilar har 6 oyda topshirishi kerak bo‘lgan normativlar</h3>
					<p>Bu yerda imtihonlar ro‘yxati ko‘rsatiladi</p>
				</div>

				<button className='primary-button' onClick={openCreate}>
					+ Yangi imtihon qo‘shish
				</button>
			</div>

			<div className='exams-grid'>
				{exams.length === 0 && <p>Hozircha imtihonlar yo‘q</p>}

				{exams.map(exam => (
					<div className='exam-card' key={exam.id}>
						<div className='exam-card-header'>
							<div>
								<h3>{exam.title}</h3>
								<span className='exam-category'>{exam.category}</span>
							</div>

							<span className='exam-status faol'>{exam.status}</span>
						</div>

						<div className='exam-info'>
							<p>
								<strong>Normativ:</strong> {exam.norm}
							</p>
							<p>
								<strong>Kimlar uchun:</strong> {exam.age}
							</p>
							<p>
								<strong>Sana:</strong> {exam.date}
							</p>
						</div>

						<div className='exam-actions'>
							<button
								className='exam-action exam-edit'
								onClick={() => openEdit(exam)}
							>
								<Pencil size={16} />
								<span>Tahrirlash</span>
							</button>

							<button
								className='exam-action exam-delete'
								onClick={() => setDeleteExam(exam)}
							>
								<Trash2 size={16} />
								<span>O‘chirish</span>
							</button>
						</div>
					</div>
				))}
			</div>

			{showModal && (
				<div className='modal-overlay'>
					<div className='modal'>
						<div className='modal-header'>
							<h2>{editExamId ? 'Tahrirlash' : 'Yangi imtihon'}</h2>
							<button
								className='modal-close'
								onClick={() => setShowModal(false)}
							>
								✕
							</button>
						</div>

						<div className='modal-body'>
							<div className='form-group'>
								<label>Imtihon nomi</label>
								<input
									name='title'
									value={form.title}
									onChange={handleChange}
								/>
							</div>

							<div className='form-row'>
								<div className='form-group'>
									<label>Normativ</label>
									<input
										name='norm'
										value={form.norm}
										onChange={handleChange}
									/>
								</div>

								<div className='form-group'>
									<label>Yosh oralig‘i</label>
									<input name='age' value={form.age} onChange={handleChange} />
								</div>
							</div>

							<div className='form-group'>
								<label>Sana</label>
								<input
									type='date'
									name='date'
									value={form.date}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className='modal-footer'>
							<button
								className='secondary-button'
								onClick={() => setShowModal(false)}
							>
								Bekor
							</button>

							<button className='primary-button' onClick={handleSave}>
								Saqlash
							</button>
						</div>
					</div>
				</div>
			)}

			{deleteExam && (
				<div className='cg-modalOverlay'>
					<div className='cg-modal'>
						<h3>Imtihonni o‘chirmoqchimisiz?</h3>
						<p>
							<strong>{deleteExam.title}</strong>
							<br />
							{deleteExam.date}
						</p>

						<div className='cg-modalActions'>
							<button onClick={() => setDeleteExam(null)}>Bekor</button>
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
