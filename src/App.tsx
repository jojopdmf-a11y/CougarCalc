import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { StubPage } from './components/StubPage'
import { AppProductPage } from './pages/AppProductPage'
import { AppsIndexPage } from './pages/AppsIndexPage'
import { HomePage } from './pages/HomePage'
import { ToolsStubPage } from './pages/ToolsStubPage'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="wrap">
        <SiteHeader />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apps" element={<AppsIndexPage />} />
            <Route
              path="/apps/podcast-stripper"
              element={
                <AppProductPage
                  name="Podcast Stripper"
                  blurb="Stereo mix → speaker tracks + music."
                  image="/apps/podcast-stripper.png"
                />
              }
            />
            <Route
              path="/apps/fixer-mixer"
              element={
                <AppProductPage
                  name="Fixer Mixer"
                  blurb="Stems → polish → bounce."
                  image="/apps/fixer-mixer.png"
                />
              }
            />
            <Route
              path="/apps/lil-leveler"
              element={
                <AppProductPage
                  name="Lil Leveler"
                  blurb="Final mix → platform loudness."
                  image="/apps/lil-leveler.png"
                />
              }
            />
            <Route
              path="/tools"
              element={
                <ToolsStubPage
                  title="Free tools"
                  note="Indexes for audio/live sound and guitar building land here."
                />
              }
            />
            <Route
              path="/audio-live-sound"
              element={
                <ToolsStubPage
                  title="Audio / live sound"
                  note="Route prefix locked. Calculators arrive when Calc pack is connected."
                />
              }
            />
            <Route
              path="/audio-live-sound/*"
              element={
                <ToolsStubPage
                  title="Audio tool"
                  note="Individual calculator stub — waiting on Grokbot free-tools handoff."
                />
              }
            />
            <Route
              path="/guitar-building"
              element={
                <ToolsStubPage
                  title="Guitar building"
                  note="Route prefix locked. Calculators arrive when Calc pack is connected."
                />
              }
            />
            <Route
              path="/guitar-building/*"
              element={
                <ToolsStubPage
                  title="Guitar tool"
                  note="Individual calculator stub — waiting on Grokbot free-tools handoff."
                />
              }
            />
            <Route
              path="/about"
              element={
                <StubPage title="About">
                  <p>Local Mac apps. Keep this page short.</p>
                </StubPage>
              }
            />
            <Route
              path="/buy"
              element={
                <StubPage title="Buy apps">
                  <p>
                    Paddle checkout placeholder. Sandbox prices: Stripper $25, Mixer $25, Leveler
                    $15, Suite $49.
                  </p>
                </StubPage>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}
