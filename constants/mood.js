/**
 * 心情相关常量
 * 统一管理心情 emoji、颜色映射、标签，避免多处重复定义导致不一致
 */

// 心情 emoji 列表（顺序即展示顺序）
export const MOODS = [
	{ emoji: '😊', label: '开心' },
	{ emoji: '🌸', label: '美好' },
	{ emoji: '☀️', label: '晴朗' },
	{ emoji: '🌙', label: '宁静' },
	{ emoji: '🍂', label: '感怀' }
]

// 心情到封面色调的映射（用于照片占位渐变）
// 色调类型：warm | blue | lavender | green | gold
export const MOOD_COLOR_MAP = {
	'😊': 'warm',
	'🌸': 'lavender',
	'☀️': 'gold',
	'🌙': 'blue',
	'🍂': 'green'
}

// 色调 key → 实际展示色值（用于图表填充、统计等需要 hex 的场景）
export const MOOD_COLOR_HEX = {
	warm: '#E09080',
	lavender: '#B8A0D0',
	gold: '#DDB86A',
	blue: '#7FA3C8',
	green: '#8FB888'
}

/**
 * 根据心情获取封面色调
 * @param {string} mood 心情 emoji
 * @returns {string} 色调 key，默认 'warm'
 */
export function getMoodColor(mood) {
	return MOOD_COLOR_MAP[mood] || 'warm'
}

/**
 * 根据心情获取展示色值（hex）
 * @param {string} mood 心情 emoji
 * @returns {string} hex 色值，默认 warm 对应色
 */
export function getMoodColorHex(mood) {
	return MOOD_COLOR_HEX[getMoodColor(mood)] || MOOD_COLOR_HEX.warm
}

export default {
	MOODS,
	MOOD_COLOR_MAP,
	MOOD_COLOR_HEX,
	getMoodColor,
	getMoodColorHex
}
