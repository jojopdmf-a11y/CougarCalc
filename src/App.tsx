import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { StubPage } from './components/StubPage'
import { AppProductPage } from './pages/AppProductPage'
import { AppsIndexPage } from './pages/AppsIndexPage'
import { BuyPage } from './pages/BuyPage'
import { BuySuccessPage } from './pages/BuySuccessPage'
import { HomePage } from './pages/HomePage'
import { ToolsStubPage } from './pages/ToolsStubPage'
import './styles/global.css'

const GuitarVisualizerPage = lazy(() =>
  import('./pages/GuitarVisualizerPage').then((m) => ({ default: m.GuitarVisualizerPage })),
)

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
                  catalogKey="stripper"
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
                  catalogKey="mixer"
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
                  catalogKey="leveler"
                />
              }
            />
            <Route
              path="/tools"
              element={
                <ToolsStubPage
                  title="Free tools"
                  note="Indexes for audio/live sound and guitar building land here."
                  links={[
                    { to: '/guitar-building/visualizer', label: '3D guitar visualizer (spike)' },
                    { to: '/guitar-building', label: 'Guitar building' },
                    { to: '/audio-live-sound', label: 'Audio / live sound' },
                  ]}
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
                  note="Route prefix locked. Calculators arrive when Calc pack is connected. The 3D visualizer spike is live at /guitar-building/visualizer."
                  links={[{ to: '/guitar-building/visualizer', label: '3D guitar visualizer (spike)' }]}
                />
              }
            />
            <Route
              path="/guitar-building/visualizer"
              element={
                <Suspense
                  fallback={
                    <section className="stub">
                      <h1>3D electric guitar visualizer</h1>
                      <p>Loading viewer…</p>
                    </section>
                  }
                >
                  <GuitarVisualizerPage />
                </Suspense>
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
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/buy/success" element={<BuySuccessPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}
