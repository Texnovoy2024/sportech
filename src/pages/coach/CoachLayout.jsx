// src/layouts/CoachLayout.jsx
import React, { useState, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
	LayoutDashboard,
	Trophy,
	Users,
	CalendarDays,
	Shield,
	Settings,
	Menu,
	LogOut,
} from 'lucide-react'

import logoLight from '../../assets/logo1.png'
import avatarImg from '../../assets/profile imgs/profile.avif'

const NAV_ITEMS = [
	{ to: '/coach', label: 'Dashboard', icon: LayoutDashboard, end: true },
	{ to: '/coach/games', label: "O'yinlar", icon: Trophy },
	{ to: '/coach/player-profiles', label: 'Futbolchilar', icon: Users },
	{ to: '/coach/trainings', label: "Mashg'ulotlar", icon: CalendarDays },
	{ to: '/coach/exams', label: 'Imtihonlar', icon: Shield },
]

const PAGE_TITLES = [
  { match: '/coach', title: 'Dashboard', exact: true },
  { match: '/coach/games', title: "O'yinlar" },
  { match: '/coach/player-profiles', title: 'Futbolchilar' },

  // 🆕 ADD THIS
  { match: '/coach/players', title: 'Futbolchi profili' },

  { match: '/coach/trainings', title: "Mashg'ulotlar" },
  { match: '/coach/exams', title: 'Imtihonlar' },
  { match: '/coach/settings', title: 'Sozlamalar' },
]


function Sidebar({ open, setOpen }) {
	const navigate = useNavigate()

	const handleLogout = () => {
		navigate('/login')
	}

	return (
		<aside className={`pl-sidebar ${open ? 'pl-open' : ''}`}>
			{/* LOGO */}
			<div className='pl-logoRow'>
				<div className='pl-logoBox'>
					<img src={logoLight} alt='Sportek' className='pl-logoImg' />
				</div>
				<div>
					<div className='pl-brandTitle'>SPORTEK</div>
					<div className='pl-brandSub'>Murabbiy paneli</div>
				</div>
			</div>

			<nav className='pl-nav'>
				{NAV_ITEMS.map(item => {
					const Icon = item.icon
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={({ isActive }) =>
								`pl-side-link ${isActive ? 'active' : ''}`
							}
							onClick={() => window.innerWidth < 980 && setOpen(false)}
						>
							<span className='pl-icon'>
								<Icon size={20} />
							</span>
							<span className='pl-label'>{item.label}</span>
						</NavLink>
					)
				})}
			</nav>

			<div className='pl-footer'>
				<button
					className='pl-side-link pl-logout'
					style={{ color: '#dc2626' }}
					onClick={handleLogout}
				>
					<span className='pl-icon'>
						<LogOut size={20} />
					</span>
					<span className='pl-label'>Chiqish</span>
				</button>

				<NavLink
					to='/coach/settings'
					className={({ isActive }) =>
						`pl-side-link ${isActive ? 'active' : ''}`
					}
					onClick={() => window.innerWidth < 980 && setOpen(false)}
				>
					<span className='pl-icon'>
						<Settings size={20} />
					</span>
					<span className='pl-label'>Sozlamalar</span>
				</NavLink>
			</div>
		</aside>
	)
}

function Topbar({ onToggle, pageTitle }) {
	return (
		<header className='pl-topbar'>
			<div className='pl-topLeft'>
				<button className='pl-toggle' onClick={onToggle}>
					<Menu size={26} />
				</button>
				<h2 className='pl-pageTitle'>{pageTitle}</h2>
			</div>

			<div className='pl-topRight'>
				<input className='pl-search' placeholder='Qidirish...' />
				<NavLink to='/coach/profile'>
					<img src={avatarImg} alt='Profil' className='pl-avatarImg' />
				</NavLink>
			</div>
		</header>
	)
}

