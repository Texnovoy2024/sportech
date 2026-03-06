// src/utils/auth.js
const KEY = 'sf_user_token'

/** DEMO accounts */
export const DEMO_USERS = {
	'player@gmail.com': {
		email: 'player@gmail.com',
		role: 'player',
		name: 'Demo Player',
	},
	'coach@gmail.com': {
		email: 'coach@gmail.com',
		role: 'coach',
		name: 'Demo Coach',
	},
	// keyinroq: "headcoach@gmail.com": { ... }, "admin@gmail.com": { ... }
}

// Agar hozircha faqat demo ishlasin desang:
const DEMO_ONLY = true

/**
 * Login mock:
 * - requires email & password
 * - writes token to localStorage (KEY)
 * - if there is an existing app_user in localStorage (created by register),
 *   it will return that object as user (so role is preserved).
 * - otherwise returns { email } as user
 */
export function loginMock({ email, password }) {
	return new Promise((resolve, reject) => {
		console.log('[auth] loginMock called with:', { email, password })
		setTimeout(() => {
			if (!email || !password) {
				console.log('[auth] loginMock -> missing fields')
				reject(new Error("Iltimos barcha maydonlarni to'ldiring"))
				return
			}

			// ❗ Demo rejim: faqat demo emailga ruxsat berish
			if (DEMO_ONLY && !DEMO_USERS[email]) {
				reject(
					new Error(
						'Hozircha demo rejim. Iltimos faqat demo hisoblardan foydalaning.'
					)
				)
				return
			}

			const token = btoa(`${email}:${Date.now()}`)
			localStorage.setItem(KEY, token)
			console.log('[auth] loginMock -> token set:', token)

			// 1) Agar bu demo user bo'lsa, role doimiy:
			if (DEMO_USERS[email]) {
				const user = DEMO_USERS[email]
				localStorage.setItem('app_user', JSON.stringify(user))
				console.log('[auth] loginMock -> DEMO user:', user)
				resolve({ token, user })
				return
			}

			// 2) Quyidagisi – oddiy (non-demo) userlar uchun, DEMO_ONLY=false bo’lsa ishlaydi
			let storedUser = null
			try {
				const raw = localStorage.getItem('app_user')
				if (raw) storedUser = JSON.parse(raw)
			} catch (e) {
				console.warn('[auth] loginMock -> failed to parse app_user', e)
			}

			let user = null
			if (storedUser && storedUser.email && storedUser.email === email) {
				user = storedUser
			} else if (storedUser && storedUser.email && !storedUser.role) {
				user = storedUser
			} else {
				user = { email }
			}

			resolve({ token, user })
		}, 300)
	})
}

/**
 * Register mock:
 * - accepts role (optional) and will store app_user if role provided
 * - returns token + user for convenience
 */
export function registerMock({
	name,
	email,
	password,
	role = null,
	profile = null,
}) {
	console.log('[auth] registerMock called', { name, email, password, role })
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (!email || !password) {
				reject(new Error("Iltimos barcha maydonlarni to'ldiring"))
				return
			}

			// create token and persist basic user info (if role provided, save it)
			const token = btoa(`reg:${email}:${Date.now()}`)
			localStorage.setItem(KEY, token)

			// store app_user so login can reuse it (include role if provided)
			const userToStore = role ? { email, role, name } : { email, name }
			try {
				localStorage.setItem('app_user', JSON.stringify(userToStore))
				console.log('[auth] registerMock -> saved app_user', userToStore)
			} catch (e) {
				console.warn('[auth] registerMock -> failed to save app_user', e)
			}

			resolve({ ok: true, token, user: userToStore })
		}, 300)
	})
}

export function logout() {
	console.log('[auth] logout')
	localStorage.removeItem(KEY)
	// keep app_user or remove? we remove token only; if you want to remove app_user too uncomment:
	// localStorage.removeItem('app_user');
}

export function isAuthenticated() {
	const has = Boolean(localStorage.getItem(KEY))
	console.log('[auth] isAuthenticated ->', has, localStorage.getItem(KEY))
	return has
}
