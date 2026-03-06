import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadPlayerProfiles } from '../../utils/playerProfiles'

/* ================= RANK CIRCLE ================= */

function RankCircle({ title, rank = 0, rating = 0 }) {
  return (
    <div className='rankCircle'>
      <div className='circle'>
        <span className='rank'>#{rank}</span>
        <span className='score'>{rating}</span>
      </div>
      <small>{title}</small>

      <style>{`
        .rankCircle{ text-align:center; }

        .circle{
          width:70px;
          height:70px;
          border-radius:50%;
          border:7px solid #10b981;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          font-weight:800;
          background:white;
          box-shadow:0 6px 18px rgba(0,0,0,.12);
        }

        .rank{ font-size:12px; color:#64748b; }
        .score{ font-size:18px; color:#0f172a; }

        small{
          font-size:11px;
          color:var(--muted);
        }
      `}</style>
    </div>
  )
}

/* ================= PLAYER CARD ================= */

function PlayerAnalyticsCard({ player, onClick }) {
  return (
    <div className='pa-card' onClick={onClick}>

      <div className='pa-imageWrap'>
        <img
          src={player.avatarUrl || 'https://i.pravatar.cc/300'}
          alt={player.fullName}
        />
      </div>

      <div className='pa-info'>
        <h4>{player.fullName}</h4>
        <p className='pos'>{player.position}</p>

        <div className='meta'>
          <span>{player.age} yosh</span>
          <span>{player.heightCm} sm</span>
          <span>{player.weightKg} kg</span>
        </div>
      </div>

      <div className='pa-ranks'>
        <RankCircle
          title='Academy'
          rank={player.academyRank}
          rating={player.academyRating}
        />

        <RankCircle
          title='Country'
          rank={player.countryRank}
          rating={player.countryRating}
        />
      </div>

      <button className='viewBtn'>Profilni ko‘rish →</button>

      <style>{`
        .pa-card{
          background:var(--card-bg);
          border-radius:18px;
          padding:18px;
          box-shadow:0 10px 28px var(--shadow);
          display:flex;
          flex-direction:column;
          gap:14px;
          height:100%;
          cursor:pointer;
          transition:.2s;
        }

        .pa-card:hover{
          transform:translateY(-4px);
        }

        .pa-imageWrap{
          height:160px;
          display:flex;
          justify-content:center;
          align-items:flex-end;
        }

        .pa-imageWrap img{
          height:100%;
          object-fit:contain;
        }

        .pa-info{ text-align:center; }

        .pa-info h4{
          margin:0;
          font-size:16px;
          font-weight:800;
        }

        .pos{
          margin:2px 0 6px;
          color:var(--muted);
          font-size:13px;
        }

        .meta{
          display:flex;
          justify-content:center;
          gap:10px;
          font-size:12px;
          color:var(--muted);
        }

        .pa-ranks{
          display:flex;
          justify-content:space-around;
          margin-top:6px;
        }

        .viewBtn{
          margin-top:auto;
          background:rgba(37,99,235,.08);
          border:none;
          padding:10px;
          border-radius:10px;
          font-weight:700;
          color:var(--accent);
          cursor:pointer;
        }
      `}</style>

    </div>
  )
}

/* ================= RANK CALC ================= */

function calculateRankings(players) {
  const byPosition = {}

  players.forEach(p => {
    if (!byPosition[p.position]) {
      byPosition[p.position] = []
    }
    byPosition[p.position].push(p)
  })

  Object.values(byPosition).forEach(group => {
    group.sort((a,b)=>b.overallRating-a.overallRating)
    group.forEach((p,i)=> p.academyRank = i+1)
  })

  players
    .sort((a,b)=>b.overallRating-a.overallRating)
    .forEach((p,i)=> p.countryRank = i+1)

  return players
}

/* ================= SLIDER ================= */