export default function CoachLayout() {
	const [open, setOpen] = useState(false)
	const location = useLocation()

	const pageTitle = useMemo(() => {
		const path = location.pathname

		const exact = PAGE_TITLES.find(p => p.exact && p.match === path)
		if (exact) return exact.title

		const partial = PAGE_TITLES.find(p => !p.exact && path.startsWith(p.match))
		if (partial) return partial.title

		return 'Murabbiy paneli'
	}, [location.pathname])

	return (
		<div className='pl-root'>
			<Sidebar open={open} setOpen={setOpen} />

			<div className='pl-main'>
				<Topbar onToggle={() => setOpen(s => !s)} pageTitle={pageTitle} />

				<main className='pl-content'>
					<Outlet />
				</main>
			</div>

			<div
				className={`pl-overlay ${open ? 'visible' : ''}`}
				onClick={() => setOpen(false)}
			/>

			{/* logout*/}
			<style>{`
        .pl-logout {
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .pl-logout:hover {
          background: #fef2f2;
        }
      `}</style>
			<style>{`
        html, body {
					overflow-x: hidden;
				}

				.pl-root {
					overflow-x: hidden;
				}

				.pl-main {
					overflow-x: hidden;
				}

				.pl-content {
					overflow-x: hidden;
				}

        body {
          background: var(--page-bg);
        }

        :root{
          --page-bg: #f3f8f8;
          --muted: #6b7280;
          --accent: #0b3be6;
          --shadow: rgba(16,24,40,0.04);
          --card-bg: #ffffff;
          --sidebar-bg: #ffffff;
          --text-dark: #07102a;
          --top-border: rgba(11,17,26,0.03);
          font-family: 'Gilroy', Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }

        .pl-root.pl-dark {
          --page-bg: linear-gradient(180deg,#071226 0%, #071226 100%);
          --muted: #9fb1c8;
          --accent: #60a5fa;
          --shadow: rgba(2,6,23,0.6);
          --card-bg: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          --sidebar-bg: #131b36ff;
          --text-dark: #dbe7f3;
          --top-border: rgba(255,255,255,0.04);
        }

        .pl-root { display:flex; min-height:100vh; width:100%; background:var(--page-bg); color:var(--text-dark); }

        .pl-sidebar {
          width:240px;
          background: var(--sidebar-bg);
          border-right:1px solid rgba(15,23,42,0.06);
          padding:20px;
          box-sizing:border-box;
          display:flex;
          flex-direction:column;
          gap:12px;
          z-index:30;
        }

        .pl-logoRow { display:flex; gap:12px; align-items:center; }
        .pl-logoBox { width:44px; height:44px; border-radius:10px; background: transparent; padding:4px; box-sizing:border-box; overflow: visible; display:flex; align-items:center; justify-content:center; }
        .pl-logoImg { width:100%; height:100%; object-fit:contain; display:block; background:transparent; border-radius:0; }
        .pl-brandTitle { font-weight:800; color:var(--text-dark); }
        .pl-brandSub { color:var(--muted); font-size:12px; }

        .pl-nav { margin-top:12px; display:flex; flex-direction:column; gap:6px; }
        .pl-side-link { display:flex; gap:12px; align-items:center; padding:10px 12px; border-radius:10px; color:var(--text-dark); text-decoration:none; font-weight:600; }
        .pl-side-link:hover { background: rgba(16,24,40,0.03); }
        .pl-side-link.active { background: linear-gradient(90deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02)); color: var(--accent); }
        .pl-icon { width:28px; display:inline-flex; justify-content:center; opacity:0.98; }
        .pl-label { white-space:nowrap; }
        .pl-footer { margin-top:auto; }

        .pl-main { flex:1; display:flex; flex-direction:column; }
        .pl-topbar { display:flex; justify-content:space-between; align-items:center; padding:20px 28px; background:transparent; border-bottom: 1px solid var(--top-border); }
        .pl-topLeft { display:flex; gap:12px; align-items:center; }
        .pl-topRight { display:flex; gap:12px; align-items:center; }

        .pl-toggle { display:none; background:transparent; border:none; padding:6px; border-radius:8px; cursor:pointer; }
        .pl-toggleLogoImg { width:28px; height:28px; object-fit:contain; display:block; }

        .pl-pageTitleWrap { display:flex; align-items:center; margin-right:12px; padding-bottom:6px; }
        .pl-pageTitle { font-size:22px; font-weight:800; margin:0; color:var(--text-dark); white-space:nowrap; position:relative; }

        .pl-searchWrap { display:flex; align-items:center; gap:12px; margin-right:6px; }
        .pl-search { padding:10px 14px; border-radius:12px; border:1px solid rgba(15,23,42,0.06); min-width:280px; background:var(--card-bg); box-shadow: 0 1px 0 rgba(15,23,42,0.02) inset; color:var(--text-dark); }
        .pl-avatarImg { width:40px; height:40px; border-radius:999px; object-fit:cover; display:block; box-shadow: 0 4px 14px rgba(2,6,23,0.06); }

        .pl-content { flex:1; padding:28px; }

        .pl-h1 { font-size:40px; margin:0 0 18px 0; color:var(--text-dark); font-weight:800; }
        .pl-grid4 { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:18px; }
        .pl-card { background: var(--card-bg); padding:18px; border-radius:12px; box-shadow: 0 8px 26px var(--shadow); color:var(--text-dark); }
        .pl-cardTitle { color:var(--muted); font-size:13px; }
        .pl-cardValue { font-size:28px; font-weight:800; margin-top:8px; color:var(--text-dark); }
        .pl-cardMeta { color:var(--muted); margin-top:6px; }
        .pl-twoCol { display:grid; grid-template-columns:2fr 1fr; gap:16px; }

        .desktop-hide { display:none; }
        .mobile-show { display:block; }

        .pl-overlay { display:none; }

        @media (max-width: 979px) {
          .pl-root { flex-direction:column; }
          .pl-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 260px;
            transform: translateX(-110%);
            transition: transform 320ms cubic-bezier(.22,.9,.28,1);
            box-shadow: 8px 0 24px rgba(0,0,0,0.55);
            padding: 18px;
            z-index: 60;
            border-right: 1px solid rgba(15,23,42,0.3);
            background: var(--sidebar-bg);
          }
          .pl-sidebar.pl-open { transform: translateX(0); }

          .pl-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.32); display:block; opacity:0; pointer-events:none; transition: opacity 240ms ease; z-index:50; }
          .pl-overlay.visible { opacity:1; pointer-events:auto; }

          .pl-toggle { display:inline-flex; }
          .pl-toggleLogoImg { width:36px; height:36px; }

          .pl-pageTitle { display:none; }
          .desktop-hide { display:block; margin-bottom:12px; }
          .mobile-show { display:block; }

          .pl-search { min-width:140px; }
          .pl-content { padding:18px; }
          .pl-grid4 { grid-template-columns: repeat(2, 1fr); }
          .pl-twoCol { grid-template-columns: 1fr; }
        }

        @media (max-width:520px) {
          .pl-grid4 { grid-template-columns: 1fr 1fr; }
          .pl-h1 { font-size:28px; }
          .pl-toggleLogoImg { width:40px; height:40px; }
          .pl-search { min-width:120px; }
        }
      `}</style>
		</div>
	)
}
