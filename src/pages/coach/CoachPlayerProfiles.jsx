import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  loadPlayerProfiles,
  savePlayerProfiles,
} from '../../utils/playerProfiles'
import {
  loadPlayerDashboard,
  savePlayerDashboard,
} from '../../utils/playerDashboard'
import './CoachPlayerProfiles.css'


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

const STATUS_OPTIONS = [
  { value: '', label: 'Akademiyada (default)' },
  { value: 'active', label: 'Faol futbolchi' },
  { value: 'injured', label: 'Jarohat olgan' },
  { value: 'transfer', label: 'Transferga qo‘yilgan' },
]

const EMPTY_PROFILE = {
  playerId: '',
  shortName: '',
  fullName: '',
  position: 'Markaziy hujumchi',
  age: '',
  heightCm: '',
  weightKg: '',
  avatarUrl: '',
  status: '', 
}

const EMPTY_DASHBOARD = {
  matches: '',
  avgRating: '',
  trainingLoad: '',
  trainingTrend: '',
  healthStatus: '',
  lastInjury: '',
  goals: '',
  assists: '',
  seasonImprovement: '',
}


export default function CoachPlayerProfiles() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const playerId = searchParams.get('playerId')
  const isCreate = searchParams.get('new') === '1'
  const isEdit = Boolean(playerId)

  const [profiles, setProfiles] = useState({ players: [] })
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE)
  const [dashboardForm, setDashboardForm] = useState(EMPTY_DASHBOARD)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    const store = loadPlayerProfiles()
    setProfiles(store)

    if (isEdit) {
      const player = store.players.find(p => p.playerId === playerId)
      if (player) {
        setProfileForm(player)
        const dash = loadPlayerDashboard(player.playerId)
        if (dash) setDashboardForm(dash)
      }
    }

    if (isCreate) {
      setProfileForm(EMPTY_PROFILE)
      setDashboardForm(EMPTY_DASHBOARD)
    }
  }, [playerId, isCreate])


  const onAvatarChange = e => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setProfileForm(p => ({ ...p, avatarUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const onProfileChange = e => {
    const { name, value } = e.target
    setProfileForm(p => ({ ...p, [name]: value }))
  }

  const onDashboardChange = e => {
    const { name, value } = e.target
    setDashboardForm(d => ({ ...d, [name]: value }))
  }


  const saveProfile = e => {
    e.preventDefault()

    if (!profileForm.playerId || !profileForm.fullName) {
      setStatusMsg("Player ID va to‘liq ism majburiy")
      return
    }

    let nextPlayers

    if (isEdit) {
      nextPlayers = profiles.players.map(p =>
        p.playerId === profileForm.playerId ? profileForm : p
      )
    } else {
      nextPlayers = [
        ...profiles.players,
        { id: Date.now(), ...profileForm },
      ]
    }

    savePlayerProfiles({ players: nextPlayers })
    setProfiles({ players: nextPlayers })

    setStatusMsg('Profil muvaffaqiyatli saqlandi')
    setTimeout(() => setStatusMsg(''), 2000)

    if (!isEdit) {
      navigate(`/coach/player-profiles?playerId=${profileForm.playerId}`)
    }
  }


  const saveDashboard = e => {
    e.preventDefault()
    savePlayerDashboard(profileForm.playerId, dashboardForm)
    setStatusMsg('Dashboard saqlandi')
    setTimeout(() => setStatusMsg(''), 2000)
  }


  if (!isEdit && !isCreate) {
    return (
      <div className="pl-card" style={{ maxWidth: 560 }}>
        <p className="cp-muted">
          Futbolchi profili va <b>Dashboard</b> ma’lumotlarini
          ko‘rish yoki tahrirlash uchun futbolchini tanlang
          yoki yangi futbolchi qo‘shing.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="primary-button" onClick={() => navigate('/coach')}>
            ← Dashboardga o‘tish
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate('/coach/player-profiles?new=1')}
          >
            + Yangi futbolchi qo‘shish
          </button>
        </div>
      </div>
    )
  }


  return (
    <div>
      {statusMsg && <div className="cp-alert">{statusMsg}</div>}

      <div className="cp-grid">
        <div className="pl-card">
          <div className="pl-cardTitle">
            {isEdit ? 'Futbolchi profili' : 'Yangi futbolchi qo‘shish'}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt="Avatar"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 800,
                }}
              >
                {(profileForm.shortName || profileForm.fullName || 'P')[0]}
              </div>
            )}

            <label>
              <input type="file" accept="image/*" hidden onChange={onAvatarChange} />
              <span className="secondary-button" style={{ marginTop: 10 }}>
                Rasm yuklash
              </span>
            </label>
          </div>

          <form onSubmit={saveProfile} className="cp-form">
            <input
              name="playerId"
              value={profileForm.playerId}
              onChange={onProfileChange}
              placeholder="Player ID"
              disabled={isEdit}
            />

            <input
              name="fullName"
              value={profileForm.fullName}
              onChange={onProfileChange}
              placeholder="To‘liq ism"
            />

            <input
              name="shortName"
              value={profileForm.shortName}
              onChange={onProfileChange}
              placeholder="Qisqa ism"
            />

            <select
              name="position"
              value={profileForm.position}
              onChange={onProfileChange}
            >
              {POSITION_OPTIONS.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              name="status"
              value={profileForm.status}
              onChange={onProfileChange}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <input
              name="age"
              type="number"
              value={profileForm.age}
              onChange={onProfileChange}
              placeholder="Yosh"
            />

            <input
              name="heightCm"
              type="number"
              value={profileForm.heightCm}
              onChange={onProfileChange}
              placeholder="Bo‘y (sm)"
            />

            <input
              name="weightKg"
              type="number"
              value={profileForm.weightKg}
              onChange={onProfileChange}
              placeholder="Vazn (kg)"
            />

            <button className="primary-button">Profilni saqlash</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate('/coach')}
            >
              ← Dashboardga qaytish
            </button>
          </form>
        </div>

        <div className="pl-card">
          <div className="pl-cardTitle">Futbolchi Dashboard</div>

          <form onSubmit={saveDashboard} className="cp-form">
            <input name="matches" value={dashboardForm.matches} onChange={onDashboardChange} placeholder="O‘yinlar soni" />
            <input name="avgRating" value={dashboardForm.avgRating} onChange={onDashboardChange} placeholder="O‘rtacha reyting" />
            <input name="trainingLoad" value={dashboardForm.trainingLoad} onChange={onDashboardChange} placeholder="Mashg‘ulot yuklamasi" />
            <input name="trainingTrend" value={dashboardForm.trainingTrend} onChange={onDashboardChange} placeholder="Trend (+5%)" />
            <input name="healthStatus" value={dashboardForm.healthStatus} onChange={onDashboardChange} placeholder="Sog‘liq holati" />
            <input type="date" name="lastInjury" value={dashboardForm.lastInjury} onChange={onDashboardChange} />
            <input name="goals" value={dashboardForm.goals} onChange={onDashboardChange} placeholder="Gollar" />
            <input name="assists" value={dashboardForm.assists} onChange={onDashboardChange} placeholder="Assistlar" />
            <input name="seasonImprovement" value={dashboardForm.seasonImprovement} onChange={onDashboardChange} placeholder="Mavsum o‘zgarishi" />

            <button className="primary-button">Dashboardni saqlash</button>
          </form>
        </div>
      </div>
    </div>
  )
}
