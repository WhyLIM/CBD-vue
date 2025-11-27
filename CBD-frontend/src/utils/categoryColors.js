export const getCategoryColor = (category) => {
  const palette = [
    '#5560AC', '#FCBB44', '#08306B', '#D3F0F2', '#67000d',
    '#ED6F6E', '#1F4527', '#D2D6F5', '#0D8B43', '#F4EEAC',
    '#FED98E', '#4758A2', '#C9DCC4', '#37939A', '#F28147',
    '#619CD9', '#EDADC5', '#F1766D', '#6CBEC3',
    '#9ECAE1', '#68BD48', '#D8D9DA', '#7A70B5'
  ]
  const hash = Array.from(category || '').reduce((s, c) => s + c.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

const brightness = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return Math.sqrt(0.299 * r ** 2 + 0.587 * g ** 2 + 0.114 * b ** 2) * 255
}

export const getTextColorClass = (category) => {
  const bg = getCategoryColor(category)
  return brightness(bg) > 150 ? 'text-black' : 'text-white'
}
