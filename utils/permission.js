/**
 * 权限被拒引导工具
 * 统一处理定位、相机、相册等权限被拒场景，给出可操作的引导
 */

/**
 * 从错误对象中判断是否为权限被拒
 * @param {Error|Object} err 错误对象
 * @returns {boolean}
 */
function isPermissionDenied(err) {
	if (!err) return false
	const msg = (err.errMsg || err.message || String(err)).toLowerCase()
	// 常见拒权错误关键字：cancel（用户取消）不算拒权
	if (msg.includes('cancel')) return false
	return (
		msg.includes('auth deny') ||
		msg.includes('auth denied') ||
		msg.includes('authorize') ||
		msg.includes('permission') ||
		msg.includes('fail') && (msg.includes('location') || msg.includes('camera') || msg.includes('writephotosalbum'))
	)
}

/**
 * 检查并引导权限
 * 若错误为权限被拒，弹窗解释原因并提供「去设置」入口；否则返回 false 让调用方自行处理
 * @param {Error|Object} err 错误对象
 * @param {{ name?: string, desc?: string }} options 配置：name 权限名（如「定位」），desc 用途说明
 * @returns {boolean} 是否已处理（true 表示已弹引导，调用方无需再 toast）
 */
function handlePermissionDenied(err, options = {}) {
	if (!isPermissionDenied(err)) return false
	const name = options.name || '该功能'
	const desc = options.desc || '完成此操作'
	uni.showModal({
		title: `${name}权限未授权`,
		content: `${name}权限未开启，无法${desc}。\n你可以在系统设置中开启权限后返回继续。是否现在前往设置？`,
		confirmText: '去设置',
		cancelText: '暂不',
		success: (res) => {
			if (res.confirm) {
				openAppSetting()
			}
		}
	})
	return true
}

/**
 * 打开应用设置页（跨端兼容）
 * - 微信小程序：uni.openSetting
 * - App：跳转系统应用详情页（uni 无法直接打开，需通过 plus.runtime.openURL）
 * - 其他端：仅 toast 提示
 */
function openAppSetting() {
	// #ifdef MP-WEIXIN
	uni.openSetting({
		success: (res) => {
			if (res.authSetting && Object.values(res.authSetting).some(v => v)) {
				uni.showToast({ title: '权限已更新', icon: 'success' })
			}
		},
		fail: () => {
			uni.showToast({ title: '打开设置失败', icon: 'none' })
		}
	})
	// #endif
	// #ifdef APP-PLUS
	try {
		const Intent = plus.android.importClass('android.content.Intent')
		const Settings = plus.android.importClass('android.provider.Settings')
		const Uri = plus.android.importClass('android.net.Uri')
		const mainActivity = plus.android.runtimeMainActivity()
		const intent = new Intent()
		intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
		const uri = Uri.fromParts('package', mainActivity.getPackageName(), null)
		intent.setData(uri)
		mainActivity.startActivity(intent)
	} catch (e) {
		console.error('打开 App 设置失败:', e)
		uni.showToast({ title: '请前往系统设置开启权限', icon: 'none' })
	}
	// #endif
	// #ifndef MP-WEIXIN || APP-PLUS
	uni.showToast({ title: '请在浏览器或系统设置中开启权限', icon: 'none' })
	// #endif
}

/**
 * 包装定位调用，统一处理失败引导
 * @param {Object} options uni.getLocation 的参数
 * @param {Object} handlers { onSuccess, onFail } 成功/失败回调
 */
function getLocationWithGuide(options = {}, handlers = {}) {
	uni.getLocation({
		...options,
		success: (res) => {
			if (handlers.onSuccess) handlers.onSuccess(res)
		},
		fail: (err) => {
			const handled = handlePermissionDenied(err, {
				name: '定位',
				desc: '获取当前位置并记录到手账'
			})
			if (!handled && handlers.onFail) {
				handlers.onFail(err)
			}
		}
	})
}

/**
 * 包装 chooseImage 调用，统一处理失败引导
 * @param {Object} options uni.chooseImage 的参数
 * @param {Object} handlers { onSuccess, onFail }
 */
function chooseImageWithGuide(options = {}, handlers = {}) {
	uni.chooseImage({
		...options,
		success: (res) => {
			if (handlers.onSuccess) handlers.onSuccess(res)
		},
		fail: (err) => {
			const handled = handlePermissionDenied(err, {
				name: '相册/相机',
				desc: '选择照片记录手账'
			})
			if (!handled && handlers.onFail) {
				handlers.onFail(err)
			}
		}
	})
}

export default {
	isPermissionDenied,
	handlePermissionDenied,
	openAppSetting,
	getLocationWithGuide,
	chooseImageWithGuide
}
