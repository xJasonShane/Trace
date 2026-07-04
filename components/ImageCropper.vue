<template>
	<view v-if="visible" class="cropper-mask" @touchmove.stop.prevent="noop">
		<view class="cropper-container">
			<!-- 标题 -->
			<view class="cropper-header">
				<text class="cropper-title">裁剪头像</text>
			</view>

			<!-- 预览裁剪区域 -->
			<view class="cropper-preview" :style="{ width: previewSize + 'px', height: previewSize + 'px' }">
				<image
					:src="imageSrc"
					class="crop-image"
					mode="scaleToFill"
					:style="imageStyle"
					@touchstart="onTouchStart"
					@touchmove="onTouchMove"
					@touchend="onTouchEnd"
				/>
				<!-- 裁剪框边框 -->
				<view class="crop-frame"></view>
			</view>

			<!-- 操作区 -->
			<view class="cropper-controls">
				<view class="zoom-row">
					<text class="zoom-label">缩放</text>
					<slider
						class="zoom-slider"
						:min="scaleMin"
						:max="scaleMax"
						:value="scalePercent"
						@change="onScaleChange"
						block-size="20"
						:activeColor="colorPrimary"
						:backgroundColor="colorBg"
					/>
				</view>
				<view class="cropper-buttons">
					<view class="btn-cancel" @tap="onCancel">取消</view>
					<view class="btn-confirm" @tap="onConfirm">确认</view>
				</view>
			</view>

			<!-- 隐藏 canvas 用于裁剪输出 -->
			<canvas canvas-id="cropCanvas" class="crop-canvas" :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"></canvas>
		</view>
	</view>
</template>

<script>
/**
 * 图片裁剪组件
 * 支持拖拽调整位置、双指/滑块缩放，确认后通过 canvas 输出正方形裁剪图
 *
 * 性能：onTouchMove 使用 requestAnimationFrame 合并 setData，
 * 避免高频触摸事件直接触发渲染抖动；H5/App 用原生 rAF，小程序回退 setTimeout(16)
 */
import timersMixin from '@/mixins/timers.js'

// 缩放范围（百分比）
const SCALE_MIN_PCT = 100
const SCALE_MAX_PCT = 300
// 缩放范围（倍数）
const SCALE_MIN = 1
const SCALE_MAX = 3
// 预览区尺寸上限（px）
const PREVIEW_MAX = 300
// 裁剪输出尺寸（px）
const CANVAS_OUTPUT_SIZE = 300
// 主色（slider 不支持 CSS 变量，需 hex）
const COLOR_PRIMARY = '#E09080'
const COLOR_BG = '#E0DCD7'

