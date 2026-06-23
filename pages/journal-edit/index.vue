<template>
	<view class="page" :class="themeClass">
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-content">
				<view class="nav-back" @tap="goBack">
					<Icon name="back" :size="36" :color="themeFgColor" :strokeWidth="2" />
				</view>
				<text class="nav-title">{{ isEdit ? '编辑手账' : '新建手账' }}</text>
				<view class="nav-placeholder"></view>
			</view>
		</view>
		<view class="nav-spacer" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<!-- 表单内容 -->
		<view class="form-content">
			<!-- 标题 -->
			<view class="form-group">
				<text class="form-label">标题</text>
				<input
					class="form-input"
					v-model="form.title"
					placeholder="给这篇手账起个名字…"
					placeholder-class="input-placeholder"
					maxlength="50"
				/>
			</view>

			<!-- 地点 -->
			<view class="form-group">
				<text class="form-label">地点</text>
				<input
					class="form-input"
					v-model="form.locationName"
					placeholder="选择或搜索地点…"
					placeholder-class="input-placeholder"
					maxlength="30"
				/>
			</view>

			<!-- 内容 -->
			<view class="form-group">
				<text class="form-label">内容</text>
				<textarea
					class="form-textarea"
					v-model="form.content"
					placeholder="记录此刻的感受…"
					placeholder-class="input-placeholder"
					maxlength="2000"
					:auto-height="false"
				/>
			</view>

			<!-- 照片 -->
			<view class="form-group">
				<text class="form-label">照片</text>
				<PhotoUpload v-model="form.photos" :maxCount="9" />
			</view>

			<!-- 心情 -->
			<view class="form-group">
				<text class="form-label">心情</text>
				<MoodSelect v-model="form.mood" />
			</view>

			<!-- 评分维度 -->
			<view class="form-group">
				<text class="form-label">评分</text>
				<view class="dim-ratings">
					<view
						v-for="dim in ratingDimensions"
						:key="dim.key"
						class="dim-row"
					>
						<text class="dim-label">{{ dim.label }}</text>
						<StarRating
							:modelValue="form.ratings[dim.key]"
							@update:modelValue="val => updateRating(dim.key, val)"
							size="md"
						/>
					</view>
				</view>
			</view>

			<!-- 标签 -->
			<view class="form-group">
				<text class="form-label">标签</text>
				<view class="tags-row">
					<view
						v-for="(tag, index) in form.tags"
						:key="index"
						class="tag-pill"
						@tap="removeTag(index)"
					>
						<text class="tag-text">{{ tag }}</text>
						<text class="tag-close">×</text>
					</view>
					<view class="tag-add" @tap="addTag">
						<text>+ 添加</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 保存按钮 -->
		<view class="save-section">
			<view class="save-btn" @tap="save">
				<text class="save-text">保存手账</text>
			</view>
		</view>
	</view>
</template>

<script>
import Icon from '@/components/Icon.vue'
import StarRating from '@/components/StarRating.vue'
import MoodSelect from '@/components/MoodSelect.vue'
import PhotoUpload from '@/components/PhotoUpload.vue'
import themeMixin from '@/mixins/theme.js'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'

