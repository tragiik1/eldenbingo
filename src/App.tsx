/**
 * Elden Bingo - Archive of Trials
 * 
 * A shared archive and social memory space for Elden Ring bingo matches.
 * This is not an app — it's a relic. A place to preserve shared suffering.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Match } from './pages/Match'
import { Gallery } from './pages/Gallery'
import { Submit } from './pages/Submit'
import { About } from './pages/About'
import { Stats } from './pages/Stats'
import { PlayerProfile } from './pages/PlayerProfile'
import { ProfileSetup } from './pages/ProfileSetup'
import { AuthCallback } from './pages/AuthCallback'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/match/:id" element={<Match />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/player/:id" element={<PlayerProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/setup" element={<ProfileSetup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
