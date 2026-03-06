// src/pages/Register.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo1 from '../assets/logo1.png'
import './Register.css'
import { DEMO_USERS } from '../utils/auth'

/**
 * Simple mock register function.
 * Replace with real API call or use your utils/auth.register
 */
async function registerMock(payload) {
	// simulate network delay
	await new Promise(r => setTimeout(r, 600))
	if (DEMO_USERS[payload.email]) {
		throw new Error(
			'Bu demo hisob. Iltimos, demo uchun faqat login sahifasidan foydalaning.'
		)
	}

	// basic validation example
	if (!payload.email || !payload.password) {
		throw new Error('Email va parol kiritilishi shart')
	}
	if (!payload.email || !payload.password) {
		throw new Error('Email va parol kiritilishi shart')
	}
	// store token (mock)
	const token = 'mock-token-' + Math.random().toString(36).slice(2, 12)
	localStorage.setItem('app_token', token)
	localStorage.setItem(
		'app_user',
		JSON.stringify({ email: payload.email, role: payload.role })
	)
	return { token }
}

export default function Register() {
	const navigate = useNavigate()

	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		passwordConfirm: '',
		role: 'player', // default to player for UX
		// player-specific
		academy: '',
		team: '',
		region: '',
		ageGroup: '',
		// other extras (for non-player roles)
		extras: '',
	})

	const [loading, setLoading] = useState(false)
	const [err, setErr] = useState('')

	// convenience handler
	const onChange = k => e =>
		setForm(s => ({ ...s, [k]: e.target ? e.target.value : e }))

	// whether current role is player
	const isPlayer = form.role === 'player'

	useEffect(() => {
		// when role changes to player, we can auto-populate some defaults or clear extras
		if (isPlayer) {
			setForm(s => ({ ...s, extras: '' }))
		} else {
			// non-player roles do not need academy fields by default
			setForm(s => ({
				...s,
				academy: '',
				team: '',
				region: '',
				ageGroup: '',
			}))
		}
	}, [form.role]) // eslint-disable-line

	const handleSubmit = async e => {
		e.preventDefault()
		setErr('')
		if (!form.email || !form.password) {
			setErr('Iltimos email va parolni kiriting')
			return
		}
		if (form.password !== form.passwordConfirm) {
			setErr('Parol bilan tasdiqlash mos emas')
			return
		}

		setLoading(true)
		try {
			const payload = { ...form }
			const body = {
				firstName: payload.firstName,
				lastName: payload.lastName,
				email: payload.email,
				password: payload.password,
				role: payload.role,
				profile:
					form.role === 'player'
						? {
								academy: payload.academy,
								team: payload.team,
								region: payload.region,
								ageGroup: payload.ageGroup,
						  }
						: { extras: payload.extras },
			}

			await registerMock(body)
			// navigate to dashboard or login
			navigate('/login', {
				replace: true,
				state: { preRole: body.role, fromRegister: true },
			})
		} catch (error) {
			setErr(error.message || "Ro'yxatdan o'tishda xatolik")
		} finally {
			setLoading(false)
		}
	}

	// minimal inline styles to mimic the design card look
	const containerStyle = {
		maxWidth: 900,
		margin: '32px auto',
		padding: 28,
		background: '#ffffff',
		borderRadius: 12,
		boxShadow: '0 10px 30px rgba(16,24,40,0.06)',
	}

	const twoCols = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }

	const labelStyle = {
		display: 'block',
		fontSize: 14,
		color: '#374151',
		marginBottom: 8,
	}

	const inputStyle = {
		width: '100%',
		padding: '10px 12px',
		borderRadius: 10,
		border: '1px solid #e6e9ee',
		background: '#fff',
	}

	const sectionTitle = { marginTop: 20, marginBottom: 10, fontWeight: 700 }

	return (
		<div
			className='register-page'
			style={{
				padding: '24px 12px',
				minHeight: '100vh',
				background: 'linear-gradient(90deg,#f1f7f8, #eef7f8)',
			}}
		>
			<div className='register-card' style={containerStyle}>
				{/* HEADER: logo + title row */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 16,
							justifyContent: 'center',
						}}
					>
						{/* logo file expected at public/logo.png; change src if different */}
						<img
							src={logo1}
							alt='Logo'
							style={{
								width: 40,
								height: 40,
								objectFit: 'contain',
								display: 'block',
							}}
						/>
						<h1 style={{ margin: 0, fontWeight: 900, fontSize: 28 }}>
							Hisob Yaratish
						</h1>
					</div>

					<p style={{ textAlign: 'center', color: '#6b7280', marginTop: 6 }}>
						Platformamizdan foydalanish uchun ro'yxatdan o'ting.
					</p>
				</div>

				{/* section separator and title */}
				<div style={{ marginTop: 18 }}>
					<div style={{ fontWeight: 600, fontSize: 16 }}>
						Shaxsiy ma'lumotlar
					</div>
					<div style={{ height: 1, background: '#c1cad3ff', marginTop: 10 }} />
				</div>

				<form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
					<div style={twoCols}>
						<div>
							<label style={labelStyle}>Ism</label>
							<input
								style={inputStyle}
								placeholder="To'liq ism"
								value={form.firstName}
								onChange={onChange('firstName')}
							/>
						</div>

						<div>
							<label style={labelStyle}>Familya</label>
							<input
								style={inputStyle}
								placeholder='Familya'
								value={form.lastName}
								onChange={onChange('lastName')}
							/>
						</div>
					</div>

					<div style={{ ...twoCols, marginTop: 12 }}>
						<div>
							<label style={labelStyle}>Email</label>
							<input
								style={inputStyle}
								placeholder='email@domain.com'
								value={form.email}
								onChange={onChange('email')}
							/>
						</div>

						<div>
							<label style={labelStyle}>Telefon raqami</label>
							<input style={inputStyle} placeholder='+998 XX XXX XX XX' />
						</div>
					</div>

					<div style={{ ...twoCols, marginTop: 12 }}>
						<div>
							<label style={labelStyle}>Parol</label>
							<input
								style={inputStyle}
								type='password'
								value={form.password}
								onChange={onChange('password')}
								placeholder='Parol'
							/>
						</div>

						<div>
							<label style={labelStyle}>Parolni tasdiqlash</label>
							<input
								style={inputStyle}
								type='password'
								value={form.passwordConfirm}
								onChange={onChange('passwordConfirm')}
								placeholder='Parolni tasdiqlang'
							/>
						</div>
					</div>

					<div style={{ marginTop: 12 }}>
						<label style={labelStyle}>Rolni tanlang</label>
						<select
							style={{ ...inputStyle, padding: '10px 12px' }}
							value={form.role}
							onChange={onChange('role')}
						>
							<option value='player'>Futbolchi</option>
							<option value='coach'>Murabbiy</option>
							<option value='headcoach'>Bosh Murabbiy</option>
							<option value='admin'>Admin</option>
							<option value='medic'>Tibbiy xodim</option>
							<option value='scout'>Skaut</option>
						</select>
					</div>

					{/* PLAYER-SPECIFIC FIELDS */}
					{isPlayer && (
						<>
							<h4 style={{ fontWeight: 600 }}>
								Akademiya ma'lumotlari
								<div
									style={{ height: 1, background: '#c1cad3ff', marginTop: 10 }}
								/>
							</h4>

							<div style={{ width: '100%' }}>
								<div>
									<label style={labelStyle}>Akademiya nomi</label>
									<input
										style={{ ...inputStyle, maxWidth: '100%' }}
										placeholder='Akademiyangiz nomini kiriting'
										value={form.academy}
										onChange={onChange('academy')}
									/>
								</div>
							</div>

							<div style={{ ...twoCols, marginTop: 12 }}>
								<div>
									<label style={labelStyle}>Hudud</label>
									<input
										style={inputStyle}
										placeholder='Masalan: Toshkent sh.'
										value={form.region}
										onChange={onChange('region')}
									/>
								</div>

								<div>
									<label style={labelStyle}>Jamoa</label>
									<input
										style={inputStyle}
										placeholder='Masalan: Paxtakor U-16'
										value={form.team}
										onChange={onChange('team')}
									/>
								</div>
							</div>

							<div style={{ marginTop: 12 }}>
								<label style={labelStyle}>Yosh guruhi</label>
								<input
									style={inputStyle}
									placeholder='Masalan: 2006-2007'
									value={form.ageGroup}
									onChange={onChange('ageGroup')}
								/>
							</div>
						</>
					)}

					{/* NON-PLAYER: extras placeholder (you can expand fields per role later) */}
					{!isPlayer && (
						<>
							<h4 style={sectionTitle}>
								Qo'shimcha ma'lumotlar (ishlab chiqish uchun)
							</h4>
							<div>
								<label style={labelStyle}>
									Qo'shimcha izohlar / bo'sh maydonlar
								</label>
								<textarea
									style={{ ...inputStyle, minHeight: 80 }}
									placeholder="Siz bu rol uchun kerakli ma'lumotlarni keyinroq qo'shasiz..."
									value={form.extras}
									onChange={onChange('extras')}
								/>
							</div>
						</>
					)}

					{/* optional technical/tactical text area */}
					<div
						style={{
							marginTop: 20,
							display: 'grid',
							gridTemplateColumns: '1fr 320px',
							gap: 20,
						}}
					></div>

					{err && <div style={{ color: 'crimson', marginTop: 12 }}>{err}</div>}

					<div style={{ marginTop: 22 }}>
						<button
							type='submit'
							disabled={loading}
							style={{
								width: '100%',
								padding: 14,
								borderRadius: 10,
								border: 'none',
								background: '#1967ff',
								color: '#fff',
								fontWeight: 700,
								cursor: 'pointer',
							}}
						>
							{loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
						</button>
					</div>

					<div style={{ marginTop: 10, textAlign: 'center', color: '#374151' }}>
						Hisobingiz bormi? <Link to='/login'>Kirish</Link>
					</div>
				</form>
			</div>
		</div>
	)
}
