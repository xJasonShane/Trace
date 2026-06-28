/**
 * 评分维度常量
 * 统一管理四维评分的 key 与中文标签，避免多处重复定义
 */

export const RATING_DIMENSIONS = [
	{ key: 'environment', label: '环境' },
	{ key: 'scenery', label: '风景' },
	{ key: 'transport', label: '交通' },
	{ key: 'experience', label: '体验' }
]

// 默认评分（满分 5）
export const DEFAULT_RATINGS = {
	environment: 5,
	scenery: 5,
	transport: 5,
	experience: 5
}

/**
 * 计算综合评分（四维度平均值，保留一位小数）
 * @param {Object} ratings 评分对象
 * @returns {number}
 */
export function calcOverallRating(ratings) {
	const vals = Object.values(ratings)
	if (vals.length === 0) return 0
	return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export default {
	RATING_DIMENSIONS,
	DEFAULT_RATINGS,
	calcOverallRating
}
