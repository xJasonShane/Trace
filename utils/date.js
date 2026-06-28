/**
 * 日期处理工具
 */

/**
 * 校验日期是否有效
 * @param {Date} d
 * @returns {boolean}
 */
function isValid(d) {
	return d instanceof Date && !isNaN(d.getTime())
}

/**
 * 将任意值转换为有效 Date，无效则返回 null
 * @param {Date|string|number} date
 * @returns {Date|null}
 */
function toDate(date) {
	const d = date instanceof Date ? date : new Date(date)
	return isValid(d) ? d : null
}

/**
 * 内部：补零到两位
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
	return String(n).padStart(2, '0')
}

/**
 * 内部：抽取日期各部分
 * @param {Date|string|number} date
 * @returns {{y:number,m:string,day:string,h:string,min:string}|null}
 */
function _parts(date) {
	const d = toDate(date)
	if (!d) return null
	return {
		y: d.getFullYear(),
		m: pad2(d.getMonth() + 1),
		day: pad2(d.getDate()),
		h: pad2(d.getHours()),
		min: pad2(d.getMinutes())
	}
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string|number} date
 * @returns {string} 无效日期返回 ''
 */
function formatDate(date) {
	const p = _parts(date)
	return p ? `${p.y}-${p.m}-${p.day}` : ''
}

/**
 * 格式化日期为 YYYY.MM.DD
 * @param {Date|string|number} date
 * @returns {string} 无效日期返回 ''
 */
function formatDateDot(date) {
	const p = _parts(date)
	return p ? `${p.y}.${p.m}.${p.day}` : ''
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date
 * @returns {string} YYYY-MM-DD HH:mm，无效日期返回 ''
 */
function formatDateTime(date) {
	const p = _parts(date)
	return p ? `${p.y}-${p.m}-${p.day} ${p.h}:${p.min}` : ''
}

/**
 * 获取相对时间描述
 * @param {Date|string|number} date
 * @returns {string} 如 "2小时前"、"昨天"、"3天前"，无效日期返回 ''
 */
function formatRelative(date) {
	const d = toDate(date)
	if (!d) return ''
	const now = new Date()
	const diff = now - d
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 1) return '刚刚'
	if (minutes < 60) return `${minutes}分钟前`
	if (hours < 24) return `${hours}小时前`
	if (days === 1) return '昨天'
	if (days < 7) return `${days}天前`
	if (days < 30) return `${Math.floor(days / 7)}周前`
	return formatDate(d)
}

/**
 * 获取日期分组标签
 * @param {Date|string|number} date
 * @returns {string} "今天"、"昨天"、"上周"、"更早"，无效日期返回 ''
 */
function getDateGroup(date) {
	const d = toDate(date)
	if (!d) return ''
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
	const diffDays = Math.floor((today - target) / 86400000)

	if (diffDays === 0) return '今天'
	if (diffDays === 1) return '昨天'
	if (diffDays < 7) return '本周'
	if (diffDays < 14) return '上周'
	if (diffDays < 30) return '本月'
	return '更早'
}

export default {
	formatDate,
	formatDateDot,
	formatDateTime,
	formatRelative,
	getDateGroup,
	toDate,
	isValid
}