function SliderSection({ title, players, onCardClick, emptyText }) {
  const sliderRef = useRef(null)

  const scroll = dir => {
    const card = sliderRef.current?.querySelector('.store-card')
    if (!card) return
    const amount = card.offsetWidth + 20

    sliderRef.current.scrollBy({
      left: dir==='left' ? -amount : amount,
      behavior:'smooth'
    })
  }

  if(!players.length){
    return (
      <section className='store-section'>
        <h3>{title}</h3>
        <div className='empty-state'>{emptyText}</div>
      </section>
    )
  }

  return (
    <section className='store-section'>
      <h3>{title}</h3>

      <div className='store-carousel'>
        <div className='store-track' ref={sliderRef}>
          {players.map(p=>(
            <div key={p.id} className='store-card'>
              <PlayerAnalyticsCard
                player={p}
                onClick={()=>onCardClick(p)}
              />
            </div>
          ))}
        </div>

        <div className='store-arrows'>
          <button onClick={()=>scroll('left')}>‹</button>
          <button onClick={()=>scroll('right')}>›</button>
        </div>
      </div>
    </section>
  )
}

/* ================= DASHBOARD ================= */

export default function CoachDashboard() {
  const [players,setPlayers]=useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    const store = loadPlayerProfiles()

    const enriched = (store.players||[]).map(p=>{
      const stars = p.stars || 3
      const overall = Math.round((stars/5)*100)

      return {
        ...p,
        overallRating:overall,
        academyRating:overall,
        countryRating:overall
      }
    })

    setPlayers(calculateRankings(enriched))
  },[])

  const goProfile=p=>{
    const id=p.playerId||p.id
    navigate(`/coach/players/${id}`)
  }

  return (
    <div className='coach-page'>

      {/* ADD BUTTON */}
      <div className='coach-header'>
        <div/>
        <button
          onClick={()=>navigate('/coach/player-profiles?new=1')}
        >
          + Yangi futbolchi qo‘shish
        </button>
      </div>

      {/* SECTIONS */}
      <SliderSection
        title='Akademiyadagi barcha futbolchilar'
        players={players}
        onCardClick={goProfile}
      />

      <SliderSection
        title='Faol futbolchilar'
        players={players.filter(p=>p.status==='active')}
        onCardClick={goProfile}
        emptyText='Hozircha faol futbolchilar yo‘q'
      />

      <SliderSection
        title='Jarohat olgan futbolchilar'
        players={players.filter(p=>p.status==='injured')}
        onCardClick={goProfile}
        emptyText='Hozircha jarohat olgan futbolchilar yo‘q'
      />

      <SliderSection
        title='Transfer qilinishi kutilayotgan futbolchilar'
        players={players.filter(p=>p.status==='transfer')}
        onCardClick={goProfile}
        emptyText='Transferga qo‘yilgan futbolchilar mavjud emas'
      />

      <style>{`
        .coach-page{ overflow-x:hidden; }

        .coach-header{
          display:flex;
          justify-content:space-between;
          margin-bottom:24px;
        }

        .coach-header button{
          padding:12px 18px;
          border-radius:12px;
          border:none;
          background:var(--accent);
          color:#fff;
          font-weight:700;
          cursor:pointer;
        }

        .store-section{ margin-bottom:42px; }

        .store-carousel{
          --cards-per-view:4;
          position:relative;
          overflow:hidden;
        }

        .store-track{
          display:flex;
          gap:20px;
          overflow-x:auto;
          padding-bottom:8px;
        }

        .store-track::-webkit-scrollbar{ display:none; }

        .store-card{
          width:calc((100% - 60px)/4);
          min-width:calc((100% - 60px)/4);
          height:420px;
          flex-shrink:0;
        }

        .store-arrows{
          position:absolute;
          top:50%;
          width:100%;
          transform:translateY(-50%);
          display:flex;
          justify-content:space-between;
          padding:0 6px;
          pointer-events:none;
        }

        .store-arrows button{
          pointer-events:auto;
          width:48px;
          height:48px;
          border-radius:50%;
          border:none;
          background:#fff;
          box-shadow:0 10px 26px rgba(0,0,0,.18);
          font-size:26px;
          cursor:pointer;
        }

        .empty-state{
          height:120px;
          border-radius:14px;
          background:var(--card-bg);
          box-shadow:0 8px 26px var(--shadow);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--muted);
          margin-top:10px;
        }
      `}</style>

    </div>
  )
}
