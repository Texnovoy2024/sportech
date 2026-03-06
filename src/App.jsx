import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'

import MainLanding from './pages/MainLanding'
import Register from './pages/Register'
import Login from './pages/Login'

// player pages
import PlayerLayout from './pages/player/PlayerLayout'
import DashboardContent from './pages/player/DashboardContent'
import Trainings from './pages/player/Trainings'
import Games from './pages/player/Games'
import Medical from './pages/player/Medical'
import Profile from './pages/player/Profile'
import Settings from './pages/player/Settings'

// coach pages
import CoachLayout from './pages/coach/CoachLayout'
import CoachDashboard from './pages/coach/CoachDashboard'
import CoachTeams from './pages/coach/CoachTeams'
import CoachPlayers from './pages/coach/CoachPlayers'
import CoachPlayerProfiles from './pages/coach/CoachPlayerProfiles'
import CoachTrainings from './pages/coach/CoachTrainings'
import CoachSettings from './pages/coach/CoachSettings'
import CoachGames from './pages/coach/CoachGames'
import CoachProfile from './pages/coach/CoachProfile'
import CoachExamResults from './pages/coach/CoachExamResults'

// 🆕 NEW PAGE
import PlayerProfile from './pages/coach/PlayerProfile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path='/' element={<MainLanding />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />

          {/* PLAYER */}
          <Route
            path='/player/*'
            element={
              <ProtectedRoute allowed={['player']}>
                <PlayerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardContent />} />
            <Route path='trainings' element={<Trainings />} />
            <Route path='games' element={<Games />} />
            <Route path='medical' element={<Medical />} />
            <Route path='profile' element={<Profile />} />
            <Route path='settings' element={<Settings />} />
          </Route>

          {/* COACH */}
          <Route
            path='/coach/*'
            element={
              <ProtectedRoute allowed={['coach']}>
                <CoachLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CoachDashboard />} />
            <Route path='games' element={<CoachGames />} />
            <Route path='players' element={<CoachPlayers />} />

            {/* 🆕 PLAYER PROFILE ROUTE */}
            <Route path='players/:id' element={<PlayerProfile />} />

            <Route path='player-profiles' element={<CoachPlayerProfiles />} />
            <Route path='trainings' element={<CoachTrainings />} />
            <Route path='exams' element={<CoachTeams />} />
            <Route path='exams/:id/results' element={<CoachExamResults />} />
            <Route path='exam-results' element={<CoachExamResults />} />
            <Route path='profile' element={<CoachProfile />} />
            <Route path='settings' element={<CoachSettings />} />
          </Route>

          <Route path='*' element={<Navigate to='/' replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
