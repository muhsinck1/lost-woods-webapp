export interface Story {
  id: string
  title: string
  subtitle: string
  era: string
  color: string
  icon: string
  coords: [number, number]
  zoom: number
  pitch: number
  bearing: number
  body: string
  highlightLayerId?: string
}

export const STORIES: Story[] = [
  {
    id: 'ancient-woodland',
    title: 'Ancient Woodland',
    subtitle: 'Deciduous forest corridors of Sussex',
    era: 'STANDING FOR CENTURIES',
    color: '#2d5a27',
    icon: '🌳',
    coords: [-0.183, 50.922],
    zoom: 14.5,
    pitch: 55,
    bearing: -20,
    body: `The Lost Woods area harbours some of West Sussex's most significant ancient deciduous woodland. These long-established oak and ash forests support extraordinary biodiversity — from rare invertebrates to woodland birds and fungi that form hidden mycorrhizal networks beneath the forest floor.`,
    highlightLayerId: 'phi'
  },
  {
    id: 'chalk-grassland',
    title: 'Chalk Grasslands',
    subtitle: 'The richest habitat for wildflowers in Britain',
    era: 'A LIVING TAPESTRY',
    color: '#3a5c2a',
    icon: '🌸',
    coords: [-0.230, 50.934],
    zoom: 14.0,
    pitch: 35,
    bearing: 10,
    body: `Lowland calcareous grassland on the Sussex chalk supports more species per square metre than almost any other habitat in Britain. Chalkhill blue butterflies, common spotted orchids, and yellow rattle thrive where traditional grazing maintains the open sward against scrub encroachment.`,
    highlightLayerId: 'phi'
  },
  {
    id: 'hidden-trails',
    title: 'Hidden Trails',
    subtitle: 'Paths through the Low Weald',
    era: 'PATHS THROUGH TIME',
    color: '#6b4c2a',
    icon: '🥾',
    coords: [-0.270, 50.940],
    zoom: 13.8,
    pitch: 40,
    bearing: 30,
    body: `The trail network around Hurstpierpoint and Henfield winds through a patchwork of ancient woodland, meadow, and traditional farmland. These routes connect habitat patches that together form a critical wildlife corridor across the Low Weald landscape of West Sussex.`,
    highlightLayerId: 'ecohabitat'
  },
  {
    id: 'fungi-network',
    title: 'The Fungal Web',
    subtitle: 'Underground connections',
    era: 'THE HIDDEN FOREST',
    color: '#6b1a8b',
    icon: '🍄',
    coords: [-0.190, 50.915],
    zoom: 14.5,
    pitch: 45,
    bearing: -10,
    body: `Beneath the woodland floor lies an invisible network of fungal mycelium connecting tree roots across hundreds of metres. Over 1,400 fungi observations have been recorded in this area — from waxcaps on unimproved grassland to rare woodland species found only in ancient forest sites.`,
    highlightLayerId: 'fungi'
  },
  {
    id: 'bird-corridors',
    title: 'Bird Corridors',
    subtitle: 'Woodland and hedgerow connections',
    era: 'WINGS ACROSS THE WEALD',
    color: '#1a4a6b',
    icon: '🐦',
    coords: [-0.250, 50.925],
    zoom: 13.5,
    pitch: 30,
    bearing: 20,
    body: `Over 1,400 bird observations recorded across this area reveal a rich avifauna dependent on the mosaic of woodland, hedgerow, and grassland. From tawny owls hunting along woodland edges to warblers nesting in dense scrub, every habitat patch plays a vital role in sustaining these populations.`,
    highlightLayerId: 'birds'
  }
]
