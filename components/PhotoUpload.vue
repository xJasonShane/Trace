<template>
	<view class="photo-upload">
		<view
			v-for="(photo, index) in photos"
			:key="photo"
			class="photo-slot filled"
			@tap="previewPhoto(index)"
			@longpress="removePhoto(index)"
		>
			<image :src="photo" mode="aspectFill" class="photo-img" lazy-load />
		</view>
		<view
			v-if="photos.length < maxCount"
			class="photo-slot empty"
			@tap="addPhoto"
		>
			<Icon name="plus" :size="44" :color="themeTertiaryColor" :strokeWidth="1.6" />
		</view>
	</view>
</template>

<script>
import Icon from './Icon.vue'
import themeMixin from '@/mixins/theme.js'
import imageUtil from '../utils/image.js'
import permissionUtil from '@/utils/permission.js'

export default {
	name: 'PhotoUpload',
	components: { Icon },
	mixins: [themeMixin],
	props: {
		modelValue: {
			type: Array,
			default: () => []
		},
		maxCount: {
			type: Number,
			default: 9,
			validator: (v) => v > 0
		}
	},
	emits: ['update:modelValue', 'change'],
	computed: {
		photos() {
			return this.modelValue || []
		}
	},
	methods: {
		addPhoto() {
			const remaining = this.maxCount - this.photos.length
			if (remaining <= 0) return
			// 使用 permission util 包装 chooseImage，统一处理权限被拒引导
			permissionUtil.chooseImageWithGuide(
				{ count: remaining, sizeType: ['compressed'], sourceType: ['album', 'camera'] },
				{
					onSuccess: async (res) => {
						try {
							// 并行处理所有图片（压缩+保存）
							const savedPaths = await imageUtil.processTempImages(res.tempFilePaths)
							const updated = [...this.photos, ...savedPaths]
							this.$emit('update:modelValue', updated)
							this.$emit('change', updated)
						} catch (e) {
							console.error('处理图片失败:', e)
							uni.showToast({ title: '处理图片失败', icon: 'none' })
						}
					},
					onFail: (err) => {
						console.warn('选择图片失败:', err)
						// 权限被拒已由 permission util 引导，非权限错误显示通用提示
						if (!permissionUtil.isPermissionDenied(err)) {
							uni.showToast({ title: '选择图片失败', icon: 'none' })
						}
					}
				}
			)
		},
		previewPhoto(index) {
			if (this.photos.length > 0) {
				imageUtil.previewImage(this.photos, index)
			}
		},
		removePhoto(index) {
			uni.showModal({
				title: '删除照片',
				content: '确定要删除这张照片吗？',
				success: (res) => {
					if (res.confirm) {
						const updated = [...this.photos]
						const removed = updated.splice(index, 1)[0]
						if (removed) {
							imageUtil.removeFile(removed)
						}
						this.$emit('update:modelValue', updated)
						this.$emit('change', updated)
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.photo-upload {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
}

.photo-slot {
	aspect-ratio: 1;
	border-radius: 20rpx;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
}

.photo-slot.empty {
	border: 3rpx dashed var(--border-light);
	background: var(--input-bg);
}

.photo-slot.filled {
	border: 1rpx solid var(--border);
}

.photo-img {
	width: 100%;
	height: 100%;
}
</style>
