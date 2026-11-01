import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { StubPage } from './components/StubPage'
import { AppProductPage } from './pages/AppProductPage'
import { AppsIndexPage } from './pages/AppsIndexPage'
import { BuyPage } from './pages/BuyPage'
import { BuySuccessPage } from './pages/BuySuccessPage'
import { HomePage } from './pages/HomePage'
import { AUDIO_TOOL_PAGES } from './audioToolPages.ts'
import { GUITAR_TOOL_PAGES } from './guitarToolPages.ts'
import { AudioHubPage } from './pages/AudioHubPage.tsx'
import { ComingSoonTool } from './pages/ComingSoonTool.tsx'
import { GuitarHubPage } from './pages/GuitarHubPage.tsx'
import { ToolsIndexPage } from './pages/ToolsIndexPage.tsx'
import './styles/global.css'

function AudioToolRoute() {
  const { slug = '' } = useParams()
  const Page = AUDIO_TOOL_PAGES[slug]
  if (!Page) return <ComingSoonTool hubHref="/audio-live-sound/" hubLabel="Audio / live sound" />
  return (
    <Suspense fallback={<section className="stub"><h1>Loading calculator…</h1></section>}>
      <Page />
    </Suspense>
  )
}

function GuitarToolRoute() {
  const { slug = '' } = useParams()
  const Page = GUITAR_TOOL_PAGES[slug]
  if (!Page) return <ComingSoonTool hubHref="/guitar-building/" hubLabel="Guitar building" />
  return (
    <Suspense fallback={<section className="stub"><h1>Loading calculator…</h1></section>}>
      <Page />
    </Suspense>
  )
}

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
            <Route path="/tools" element={<ToolsIndexPage />} />
            <Route path="/audio-live-sound" element={<AudioHubPage />} />
            <Route path="/audio-live-sound/:slug" element={<AudioToolRoute />} />
            <Route path="/guitar-building" element={<GuitarHubPage />} />
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
            <Route path="/guitar-building/:slug" element={<GuitarToolRoute />} />
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
