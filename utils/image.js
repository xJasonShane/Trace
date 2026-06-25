/**
 * 图片处理工具
 * 负责图片选择、压缩、保存
 */

/**
 * 选择图片
 * 优先使用 chooseMedia（微信小程序新 API），降级到 chooseImage
 * @param {number} count 选择数量
 * @returns {Promise<string[]>} 临时文件路径数组
 */
function chooseImage(count = 9) {
	return new Promise((resolve, reject) => {
		if (uni.chooseMedia) {
			uni.chooseMedia({
				count,
				mediaType: ['image'],
				sourceType: ['album', 'camera'],
				sizeType: ['compressed'],
				success: (res) => {
					const paths = (res.tempFiles || []).map(f => f.tempFilePath)
					resolve(paths)
				},
				fail: (err) => reject(err)
			})
		} else {
			uni.chooseImage({
				count,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => resolve(res.tempFilePaths),
				fail: (err) => reject(err)
			})
		}
	})
}

/**
 * 压缩图片
 * @param {string} src 临时文件路径
 * @param {number} quality 压缩质量 0-100
 * @returns {Promise<string>} 压缩后的临时路径
 */
function compressImage(src, quality = 60) {
	return new Promise((resolve, reject) => {
		uni.compressImage({
			src,
			quality,
			success: (res) => {
				resolve(res.tempFilePath)
			},
			fail: () => {
				// 压缩失败则返回原图
				resolve(src)
			}
		})
	})
}

/**
 * 保存图片到永久存储
 * H5 平台不支持 saveFile，直接使用临时路径（blob URL）
 * @param {string} tempFilePath 临时文件路径
 * @returns {Promise<string>} 永久文件路径
 */
function saveFile(tempFilePath) {
	return new Promise((resolve, reject) => {
		// #ifdef H5
		resolve(tempFilePath)
		return
		// #endif
		// #ifndef H5
		uni.saveFile({
			tempFilePath,
			success: (res) => {
				resolve(res.savedFilePath)
			},
			fail: (err) => {
				reject(err)
			}
		})
		// #endif
	})
}

/**
 * 处理图片：选择 → 压缩 → 保存
 * @param {number} count 选择数量
 * @returns {Promise<string[]>} 已保存的永久路径数组
 */
async function pickAndSaveImages(count = 9) {
	const tempPaths = await chooseImage(count)
	const savedPaths = []

	for (const tempPath of tempPaths) {
		const compressedPath = await compressImage(tempPath)
		try {
			const savedPath = await saveFile(compressedPath)
			savedPaths.push(savedPath)
		} catch (e) {
			// saveFile 失败时回退到压缩后的临时路径，确保照片不丢失
			console.warn('保存图片失败，使用临时路径:', e)
			savedPaths.push(compressedPath)
		}
	}

	return savedPaths
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
	removeFile,
	previewImage
}
