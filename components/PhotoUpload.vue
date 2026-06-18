<template>
	<view class="photo-upload">
		<view
			v-for="(photo, index) in photos"
			:key="index"
			class="photo-slot filled"
			@tap="previewPhoto(index)"
			@longpress="removePhoto(index)"
		>
			<image :src="photo" mode="aspectFill" class="photo-img" />
		</view>
		<view
			v-if="photos.length < maxCount"
			class="photo-slot empty"
			@tap="addPhoto"
		>
			<Icon name="plus" :size="44" color="#A5A09A" :strokeWidth="1.6" />
		</view>
	</view>
</template>

<script>
import Icon from './Icon.vue'
import imageUtil from '../utils/image.js'

export default {
	name: 'PhotoUpload',
	components: { Icon },
	props: {
		modelValue: {
			type: Array,
			default: () => []
		},
		maxCount: {
			type: Number,
			default: 9
		}
	},
	emits: ['update:modelValue', 'change'],
	computed: {
		photos() {
			return this.modelValue || []
		}
	},
	methods: {
		async addPhoto() {
			try {
				const remaining = this.maxCount - this.photos.length
				if (remaining <= 0) return
				const newPhotos = await imageUtil.pickAndSaveImages(remaining)
				const updated = [...this.photos, ...newPhotos]
				this.$emit('update:modelValue', updated)
				this.$emit('change', updated)
			} catch (e) {
				if (e.errMsg && !e.errMsg.includes('cancel')) {
					uni.showToast({ title: '选择图片失败', icon: 'none' })
				}
			}
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
	border: 3rpx dashed #E0DCD7;
	background: rgba(45, 42, 38, 0.07);
}

.photo-slot.filled {
	border: 1rpx solid #EDEAE5;
}

.photo-img {
	width: 100%;
	height: 100%;
}
</style>
