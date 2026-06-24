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
					placeholder="输入地点名、地图选点或定位…"
					placeholder-class="input-placeholder"
					maxlength="30"
					@input="onLocationInput"
					@focus="onLocationFocus"
					@blur="onLocationBlur"
				/>
				<!-- 地点操作按钮 -->
				<view class="loc-actions">
					<view class="loc-action-btn" @tap="chooseMapLocation">
						<Icon name="map" :size="30" color="#7FA3C8" :strokeWidth="1.8" />
						<text>地图选点</text>
					</view>
					<view class="loc-action-btn" @tap="getCurrentLocation">
						<Icon name="locate" :size="30" color="#7FA3C8" :strokeWidth="1.8" />
						<text>当前位置</text>
					</view>
				</view>
				<!-- 地点搜索建议下拉 -->
				<view v-if="showSuggestions && locationSuggestions.length > 0" class="loc-suggestions">
					<view
						v-for="loc in locationSuggestions"
						:key="loc.id"
						class="loc-suggestion-item"
						@tap="selectLocation(loc)"
					>
						<text class="loc-sug-name">{{ loc.name }}</text>
						<text v-if="loc.address" class="loc-sug-addr">{{ loc.address }}</text>
					</view>
				</view>
				<!-- 新地点提示 -->
				<view v-if="locationWarning" class="loc-warning">
					<text>{{ locationWarning }}</text>
				</view>
				<!-- 位置信息标签 -->
				<view v-if="form.locationLat && form.locationLng" class="loc-info-tag">
					<Icon name="locate" :size="26" color="#7FA3C8" :strokeWidth="1.8" />
					<text>{{ form.locationLat.toFixed(6) }}, {{ form.locationLng.toFixed(6) }}</text>
				</view>
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

			<!-- 日期 -->
			<view class="form-group">
				<text class="form-label">日期</text>
				<picker mode="date" :value="form.date" @change="onDateChange">
					<view class="date-picker">
						<text class="date-text">{{ form.date || '选择日期' }}</text>
						<Icon name="arrowRight" :size="28" :color="themeTertiaryColor" :strokeWidth="2" />
					</view>
				</picker>
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
import dateUtil from '@/utils/date.js'

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
			showSuggestions: false,
			locationWarning: '',
			validatedLocationId: '',
			form: {
				title: '',
				locationName: '',
				locationLat: 0,
				locationLng: 0,
				locationAddress: '',
				content: '',
				photos: [],
				mood: '😊',
				date: '',
				ratings: {
					environment: 5,
					scenery: 5,
					transport: 5,
					experience: 5
				},
				tags: []
			},
			locating: false,
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
		// 默认日期为当天
		this.form.date = dateUtil.formatDate(new Date())

		// 从地图点选/长按跳转来，携带坐标
		if (options && options.lat && options.lng) {
			this.form.locationLat = parseFloat(options.lat)
			this.form.locationLng = parseFloat(options.lng)
			this.form.locationName = options.name || ''
			this.form.locationAddress = options.address || ''
			if (options.name) {
				this.validatedLocationId = options.locationId || ''
			}
		}

		if (options && options.id) {
			// 编辑模式
			this.isEdit = true
			this.journalId = options.id
			this.loadJournal()
		} else if (options && options.locationId && !options.lat) {
			// 从地点详情跳转来，预填地点（排除带坐标的情况）
			this.locationId = options.locationId
			this.validatedLocationId = options.locationId
			this.loadLocation()
		}
	},
	computed: {
		locationSuggestions() {
			const kw = this.form.locationName.trim().toLowerCase()
			if (!kw) return []
			return this.locationStore.locations
				.filter(l => l.name.toLowerCase().includes(kw))
				.slice(0, 5)
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
				// 从已有 createdAt 中提取日期部分（YYYY-MM-DD）
				if (journal.createdAt) {
					this.form.date = journal.createdAt.substring(0, 10)
				}
				this.form.ratings = {
					environment: 5,
					scenery: 5,
					transport: 5,
					experience: 5,
					...(journal.ratings || {})
				}
				this.form.tags = journal.tags ? [...journal.tags] : []
				this.locationId = journal.locationId || ''
				this.validatedLocationId = journal.locationId || ''
				// 加载关联地点的坐标信息
				const loc = this.locationStore.getLocation(journal.locationId)
				if (loc) {
					this.form.locationLat = loc.latitude || 0
					this.form.locationLng = loc.longitude || 0
					this.form.locationAddress = loc.address || ''
				}
			} else {
				uni.showToast({ title: '手账不存在', icon: 'none' })
				setTimeout(() => this.goBack(), 1500)
			}
		},
		loadLocation() {
			const loc = this.locationStore.getLocation(this.locationId)
			if (loc) {
				this.form.locationName = loc.name
				this.form.locationLat = loc.latitude || 0
				this.form.locationLng = loc.longitude || 0
				this.form.locationAddress = loc.address || ''
				this.validatedLocationId = loc.id
			}
		},
		onLocationInput() {
			this.showSuggestions = true
			this.validatedLocationId = ''
			this.locationWarning = ''
		},
		onLocationFocus() {
			this.showSuggestions = true
		},
		onLocationBlur() {
			// 延迟关闭建议，确保 tap 事件先触发
			setTimeout(() => {
				this.showSuggestions = false
				this.validateLocationField()
			}, 200)
		},
		selectLocation(loc) {
			this.form.locationName = loc.name
			this.form.locationLat = loc.latitude || 0
			this.form.locationLng = loc.longitude || 0
			this.form.locationAddress = loc.address || ''
			this.locationId = loc.id
			this.validatedLocationId = loc.id
			this.showSuggestions = false
			this.locationWarning = ''
		},
		// 打开地图选点
		chooseMapLocation() {
			uni.chooseLocation({
				success: (res) => {
					if (res.name) {
						this.form.locationName = res.name
						this.form.locationAddress = res.address || ''
						this.form.locationLat = res.latitude || 0
						this.form.locationLng = res.longitude || 0
						// 查找或创建地点
						const loc = this.locationStore.findOrCreate({
							name: res.name,
							address: res.address || '',
							latitude: res.latitude,
							longitude: res.longitude
						})
						this.locationId = loc.id
						this.validatedLocationId = loc.id
						this.locationWarning = ''
						this.showSuggestions = false
					}
				},
				fail: (err) => {
					if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						uni.showToast({ title: '地图选点失败，请确认已配置地图Key', icon: 'none' })
					}
				}
			})
		},
		// 获取当前位置
		getCurrentLocation() {
			if (this.locating) return
			this.locating = true
			uni.showLoading({ title: '定位中…' })
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					uni.hideLoading()
					this.locating = false
					this.form.locationLat = res.latitude || 0
					this.form.locationLng = res.longitude || 0
					this.form.locationAddress = ''
					this.form.locationName = this.form.locationName || '我的位置'
					// 尝试查找已有地点
					const nearLoc = this.locationStore.locations.find(l =>
						Math.abs(l.latitude - res.latitude) < 0.001 &&
						Math.abs(l.longitude - res.longitude) < 0.001
					)
					if (nearLoc) {
						this.form.locationName = nearLoc.name
						this.form.locationAddress = nearLoc.address || ''
						this.locationId = nearLoc.id
						this.validatedLocationId = nearLoc.id
					} else {
						this.validatedLocationId = ''
						this.locationWarning = '已定位到当前位置，请输入地点名称'
					}
					this.showSuggestions = false
				},
				fail: (err) => {
					uni.hideLoading()
					this.locating = false
					if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						uni.showToast({ title: '定位失败，请检查定位权限', icon: 'none' })
					}
				}
			})
		},
		validateLocationField() {
			const name = this.form.locationName.trim()
			if (!name) {
				this.locationWarning = ''
				return true
			}
			// 已选中有效地点
			if (this.validatedLocationId) {
				this.locationWarning = ''
				return true
			}
			// 检查是否精确匹配已有地点
			const exactMatch = this.locationStore.locations.find(
				l => l.name === name
			)
			if (exactMatch) {
				this.validatedLocationId = exactMatch.id
				this.locationId = exactMatch.id
				this.locationWarning = ''
				return true
			}
			// 新地点 — 允许创建，给出确认提示
			this.locationWarning = '将创建新地点「' + name + '」'
			return true
		},
		updateRating(key, value) {
			this.form.ratings[key] = value
		},
		onDateChange(e) {
			this.form.date = e.detail.value
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
			// 地点验证：如果填了地点但未通过验证，阻止提交
			if (this.form.locationName.trim() && !this.validateLocationField()) {
				uni.showToast({ title: '请选择有效的地点', icon: 'none' })
				return false
			}
			return true
		},
		save() {
			if (!this.validate()) return

			// 确定关联地点：使用 findOrCreate 自动创建新地点
			let locationId = this.validatedLocationId || this.locationId
			const locName = this.form.locationName.trim()

			if (locName && !locationId) {
				// 新地点 — 自动创建
				const loc = this.locationStore.findOrCreate({
					name: locName,
					address: this.form.locationAddress || '',
					latitude: this.form.locationLat || 0,
					longitude: this.form.locationLng || 0
				})
				locationId = loc.id
			} else if (locName && locationId) {
				// 已有地点 — 如果坐标有变化，更新坐标
				const loc = this.locationStore.getLocation(locationId)
				if (loc && this.form.locationLat && this.form.locationLng) {
					if (loc.latitude !== this.form.locationLat || loc.longitude !== this.form.locationLng) {
						this.locationStore.updateLocation(locationId, {
							latitude: this.form.locationLat,
							longitude: this.form.locationLng,
							address: this.form.locationAddress || loc.address
						})
					}
				}
			}

			// 将用户选择的日期与当前时间组合为完整时间戳
			const now = new Date()
			const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
			const createdAt = this.form.date + ' ' + timeStr

			const data = {
				title: this.form.title.trim(),
				locationId,
				locationName: this.form.locationName.trim(),
				content: this.form.content.trim(),
				photos: this.form.photos,
				mood: this.form.mood,
				createdAt,
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

/* 地点操作按钮 */
.loc-actions {
	display: flex;
	gap: 20rpx;
	margin-top: 16rpx;
}

.loc-action-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	padding: 18rpx 0;
	background: var(--surface);
	border: 1rpx solid var(--border-light);
	border-radius: 20rpx;
	font-size: 26rpx;
	color: var(--text-secondary);
}

.loc-action-btn:active {
	background: rgba(127, 163, 200, 0.08);
}

/* 位置坐标标签 */
.loc-info-tag {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-top: 12rpx;
	padding: 12rpx 20rpx;
	background: rgba(127, 163, 200, 0.08);
	border-radius: 12rpx;
	font-size: 22rpx;
	color: #7FA3C8;
	font-family: ui-monospace, 'SF Mono', monospace;
}

/* 地点搜索建议 */
.loc-suggestions {
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx var(--shadow);
	overflow: hidden;
	margin-top: 12rpx;
}

.loc-suggestion-item {
	padding: 20rpx 28rpx;
	border-bottom: 1rpx solid var(--border);
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.loc-suggestion-item:last-child {
	border-bottom: none;
}

.loc-suggestion-item:active {
	background: var(--input-bg);
}

.loc-sug-name {
	font-size: 28rpx;
	color: var(--fg);
	font-weight: 500;
}

.loc-sug-addr {
	font-size: 24rpx;
	color: var(--text-secondary);
}

/* 地点验证警告 */
.loc-warning {
	margin-top: 12rpx;
	padding: 16rpx 24rpx;
	background: rgba(221, 184, 106, 0.12);
	border: 1rpx solid rgba(221, 184, 106, 0.3);
	border-radius: 16rpx;
	font-size: 24rpx;
	color: #B89048;
	line-height: 1.5;
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

/* 日期选择器 */
.date-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 28rpx;
	min-height: 88rpx;
	border: 1rpx solid var(--border-light);
	border-radius: 20rpx;
	background: var(--surface);
	box-sizing: border-box;
}

.date-text {
	font-size: 28rpx;
	color: var(--fg);
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
