export type AppPreview = {
  name: string
  path: string
  blurb: string
  image: string
  catalogKey: 'stripper' | 'mixer' | 'leveler'
}

export const APP_PREVIEWS: AppPreview[] = [
  {
    name: 'Podcast Stripper',
    path: '/apps/podcast-stripper',
    blurb: 'Stereo mix → speaker tracks + music.',
    image: '/apps/podcast-stripper.png',
    catalogKey: 'stripper',
  },
  {
    name: 'Fixer Mixer',
    path: '/apps/fixer-mixer',
    blurb: 'Stems → polish → bounce.',
    image: '/apps/fixer-mixer.png',
    catalogKey: 'mixer',
  },
  {
    name: 'Lil Leveler',
    path: '/apps/lil-leveler',
    blurb: 'Final mix → platform loudness.',
    image: '/apps/lil-leveler.png',
    catalogKey: 'leveler',
  },
]
