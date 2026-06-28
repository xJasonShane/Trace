/**
 * 封面色调常量
 * 统一管理封面色调 key 列表与对应描边色，避免多处硬编码
 */

// 封面色调 key 列表（顺序即展示顺序）
export const COVER_COLORS = ['warm', 'blue', 'lavender', 'green', 'gold']

// 色调 key → 描边色 hex（用于图标描边，比填充色略深）
export const COVER_STROKE_COLORS = {
	warm: '#C09080',
	blue: '#7A9AB5',
	lavender: '#9880B0',
	green: '#789A78',
	gold: '#B8A068'
}

/**
 * 随机返回一个封面色调 key
 * @returns {string}
 */
export function randomCoverColor() {
	return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)]
}

/**
 * 根据封面色调获取描边色 hex
 * @param {string} coverColor 色调 key
 * @returns {string} hex 色值，默认 warm 对应描边色
 */
export function getCoverStrokeColor(coverColor) {
	return COVER_STROKE_COLORS[coverColor] || COVER_STROKE_COLORS.warm
}

export default {
	COVER_COLORS,
	COVER_STROKE_COLORS,
	randomCoverColor,
	getCoverStrokeColor
}
