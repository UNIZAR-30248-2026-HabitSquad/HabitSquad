import { card, cardChip, cardLabel, cardValue, progressBars } from '../card.js'
import { BARRA_VACIA, ESTADOS, conEstado } from './estados.js'

export function hoyCard({ miembros = [], className = '' } = {}) {
  const estados = conEstado(miembros).map(({ estado }) => estado)
  const cumplidos = estados.filter((estado) => estado === 'cumplido').length
  return card(
    className,
    cardChip('check', 'bg-[#e8f5ec] text-[#248a3d]'),
    cardLabel('Hoy'),
    cardValue(`${cumplidos}/${estados.length}`),
    progressBars(estados.map((estado) => (estado === 'cumplido' ? ESTADOS.cumplido.barra : BARRA_VACIA))),
  )
}
