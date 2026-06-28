<template>
	<view class="page" :class="themeClass">
		<!-- 状态栏占位 -->
		<view class="statusbar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>

		<scroll-view class="content" scroll-y>
			<!-- 顶部头像区 -->
			<view class="profile-top">
				<view class="profile-avatar">
					<image v-if="profile.avatar" :src="profile.avatar" class="avatar-img" mode="aspectFill" lazy-load />
					<Icon v-else name="profile" :size="56" color="#C09080" :strokeWidth="1.6" />
				</view>
				<text class="profile-name">{{ profile.nickname || '小鹿同学' }}</text>
				<text class="profile-bio">{{ profile.bio || '用脚步丈量世界，用手账记录时光' }}</text>
			</view>

			<!-- 统计数字 -->
			<view class="profile-stats">
				<view class="ps" hover-class="ps-hover" :hover-stay-time="80" @tap="goJournals">
					<text class="pv">{{ journalCount }}</text>
					<text class="pl">手账</text>
				</view>
				<view class="ps-divider"></view>
				<view class="ps" hover-class="ps-hover" :hover-stay-time="80" @tap="goLocations">
					<text class="pv">{{ locationCount }}</text>
					<text class="pl">地点</text>
				</view>
				<view class="ps-divider"></view>
				<view class="ps" hover-class="ps-hover" :hover-stay-time="80" @tap="goPhotos">
					<text class="pv">{{ photoCount }}</text>
					<text class="pl">照片</text>
				</view>
			</view>

			<!-- 设置组1 -->
			<view class="settings-group">
				<view class="settings-row" @tap="goEdit">
					<view class="settings-icon icon-edit">
						<Icon name="edit" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">编辑资料</text>
					<view class="settings-arrow">
						<Icon name="arrowRight" :size="28" :color="themeTertiaryColor" :strokeWidth="2" />
					</view>
				</view>
				<view class="settings-row">
					<view class="settings-icon icon-theme">
						<Icon name="sun" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">主题外观</text>
					<view
						class="toggle"
						:class="{ off: settings.theme !== 'dark' }"
						@tap="toggleTheme"
					></view>
				</view>
				<view class="settings-row">
					<view class="settings-icon icon-notify">
						<Icon name="bell" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">通知提醒</text>
					<view
						class="toggle"
						:class="{ off: !settings.notifications }"
						@tap="toggleNotify"
					></view>
				</view>
			</view>

			<!-- 设置组2 -->
			<view class="settings-group">
				<view class="settings-row" @tap="goBackup">
					<view class="settings-icon icon-backup">
						<Icon name="upload" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">数据备份</text>
					<text class="settings-meta">{{ backupMeta }}</text>
					<view class="settings-arrow">
						<Icon name="arrowRight" :size="28" :color="themeTertiaryColor" :strokeWidth="2" />
					</view>
				</view>
				<view class="settings-row" @tap="goAbout">
					<view class="settings-icon icon-about">
						<Icon name="info" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">关于拾光</text>
					<text class="settings-meta">v0.0.1</text>
					<view class="settings-arrow">
						<Icon name="arrowRight" :size="28" :color="themeTertiaryColor" :strokeWidth="2" />
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-pad"></view>
		</scroll-view>

		<!-- TabBar -->
		<TabBar :active="3" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import Icon from '@/components/Icon.vue'
import themeMixin from '@/mixins/theme.js'
import { useProfileStore } from '@/store/profile.js'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'
import storage from '@/utils/storage.js'
import dateUtil from '@/utils/date.js'

