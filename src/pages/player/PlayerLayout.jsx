import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

// LOGO: light va dark uchun alohida
import logoLight from '../../assets/logo1.png'
import logoDark from '../../assets/logo2.png'

import avatarImg from '../../assets/profile imgs/profile.avif'

const NAV_ITEMS = [
  { to: '/player', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/player/trainings', label: "Mashg'ulotlar", icon: '📅' },
  { to: '/player/games', label: "O'yinlar", icon: '⚽' },
  { to: '/player/medical', label: "Tibbiy bo'lim", icon: '🩺' },
]

const PAGE_TITLES = {
  '/player': 'Boshqaruv Paneli',
  '/player/': 'Boshqaruv Paneli',
  '/player/trainings': "Mashg'ulotlar Rejasi",
  '/player/games': "O'yin tahlili",
  '/player/medical': "Tibbiy bo'lim",
  '/player/profile': 'Profil',
  '/player/settings': 'Sozlamalar',
}

function Sidebar({ open, setOpen, theme }) {
  const linkClass = ({ isActive }) =>
    'pl-side-link' + (isActive ? ' active' : '')

  const logoSrc = theme === 'dark' ? logoDark : logoLight

  return (
    <aside
      className={`pl-sidebar ${open ? 'pl-open' : ''}`}
      aria-hidden={
        !open && typeof window !== 'undefined' && window.innerWidth <= 979
      }
    >
      <div className='pl-logoRow'>
        <div className='pl-logoBox' aria-hidden>
          <img src={logoSrc} alt='Sportek' className='pl-logoImg' />
        </div>

        <div className='pl-brand'>
          <div className='pl-brandTitle'>SPORTEK</div>
          <div className='pl-brandSub'>Akademiya</div>
        </div>
      </div>

      <nav className='pl-nav' aria-label='Main navigation'>
        {NAV_ITEMS.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={linkClass}
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 980)
                setOpen(false)
            }}
          >
            <span className='pl-icon' aria-hidden>
              {it.icon}
            </span>
            <span className='pl-label'>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className='pl-footer'>
        <NavLink
          to='/player/settings'
          className={linkClass}
          onClick={() =>
            typeof window !== 'undefined' &&
            window.innerWidth < 980 &&
            setOpen(false)
          }
        >
          <span className='pl-icon' aria-hidden>
            ⚙️
          </span>
          <span className='pl-label'>Sozlamalar</span>
        </NavLink>
      </div>
    </aside>
  )
}

function Topbar({ onToggle, pageTitle, theme, onToggleTheme }) {
  const logoSrc = theme === 'dark' ? logoDark : logoLight

  return (
    <header className='pl-topbar'>
      <div className='pl-topLeft'>
        {/* Toggle (logo) - visible only on mobile */}
        <button className='pl-toggle' onClick={onToggle} aria-label='Open menu'>
          <img src={logoSrc} alt='menu' className='pl-toggleLogoImg' />
        </button>

        {/* Desktop page title — visible on larger screens */}
        <div className='pl-pageTitleWrap'>
          <h2 className='pl-pageTitle'>{pageTitle}</h2>
        </div>
      </div>

      <div className='pl-topRight'>
        {/* search on the right (desktop + mobile) */}
        <div className='pl-searchWrap'>
          <input
            placeholder='Qidirish...'
            className='pl-search'
            aria-label='Qidirish'
          />
        </div>

        {/* theme toggle placed near avatar */}

        <NavLink to='/player/profile' className='pl-avatarLink' title='Profil'>
          <img src={avatarImg} alt='Profil' className='pl-avatarImg' />
        </NavLink>
      </div>
    </header>
  )
}

function Card({ title, value, meta }) {
  return (
    <div className='pl-card'>
      <div className='pl-cardTitle'>{title}</div>
      <div className='pl-cardValue'>{value}</div>
      <div className='pl-cardMeta'>{meta}</div>
    </div>
  )
}

