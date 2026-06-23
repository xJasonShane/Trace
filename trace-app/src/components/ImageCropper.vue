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
						:min="100"
						:max="300"
						:value="scalePercent"
						@change="onScaleChange"
						block-size="20"
						activeColor="#E09080"
						backgroundColor="#E0DCD7"
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
 */
export default {
	name: 'ImageCropper',
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
			canvasSize: 300,
			imgW: 0,
			imgH: 0,
			offsetX: 0,
			offsetY: 0,
			scale: 1,
			scalePercent: 100,
			// 触摸状态
			isDragging: false,
			isScaling: false,
			touchStartX: 0,
			touchStartY: 0,
			startOffsetX: 0,
			startOffsetY: 0,
			pinchStartDist: 0,
			scaleStart: 1
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
			}
		}
	},
	mounted() {
		const sys = uni.getSystemInfoSync()
		this.previewSize = Math.min(Math.floor(sys.windowWidth * 0.7), 300)
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
					this.scalePercent = 100
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
			if (this.isScaling && e.touches.length === 2) {
				const dist = this.getDistance(e.touches[0], e.touches[1])
				let s = this.scaleStart * (dist / this.pinchStartDist)
				s = Math.max(1, Math.min(3, s))
				this.scale = s
				this.scalePercent = Math.round(s * 100)
			} else if (this.isDragging && e.touches.length === 1) {
				const dx = e.touches[0].clientX - this.touchStartX
				const dy = e.touches[0].clientY - this.touchStartY
				this.offsetX = this.startOffsetX + dx
				this.offsetY = this.startOffsetY + dy
			}
		},
		onTouchEnd() {
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
				setTimeout(() => {
					uni.canvasToTempFilePath({
						canvasId: 'cropCanvas',
						x: 0,
						y: 0,
						width: this.canvasSize,
						height: this.canvasSize,
						destWidth: 300,
						destHeight: 300,
						success: (res) => {
							uni.hideLoading()
							this.$emit('confirm', res.tempFilePath)
						},
						fail: () => {
							uni.hideLoading()
							uni.showToast({ title: '裁剪失败，请重试', icon: 'none' })
						}
					}, this)
				}, 300)
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
	box-shadow: 0 0 0 9999rpx rgba(0, 0, 0, 0);
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
	background: #E09080;
	color: #FFFFFF;
}

/* 隐藏 canvas，但不能用 display:none */
.crop-canvas {
	position: fixed;
	left: -9999px;
	top: -9999px;
}
</style>
