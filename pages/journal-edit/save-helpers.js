/**
 * 手账保存逻辑的纯函数集合
 * 从 save() 方法中提取，便于独立测试和复用
 */

/**
 * 将用户选择的日期与给定时间组合为完整时间戳
 * @param {string} dateStr - 日期字符串，格式 YYYY-MM-DD
 * @param {Date} now - 当前时间
 * @returns {string} 格式 YYYY-MM-DD HH:mm
 */
export function combineDateWithCurrentTime(dateStr, now) {
	const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
	return dateStr + ' ' + timeStr
}

/**
 * 构建手账保存数据对象
 * @param {Object} form - 表单数据
 * @param {string} locationId - 关联地点ID
 * @param {string} createdAt - 创建时间戳
 * @returns {Object} 手账数据对象
 */
export function buildJournalData(form, locationId, createdAt) {
	return {
		title: form.title.trim(),
		locationId,
		locationName: form.locationName.trim(),
		content: form.content.trim(),
		photos: form.photos,
		mood: form.mood,
		createdAt,
		ratings: { ...form.ratings },
		tags: [...form.tags]
	}
}

/**
 * 判断地点坐标是否需要更新
 * 坐标为 0 时不更新（保持与原逻辑一致的 falsy 判断）
 * @param {Object|null} loc - 地点对象
 * @param {Object} form - 表单数据
 * @returns {boolean}
 */
export function shouldUpdateCoordinates(loc, form) {
	if (!loc) return false
	if (!form.locationLat || !form.locationLng) return false
	return loc.latitude !== form.locationLat || loc.longitude !== form.locationLng
}

/**
 * 构建地点更新数据
 * @param {Object} form - 表单数据
 * @param {Object} loc - 地点对象
 * @returns {Object} 更新数据
 */
export function buildLocationUpdatePayload(form, loc) {
	return {
		latitude: form.locationLat,
		longitude: form.locationLng,
		address: form.locationAddress || loc.address
	}
}

/**
 * 计算地点关联手账的照片总数
 * @param {Array} journals - 手账数组
 * @returns {number}
 */
export function calcLocationPhotoCount(journals) {
	return journals.reduce(
		(sum, j) => sum + (j.photos ? j.photos.length : 0),
		0
	)
}
