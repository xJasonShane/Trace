/**
 * 导航工具
 */

/**
 * 安全返回上一页
 * 优先 navigateBack，若无上一页则 reLaunch 到 fallbackUrl
 * @param {string} fallbackUrl 兜底跳转路径，默认首页
 */
export function safeBack(fallbackUrl = '/pages/index/index') {
	const pages = getCurrentPages()
	if (pages.length > 1) {
		uni.navigateBack()
	} else {
		uni.reLaunch({ url: fallbackUrl })
	}
}

export default {
	safeBack
}