export default {
	components: { TabBar, Icon },
	mixins: [themeMixin],
	setup() {
		const profileStore = useProfileStore()
		const journalStore = useJournalStore()
		const locationStore = useLocationStore()
		return { profileStore, journalStore, locationStore }
	},
	data() {
		return {
			statusBarHeight: 0,
			backing: false,
			backupTick: 0
		}
	},
	created() {
		// 非响应式定时器引用集合，页面销毁时统一清理
		this._timers = []
	},
	onUnload() {
		if (this._timers) {
			this._timers.forEach(id => clearTimeout(id))
			this._timers = []
		}
	},
	computed: {
		profile() {
			return this.profileStore.profile
		},
		settings() {
			return this.profileStore.settings
		},
		journalCount() {
			return this.journalStore.totalCount
		},
		locationCount() {
			return this.locationStore.totalCount
		},
		photoCount() {
			return this.journalStore.totalPhotos
		},
		backupMeta() {
			// 引用 backupTick 建立响应式依赖，确保备份/恢复后重新计算
			void this.backupTick
			const info = storage.getBackupInfo()
			if (!info.exists) return '未备份'
			return dateUtil.formatDateDot(info.timestamp)
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
	},
	methods: {
		toggleNotify() {
			this.profileStore.saveSettings({ notifications: !this.settings.notifications })
		},
		// 跳转到手账列表页
		goJournals() {
			uni.navigateTo({ url: '/pages/journal/index' })
		},
		// 跳转到搜索页，展示全部地点
		goLocations() {
			uni.navigateTo({ url: '/pages/search/index?filter=location' })
		},
		// 跳转到手账列表页，仅展示有照片的手账
		goPhotos() {
			uni.navigateTo({ url: '/pages/journal/index?filter=photos' })
		},
		goEdit() {
			uni.navigateTo({ url: '/pages/profile-edit/index' })
		},
		toggleTheme() {
			const next = this.settings.theme === 'dark' ? 'light' : 'dark'
			this.profileStore.saveSettings({ theme: next })
		},
		goBackup() {
			if (this.backing) return
			const info = storage.getBackupInfo()
			const actions = ['立即备份']
			if (info.exists) {
				actions.push('恢复备份')
			}
			uni.showActionSheet({
				itemList: actions,
				success: (res) => {
					if (res.tapIndex === 0) {
						this.doBackup()
					} else if (res.tapIndex === 1 && info.exists) {
						this.confirmRestore()
					}
				}
			})
		},
		doBackup() {
			this.backing = true
			uni.showLoading({ title: '备份中…' })
			this._timers.push(setTimeout(() => {
				const result = storage.createBackup()
				uni.hideLoading()
				this.backing = false
				if (result.success) {
					this.profileStore.saveSettings({ backup: true })
					this.backupTick++
					uni.showToast({ title: '备份成功', icon: 'success' })
				} else {
					uni.showToast({ title: result.message, icon: 'none' })
				}
			}, 300))
		},
		confirmRestore() {
			const info = storage.getBackupInfo()
			const dateStr = info.exists ? dateUtil.formatDateDot(info.timestamp) : ''
			uni.showModal({
				title: '恢复备份',
				content: `将从 ${dateStr} 的备份恢复数据，当前数据将被覆盖。确定继续吗？`,
				confirmText: '恢复',
				confirmColor: '#E09080',
				success: (res) => {
					if (res.confirm) {
						this.doRestore()
					}
				}
			})
		},
		doRestore() {
			uni.showLoading({ title: '恢复中…' })
			this._timers.push(setTimeout(() => {
				const result = storage.restoreBackup()
				uni.hideLoading()
				if (result.success) {
					this.backupTick++
					uni.showToast({ title: '恢复成功', icon: 'success' })
					// 刷新页面数据
					this._timers.push(setTimeout(() => {
						uni.reLaunch({ url: '/pages/profile/index' })
					}, 1200))
				} else {
					uni.showToast({ title: result.message, icon: 'none' })
				}
			}, 300))
		},
		goAbout() {
			uni.showModal({
				title: '关于拾光',
				content: '拾光手账 v0.0.1\n用脚步丈量世界，用手账记录时光',
				showCancel: false
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: var(--bg);
}

.statusbar-placeholder {
	width: 100%;
	flex-shrink: 0;
}

.content {
	flex: 1;
	overflow: auto;
}

.profile-top {
	text-align: center;
	padding: 32rpx 32rpx 40rpx;
}

.profile-avatar {
	width: 128rpx;
	height: 128rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #EDCFC6, #D2C5E2);
	margin: 0 auto 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.profile-name {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 8rpx;
}

.profile-bio {
	display: block;
	font-size: 26rpx;
	color: var(--text-secondary);
}

.profile-stats {
	display: flex;
	align-items: center;
	padding: 0 32rpx;
	margin-bottom: 32rpx;
}

.ps {
	flex: 1;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	border-radius: 16rpx;
}

.ps-hover {
	opacity: 0.6;
}

.ps-divider {
	width: 1rpx;
	height: 60rpx;
	background: var(--border);
}

.pv {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 40rpx;
	font-weight: 700;
	color: var(--fg);
}

.pl {
	font-size: 22rpx;
	color: var(--text-secondary);
}

.settings-group {
	margin: 0 32rpx 24rpx;
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 28rpx;
	padding: 0 28rpx;
	box-shadow: 0 2rpx 16rpx var(--shadow);
}

.settings-row {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 26rpx 0;
	border-bottom: 1rpx solid var(--border);
}

.settings-row:last-child {
	border-bottom: 0;
}

.settings-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.icon-edit { background: #E09080; }
.icon-theme { background: #7FA3C8; }
.icon-notify { background: #B8A0D0; }
.icon-backup { background: #8FB888; }
.icon-about { background: #DDB86A; }

.settings-label {
	flex: 1;
	font-size: 30rpx;
	font-weight: 500;
	color: var(--fg);
}

.settings-meta {
	font-size: 26rpx;
	color: var(--text-tertiary);
	margin-right: 8rpx;
}

.settings-arrow {
	display: flex;
	align-items: center;
}

.toggle {
	width: 88rpx;
	height: 52rpx;
	background: #E09080;
	border-radius: 26rpx;
	position: relative;
	transition: background 0.2s;
	flex-shrink: 0;
}

.toggle::after {
	content: '';
	position: absolute;
	top: 4rpx;
	right: 4rpx;
	width: 44rpx;
	height: 44rpx;
	background: #FFFFFF;
	border-radius: 50%;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
	transition: all 0.2s;
}

.toggle.off {
	background: var(--border-light);
}

.toggle.off::after {
	right: auto;
	left: 4rpx;
}

.bottom-pad {
	height: 140rpx;
}
</style>
