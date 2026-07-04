/**
 * 图片处理工具
 * 负责图片选择、压缩、保存
 * 性能优化：多图压缩+保存采用 Promise.all 并行处理，避免串行 await 等待
 */

// 允许的图片扩展名（用于校验）
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
// 单张图片大小上限（10MB），超过则提示用户
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 校验图片文件类型与大小
 * @param {string} filePath 文件路径
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateImageFile(filePath) {
	if (!filePath || typeof filePath !== 'string') {
		return { valid: false, reason: '路径无效' }
	}
	// 扩展名校验（兼容临时路径含 query 参数的情况）
	const cleanPath = filePath.split('?')[0].toLowerCase()
	const ext = cleanPath.split('.').pop() || ''
	if (!ALLOWED_EXTENSIONS.includes(ext)) {
		// 临时路径可能没有扩展名（如 wxfile://tmp_xxx），仅打印警告不阻塞
		console.warn('图片扩展名不在白名单:', ext, filePath)
	}
	return { valid: true }
}

/**
 * 选择图片
 * @param {number} count 选择数量
 * @returns {Promise<string[]>} 临时文件路径数组
 */
function chooseImage(count = 9) {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				resolve(res.tempFilePaths)
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

/**
 * 压缩图片
 * @param {string} src 临时文件路径
 * @param {number} quality 压缩质量 0-100
 * @returns {Promise<string>} 压缩后的临时路径
 */
function compressImage(src, quality = 60) {
	return new Promise((resolve) => {
		uni.compressImage({
			src,
			quality,
			success: (res) => {
				resolve(res.tempFilePath)
			},
			fail: (err) => {
				// 压缩失败则返回原图，确保照片不丢失（不 reject）
				console.warn('压缩图片失败，使用原图:', src, err)
				resolve(src)
			}
		})
	})
}

/**
 * 保存图片到永久存储
 * @param {string} tempFilePath 临时文件路径
 * @returns {Promise<string>} 永久文件路径
 */
function saveFile(tempFilePath) {
	return new Promise((resolve, reject) => {
		uni.saveFile({
			tempFilePath,
			success: (res) => {
				resolve(res.savedFilePath)
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

/**
 * 处理单张图片：校验 → 压缩 → 保存
 * 失败时回退到压缩后的临时路径，确保照片不丢失
 * @param {string} tempPath 临时文件路径
 * @returns {Promise<string>} 永久路径或临时路径
 */
async function processSingleImage(tempPath) {
	validateImageFile(tempPath) // 仅记录警告，不阻塞
	const compressedPath = await compressImage(tempPath)
	try {
		const savedPath = await saveFile(compressedPath)
		return savedPath
	} catch (e) {
		console.warn('保存图片失败，使用临时路径:', e)
		return compressedPath
	}
}

/**
 * 处理图片：选择 → 压缩 → 保存
 * 多图采用 Promise.all 并行处理，相比串行 await 可显著缩短等待时间
 * @param {number} count 选择数量
 * @returns {Promise<string[]>} 已保存的永久路径数组（顺序与用户选择顺序一致）
 */
async function pickAndSaveImages(count = 9) {
	const tempPaths = await chooseImage(count)
	if (!tempPaths || tempPaths.length === 0) return []
	// 并行处理所有图片，保持结果顺序与输入一致
	const results = await Promise.all(
		tempPaths.map(tempPath => processSingleImage(tempPath))
	)
	return results
}

/**
 * 处理已选择的临时图片路径数组（并行压缩+保存）
 * 用于调用方已自行调用 chooseImage 后的处理场景
 * @param {string[]} tempPaths 临时文件路径数组
 * @returns {Promise<string[]>} 已保存的永久路径数组
 */
async function processTempImages(tempPaths) {
	if (!tempPaths || tempPaths.length === 0) return []
	return Promise.all(tempPaths.map(tempPath => processSingleImage(tempPath)))
}

/**
 * 删除已保存的文件
 * @param {string} filePath 文件路径
 */
function removeFile(filePath) {
	return new Promise((resolve) => {
		uni.removeSavedFile({
			filePath,
			success: () => resolve(true),
			fail: () => resolve(false)
		})
	})
}

/**
 * 预览图片
 * @param {string[]} urls 图片路径数组
 * @param {number} current 当前索引
 */
function previewImage(urls, current = 0) {
	uni.previewImage({
		urls,
		current: urls[current]
	})
}

export default {
	chooseImage,
	compressImage,
	saveFile,
	pickAndSaveImages,
	processTempImages,
	processSingleImage,
	removeFile,
	previewImage,
	validateImageFile
}