export default {
	components: { Icon, StarRating, MoodSelect, PhotoUpload },
	mixins: [themeMixin],
	data() {
		return {
			journalStore: useJournalStore(),
			locationStore: useLocationStore(),
			isEdit: false,
			journalId: '',
			locationId: '',
			statusBarHeight: 0,
			form: {
				title: '',
				locationName: '',
				content: '',
				photos: [],
				mood: '😊',
				ratings: {
					environment: 5,
					scenery: 5,
					transport: 5,
					experience: 5
				},
				tags: []
			},
			ratingDimensions: [
				{ key: 'environment', label: '环境' },
				{ key: 'scenery', label: '风景' },
				{ key: 'transport', label: '交通' },
				{ key: 'experience', label: '体验' }
			]
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20

		if (options && options.id) {
			// 编辑模式
			this.isEdit = true
			this.journalId = options.id
			this.loadJournal()
		} else if (options && options.locationId) {
			// 从地点详情跳转来，预填地点
			this.locationId = options.locationId
			this.loadLocation()
		}
	},
	methods: {
		loadJournal() {
			const journal = this.journalStore.getJournal(this.journalId)
			if (journal) {
				this.form.title = journal.title || ''
				this.form.locationName = journal.locationName || ''
				this.form.content = journal.content || ''
				this.form.photos = journal.photos ? [...journal.photos] : []
				this.form.mood = journal.mood || '😊'
				this.form.ratings = {
					environment: 5,
					scenery: 5,
					transport: 5,
					experience: 5,
					...(journal.ratings || {})
				}
				this.form.tags = journal.tags ? [...journal.tags] : []
				this.locationId = journal.locationId || ''
			} else {
				uni.showToast({ title: '手账不存在', icon: 'none' })
				setTimeout(() => this.goBack(), 1500)
			}
		},
		loadLocation() {
			const loc = this.locationStore.getLocation(this.locationId)
			if (loc) {
				this.form.locationName = loc.name
			}
		},
		updateRating(key, value) {
			this.form.ratings[key] = value
		},
		addTag() {
			uni.showModal({
				title: '添加标签',
				editable: true,
				placeholderText: '输入标签名',
				success: (res) => {
					if (res.confirm && res.content) {
						const tag = res.content.trim()
						if (tag && !this.form.tags.includes(tag)) {
							if (this.form.tags.length >= 10) {
								uni.showToast({ title: '最多添加10个标签', icon: 'none' })
								return
							}
							this.form.tags.push(tag)
						}
					}
				}
			})
		},
		removeTag(index) {
			this.form.tags.splice(index, 1)
		},
		validate() {
			if (!this.form.title.trim()) {
				uni.showToast({ title: '请输入标题', icon: 'none' })
				return false
			}
			if (!this.form.content.trim()) {
				uni.showToast({ title: '请输入内容', icon: 'none' })
				return false
			}
			return true
		},
		save() {
			if (!this.validate()) return

			// 确定关联地点：优先使用已传入的 locationId，否则按名称查找或创建
			let locationId = this.locationId
			if (!locationId && this.form.locationName.trim()) {
				const loc = this.locationStore.findOrCreate({
					name: this.form.locationName.trim()
				})
				locationId = loc.id
			}

			const data = {
				title: this.form.title.trim(),
				locationId,
				locationName: this.form.locationName.trim(),
				content: this.form.content.trim(),
				photos: this.form.photos,
				mood: this.form.mood,
				ratings: { ...this.form.ratings },
				tags: [...this.form.tags]
			}

			let saved
			if (this.isEdit) {
				saved = this.journalStore.updateJournal(this.journalId, data)
			} else {
				saved = this.journalStore.addJournal(data)
			}

			if (saved) {
				// 更新地点统计（手账数、照片数、最近到访日期）
				if (locationId) {
					const journals = this.journalStore.getJournalsByLocation(locationId)
					const photoCount = journals.reduce(
						(sum, j) => sum + (j.photos ? j.photos.length : 0),
						0
					)
					this.locationStore.updateStats(locationId, journals.length, photoCount)
				}

				uni.showToast({ title: '保存成功', icon: 'success' })
				setTimeout(() => {
					uni.navigateBack()
				}, 1200)
			} else {
				uni.showToast({ title: '保存失败', icon: 'none' })
			}
		},
		goBack() {
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack()
			} else {
				uni.reLaunch({ url: '/pages/index/index' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: var(--bg);
}

/* 导航栏 */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: var(--bg);
	border-bottom: 1rpx solid var(--border);
}

.nav-content {
	height: 88rpx;
	display: flex;
	align-items: center;
	padding: 0 24rpx;
}

.nav-back {
	width: 64rpx;
	height: 64rpx;
	border-radius: 16rpx;
	background: rgba(45, 42, 38, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: var(--fg);
	letter-spacing: -0.01em;
}

.nav-placeholder {
	width: 64rpx;
}

/* 表单内容 */
.form-content {
	padding: 24rpx 32rpx;
	padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.form-group {
	margin-bottom: 32rpx;
}

.form-label {
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-secondary);
	margin-bottom: 16rpx;
	display: block;
}

.form-input {
	width: 100%;
	padding: 24rpx 28rpx;
	min-height: 88rpx;
	line-height: 1.5;
	border: 1rpx solid var(--border-light);
	border-radius: 20rpx;
	font-size: 28rpx;
	background: var(--surface);
	color: var(--fg);
	box-sizing: border-box;
}

.input-placeholder {
	color: var(--text-tertiary);
	font-size: 28rpx;
}

.form-textarea {
	width: 100%;
	padding: 24rpx 28rpx;
	border: 1rpx solid var(--border-light);
	border-radius: 20rpx;
	font-size: 28rpx;
	background: var(--surface);
	color: var(--fg);
	min-height: 240rpx;
	line-height: 1.6;
	box-sizing: border-box;
}

/* 评分维度 */
.dim-ratings {
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 24rpx;
	padding: 16rpx 28rpx;
	box-shadow: 0 2rpx 16rpx var(--shadow);
}

.dim-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
	border-bottom: 1rpx solid var(--border);
}

.dim-row:last-child {
	border-bottom: none;
	padding-bottom: 8rpx;
}

.dim-label {
	font-size: 28rpx;
	color: var(--fg);
	font-weight: 500;
}

/* 标签 */
.tags-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.tag-pill {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 20rpx;
	background: rgba(224, 144, 128, 0.15);
	color: #E09080;
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 500;
}

.tag-text {
	font-size: 24rpx;
}

.tag-close {
	font-size: 28rpx;
	line-height: 1;
	opacity: 0.7;
}

.tag-add {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 20rpx;
	background: transparent;
	color: var(--text-secondary);
	border: 1rpx solid var(--border-light);
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 500;
}

/* 保存按钮 */
.save-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 24rpx 32rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	background: rgba(250, 248, 245, 0.96);
	box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.save-btn {
	width: 100%;
	height: 96rpx;
	background: #E09080;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(224, 144, 128, 0.3);
}

.save-text {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
	letter-spacing: 0.02em;
}
</style>