export default {
	name: 'ImageCropper',
	mixins: [timersMixin],
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		imageSrc: {
			type: String,
			default: ''
		}
	},
	emits: ['confirm', 'cancel'],
	data() {
		return {
			previewSize: 280,
			canvasSize: CANVAS_OUTPUT_SIZE,
			imgW: 0,
			imgH: 0,
			offsetX: 0,
			offsetY: 0,
			scale: 1,
			scalePercent: SCALE_MIN_PCT,
			// 触摸状态
			isDragging: false,
			isScaling: false,
			touchStartX: 0,
			touchStartY: 0,
			startOffsetX: 0,
			startOffsetY: 0,
			pinchStartDist: 0,
			scaleStart: 1,
			// rAF 节流状态（非响应式）
			_rafPending: false,
			_pendingUpdate: null,
			// 已注册的 rAF id（H5/App 端），用于卸载时真正取消回调
			_rafId: 0,
			// slider 配置
			scaleMin: SCALE_MIN_PCT,
			scaleMax: SCALE_MAX_PCT,
			colorPrimary: COLOR_PRIMARY,
			colorBg: COLOR_BG
		}
	},
	computed: {
		imageStyle() {
			return {
				width: (this.imgW * this.scale) + 'px',
				height: (this.imgH * this.scale) + 'px',
				left: this.offsetX + 'px',
				top: this.offsetY + 'px'
			}
		}
	},
	watch: {
		visible(val) {
			if (val && this.imageSrc) {
				this.$nextTick(() => {
					this.initImage()
				})
			} else if (!val) {
				// 关闭时取消已注册的 rAF 回调并清理状态，避免组件隐藏后回调仍触发 setData
				this._cancelRaf()
			}
		},
		// 当弹窗已显示但图片源变化时，重新初始化图片
		imageSrc(val) {
			if (val && this.visible) {
				this.$nextTick(() => {
					this.initImage()
				})
			}
		}
	},
	mounted() {
		const sys = uni.getSystemInfoSync()
		this.previewSize = Math.min(Math.floor(sys.windowWidth * 0.7), PREVIEW_MAX)
	},
	beforeUnmount() {
		this._cancelRaf()
	},
	methods: {
		noop() {},
		// 获取图片信息，计算 cover 模式初始尺寸
		initImage() {
			uni.getImageInfo({
				src: this.imageSrc,
				success: (info) => {
					const nw = info.width
					const nh = info.height
					// cover 模式：等比缩放填满预览区域
					const ratio = Math.max(this.previewSize / nw, this.previewSize / nh)
					this.imgW = nw * ratio
					this.imgH = nh * ratio
					// 居中
					this.offsetX = (this.previewSize - this.imgW) / 2
					this.offsetY = (this.previewSize - this.imgH) / 2
					this.scale = 1
					this.scalePercent = SCALE_MIN_PCT
				},
				fail: () => {
					uni.showToast({ title: '图片加载失败', icon: 'none' })
					this.onCancel()
				}
			})
		},
		// 计算两点距离
		getDistance(t1, t2) {
			const dx = t1.clientX - t2.clientX
			const dy = t1.clientY - t2.clientY
			return Math.sqrt(dx * dx + dy * dy)
		},
		onTouchStart(e) {
			if (e.touches.length === 2) {
				this.isScaling = true
				this.isDragging = false
				this.pinchStartDist = this.getDistance(e.touches[0], e.touches[1])
				this.scaleStart = this.scale
			} else if (e.touches.length === 1) {
				this.isDragging = true
				this.isScaling = false
				this.touchStartX = e.touches[0].clientX
				this.touchStartY = e.touches[0].clientY
				this.startOffsetX = this.offsetX
				this.startOffsetY = this.offsetY
			}
		},
		onTouchMove(e) {
			// 计算最新值，但不直接 setData，交给 rAF 合并写入
			let update = null
			if (this.isScaling && e.touches.length === 2) {
				const dist = this.getDistance(e.touches[0], e.touches[1])
				let s = this.scaleStart * (dist / this.pinchStartDist)
				s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, s))
				update = {
					scale: s,
					scalePercent: Math.round(s * 100),
					offsetX: this.offsetX,
					offsetY: this.offsetY
				}
			} else if (this.isDragging && e.touches.length === 1) {
				const dx = e.touches[0].clientX - this.touchStartX
				const dy = e.touches[0].clientY - this.touchStartY
				update = {
					offsetX: this.startOffsetX + dx,
					offsetY: this.startOffsetY + dy,
					scale: this.scale,
					scalePercent: this.scalePercent
				}
			}
			if (update) {
				this._scheduleRafUpdate(update)
			}
		},
		/**
		 * 调度 rAF 合并写入：高频 touchmove 期间只在一帧内更新一次状态
		 * 跨端：H5/App 用 window.requestAnimationFrame，小程序用 setTimeout(16) 回退
		 */
		_scheduleRafUpdate(update) {
			this._pendingUpdate = update
			if (this._rafPending) return
			this._rafPending = true
			const run = () => {
				this._rafPending = false
				this._rafId = 0
				const u = this._pendingUpdate
				this._pendingUpdate = null
				if (!u) return
				this.offsetX = u.offsetX
				this.offsetY = u.offsetY
				this.scale = u.scale
				this.scalePercent = u.scalePercent
			}
			// #ifdef H5 || APP-PLUS
			if (typeof window !== 'undefined' && window.requestAnimationFrame) {
				this._rafId = window.requestAnimationFrame(run)
				return
			}
			// #endif
			// #ifndef H5 || APP-PLUS
			const tid = setTimeout(run, 16)
			this._timers.push(tid)
			// #endif
		},
		/**
		 * 取消待执行的 rAF（组件卸载/弹窗关闭时调用）
		 * H5/App 端需调用 cancelAnimationFrame 真正取消已注册的回调，
		 * 否则组件销毁后回调仍会执行 setData，可能引发告警或异常
		 */
		_cancelRaf() {
			// #ifdef H5 || APP-PLUS
			if (this._rafId && typeof window !== 'undefined' && window.cancelAnimationFrame) {
				window.cancelAnimationFrame(this._rafId)
			}
			// #endif
			this._rafId = 0
			this._rafPending = false
			this._pendingUpdate = null
		},
		onTouchEnd() {
			// 触摸结束时若有挂起的更新，立即 flush
			if (this._pendingUpdate) {
				const u = this._pendingUpdate
				this._pendingUpdate = null
				this._rafPending = false
				this.offsetX = u.offsetX
				this.offsetY = u.offsetY
				this.scale = u.scale
				this.scalePercent = u.scalePercent
			}
			if (this.isDragging) {
				this.clampPosition()
			}
			this.isScaling = false
			this.isDragging = false
		},
		// 限制图片位置，确保覆盖整个预览区域
		clampPosition() {
			const dw = this.imgW * this.scale
			const dh = this.imgH * this.scale
			const minX = this.previewSize - dw
			const maxX = 0
			const minY = this.previewSize - dh
			const maxY = 0
			this.offsetX = Math.max(minX, Math.min(maxX, this.offsetX))
			this.offsetY = Math.max(minY, Math.min(maxY, this.offsetY))
		},
		onScaleChange(e) {
			this.scale = e.detail.value / 100
			this.scalePercent = e.detail.value
			this.clampPosition()
		},
		onCancel() {
			this.$emit('cancel')
		},
		onConfirm() {
			uni.showLoading({ title: '裁剪中…' })
			this.clampPosition()
			const ratio = this.canvasSize / this.previewSize
			const drawX = this.offsetX * ratio
			const drawY = this.offsetY * ratio
			const drawW = (this.imgW * this.scale) * ratio
			const drawH = (this.imgH * this.scale) * ratio

			const ctx = uni.createCanvasContext('cropCanvas', this)
			ctx.clearRect(0, 0, this.canvasSize, this.canvasSize)
			ctx.drawImage(this.imageSrc, drawX, drawY, drawW, drawH)
			ctx.draw(false, () => {
				this._timers.push(setTimeout(() => {
					uni.canvasToTempFilePath({
						canvasId: 'cropCanvas',
						x: 0,
						y: 0,
						width: this.canvasSize,
						height: this.canvasSize,
						destWidth: CANVAS_OUTPUT_SIZE,
						destHeight: CANVAS_OUTPUT_SIZE,
						success: (res) => {
							uni.hideLoading()
							this.$emit('confirm', res.tempFilePath)
						},
						fail: () => {
							uni.hideLoading()
							uni.showToast({ title: '裁剪失败，请重试', icon: 'none' })
						}
					}, this)
				}, 300))
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.cropper-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.85);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cropper-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}

.cropper-header {
	margin-bottom: 32rpx;
}

.cropper-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.cropper-preview {
	position: relative;
	overflow: hidden;
	background: #000000;
}

.crop-image {
	position: absolute;
}

/* 裁剪框边框 */
.crop-frame {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border: 2rpx solid rgba(255, 255, 255, 0.6);
	pointer-events: none;
}

.cropper-controls {
	width: 100%;
	padding: 0 48rpx;
	margin-top: 40rpx;
}

.zoom-row {
	display: flex;
	align-items: center;
	margin-bottom: 32rpx;
}

.zoom-label {
	font-size: 28rpx;
	color: #FFFFFF;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.zoom-slider {
	flex: 1;
}

.cropper-buttons {
	display: flex;
	gap: 32rpx;
}

.btn-cancel,
.btn-confirm {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 24rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.btn-cancel {
	background: rgba(255, 255, 255, 0.15);
	color: #FFFFFF;
}

.btn-confirm {
	background: var(--primary);
	color: #FFFFFF;
}

/* 隐藏 canvas，但不能用 display:none */
.crop-canvas {
	position: fixed;
	left: -9999px;
	top: -9999px;
}
</style>