export function DashboardContent() {
  return (
    <div>
      <h1 className='pl-h1 mobile-show'>Boshqaruv Paneli</h1>

      <div className='pl-grid4'>
        <Card title='Jami futbolchilar' value='124' meta='+2%' />
        <Card title="O'rtacha reyting" value='8.2' meta='-0.1%' />
        <Card title="Mashg'ulot yuklamasi" value='Yuqori' meta='+5%' />
        <Card title='Jarohatlar' value='3' meta='+1' />
      </div>

      <div className='pl-twoCol'>
        <div className='pl-largeCard'>
          <h3>Bo'y/massa o'sish grafigi</h3>
          <div className='pl-chartPlaceholder' />
        </div>

        <aside className='pl-rightColumn'>
          <div className='pl-smallCard'>
            <h4>Mashg'ulot intensivligi</h4>
            <p className='muted'>Kalendardagi mashg'ulot belgilarini ko'rish</p>
          </div>

          <div className='pl-smallCard'>
            <h4>So'nggi faoliyat</h4>
            <ul className='pl-activity'>
              <li>Yangi mashg'ulot qo'shildi</li>
              <li>A. Valiev test natijasi yakunlandi</li>
              <li>O'yin natijasi yangilandi</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function PlayerLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // THEME: layout/global theme stored in localStorage 'pl_theme'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pl_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    const applyFromStorage = () => {
      try {
        const val = localStorage.getItem('pl_theme') || 'light'
        setTheme(val)
      } catch {
        /* noop */
      }
    }
    const onStorage = e => {
      if (e.key === 'pl_theme') setTheme(e.newValue || 'light')
    }
    const onCustom = () => applyFromStorage()

    window.addEventListener('storage', onStorage)
    window.addEventListener('pl-theme-change', onCustom)
    applyFromStorage()

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('pl-theme-change', onCustom)
    }
  }, [])

  const onToggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  const pageTitle = useMemo(() => {
    const base = location.pathname.split('?')[0].split('#')[0]
    return PAGE_TITLES[base] || PAGE_TITLES['/player'] || 'Boshqaruv Paneli'
  }, [location])

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setOpen(false)
    const onResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 979 && open)
        setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <div className={`pl-root ${theme === 'dark' ? 'pl-dark' : ''}`}>
      <Sidebar open={open} setOpen={setOpen} theme={theme} />
      <div className='pl-main'>
        <Topbar
          onToggle={() => setOpen(s => !s)}
          pageTitle={pageTitle}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <main className='pl-content' role='main'>
          <h1 className='pl-h1 desktop-hide'>{pageTitle}</h1>
          <Outlet />
        </main>
      </div>

      <div
        className={`pl-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
      />

      <style>{`
        /* ===== MINIMAL GLOBAL RESET to remove white border ===== */
        html, body, #root {
          height: 100%;
          margin: 0;               /* remove browser default body margin (the white border) */
        }
        body {
          background: var(--page-bg); /* ensure body uses app background variable */
        }

        :root{
  /* token defaults (light) */
  --page-bg: #f3f8f8;
  --muted: #6b7280;
  --accent: #0b3be6;
  --shadow: rgba(16,24,40,0.04);
  --card-bg: #ffffff;
  --sidebar-bg: #ffffff;            /* 🔹 sidebar uchun alohida fon */
  --text-dark: #07102a;
  --top-border: rgba(11,17,26,0.03);
  font-family: 'Gilroy', Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* dark overrides when .pl-dark present on pl-root */
.pl-root.pl-dark {
  --page-bg: linear-gradient(180deg,#071226 0%, #071226 100%);
  --muted: #9fb1c8;
  --accent: #60a5fa;
  --shadow: rgba(2,6,23,0.6);
  --card-bg: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  --sidebar-bg: #131b36ff;            /* 🔹 sidebar darkda to‘liq to‘q fon */
  --text-dark: #dbe7f3;
  --top-border: rgba(255,255,255,0.04);
}


        /* ensure pl-root stretches exactly to viewport (no side gaps) */
        .pl-root { display:flex; min-height:100vh; width:100%; background:var(--page-bg); color:var(--text-dark); }

        /* SIDEBAR */
        /* SIDEBAR */
.pl-sidebar {
  width:240px;
  background: var(--sidebar-bg);         /* ⬅️ card-bg emas, sidebar-bg */
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

        /* TOPBAR + MAIN */
        .pl-main { flex:1; display:flex; flex-direction:column; }
        .pl-topbar { display:flex; justify-content:space-between; align-items:center; padding:20px 28px; background:transparent; border-bottom: 1px solid var(--top-border); }
        .pl-topLeft { display:flex; gap:12px; align-items:center; }
        .pl-topRight { display:flex; gap:12px; align-items:center; }

        /* toggle hidden on desktop */
        .pl-toggle { display:none; background:transparent; border:none; padding:6px; border-radius:8px; cursor:pointer; }
        .pl-toggleLogoImg { width:28px; height:28px; object-fit:contain; display:block; }

        .pl-pageTitleWrap { display:flex; align-items:center; margin-right:12px; padding-bottom:6px; }
        .pl-pageTitle { font-size:22px; font-weight:800; margin:0; color:var(--text-dark); white-space:nowrap; position:relative; }
        

        .pl-searchWrap { display:flex; align-items:center; gap:12px; margin-right:6px; }
        .pl-search { padding:10px 14px; border-radius:12px; border:1px solid rgba(15,23,42,0.06); min-width:280px; background:var(--card-bg); box-shadow: 0 1px 0 rgba(15,23,42,0.02) inset; color:var(--text-dark); }
        .pl-avatarImg { width:40px; height:40px; border-radius:999px; object-fit:cover; display:block; box-shadow: 0 4px 14px rgba(2,6,23,0.06); }

        .pl-content { flex:1; padding:28px; }

        /* dashboard helpers kept as before */
        .pl-h1 { font-size:40px; margin:0 0 18px 0; color:var(--text-dark); font-weight:800; }
        .pl-grid4 { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:18px; }
        .pl-card { background: var(--card-bg); padding:18px; border-radius:12px; box-shadow: 0 8px 26px var(--shadow); color:var(--text-dark); }
        .pl-cardTitle { color:var(--muted); font-size:13px; }
        .pl-cardValue { font-size:28px; font-weight:800; margin-top:8px; color:var(--text-dark); }
        .pl-cardMeta { color:var(--muted); margin-top:6px; }
        .pl-twoCol { display:grid; grid-template-columns:2fr 1fr; gap:16px; }

        .desktop-hide { display:none; }
        .mobile-show { display:block; }

        /* THEME TOGGLE (topbar) */
        .pl-themeToggle { display:inline-flex; align-items:center; gap:8px; cursor:pointer; }
        .pl-themeToggle input { display:none; }
        .pl-themeTrack { width:46px; height:26px; border-radius:99px; background: rgba(2,6,23,0.06); position:relative; display:inline-block; border: 1px solid rgba(2,6,23,0.04); }
        .pl-themeThumb { position:absolute; left:3px; top:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition: transform 160ms ease; box-shadow: 0 4px 12px rgba(2,6,23,0.08); }
        .pl-themeToggle input:checked + .pl-themeTrack .pl-themeThumb { transform: translateX(20px); }
        .pl-themeToggle input:checked + .pl-themeTrack { background: linear-gradient(90deg, var(--accent), #3b82f6); box-shadow: 0 6px 18px rgba(59,130,246,0.12); }

        /* MOBILE */
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
    background: var(--sidebar-bg);   /* ⬅️ endi to‘liq fon */
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
