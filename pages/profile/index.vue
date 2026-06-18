<template>
	<view class="page">
		<!-- 状态栏占位 -->
		<view class="statusbar-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>

		<scroll-view class="content" scroll-y>
			<!-- 顶部头像区 -->
			<view class="profile-top">
				<view class="profile-avatar">
					<image v-if="profile.avatar" :src="profile.avatar" class="avatar-img" mode="aspectFill" />
					<Icon v-else name="profile" :size="56" color="#C09080" :strokeWidth="1.6" />
				</view>
				<text class="profile-name">{{ profile.nickname || '小鹿同学' }}</text>
				<text class="profile-bio">{{ profile.bio || '用脚步丈量世界，用手账记录时光' }}</text>
			</view>

			<!-- 统计数字 -->
			<view class="profile-stats">
				<view class="ps">
					<text class="pv">{{ journalCount }}</text>
					<text class="pl">手账</text>
				</view>
				<view class="ps-divider"></view>
				<view class="ps">
					<text class="pv">{{ locationCount }}</text>
					<text class="pl">地点</text>
				</view>
				<view class="ps-divider"></view>
				<view class="ps">
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
						<Icon name="arrowRight" :size="28" color="#A5A09A" :strokeWidth="2" />
					</view>
				</view>
				<view class="settings-row" @tap="goTheme">
					<view class="settings-icon icon-theme">
						<Icon name="sun" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">主题外观</text>
					<view class="settings-arrow">
						<Icon name="arrowRight" :size="28" color="#A5A09A" :strokeWidth="2" />
					</view>
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
					<text class="settings-meta">{{ settings.backup ? '已开启' : '未开启' }}</text>
					<view class="settings-arrow">
						<Icon name="arrowRight" :size="28" color="#A5A09A" :strokeWidth="2" />
					</view>
				</view>
				<view class="settings-row" @tap="goAbout">
					<view class="settings-icon icon-about">
						<Icon name="info" :size="34" color="#FFFFFF" :strokeWidth="1.8" />
					</view>
					<text class="settings-label">关于拾光</text>
					<text class="settings-meta">v1.0.0</text>
					<view class="settings-arrow">
						<Icon name="arrowRight" :size="28" color="#A5A09A" :strokeWidth="2" />
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
import { useProfileStore } from '@/store/profile.js'
import { useJournalStore } from '@/store/journal.js'
import { useLocationStore } from '@/store/location.js'

export default {
	components: { TabBar, Icon },
	setup() {
		const profileStore = useProfileStore()
		const journalStore = useJournalStore()
		const locationStore = useLocationStore()
		return { profileStore, journalStore, locationStore }
	},
	data() {
		return {
			statusBarHeight: 0
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
			return this.profileStore.photoCount
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
		goEdit() {
			uni.navigateTo({ url: '/pages/profile-edit/index' })
		},
		goTheme() {
			uni.showToast({ title: '主题功能开发中', icon: 'none' })
		},
		goBackup() {
			uni.showToast({ title: '备份功能开发中', icon: 'none' })
		},
		goAbout() {
			uni.showModal({
				title: '关于拾光',
				content: '拾光手账 v1.0.0\n用脚步丈量世界，用手账记录时光',
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
	background: #FAF8F5;
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
	color: #2D2A26;
	margin-bottom: 8rpx;
}

.profile-bio {
	display: block;
	font-size: 26rpx;
	color: #7A756F;
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
}

.ps-divider {
	width: 1rpx;
	height: 60rpx;
	background: #EDEAE5;
}

.pv {
	font-family: ui-monospace, 'SF Mono', monospace;
	font-size: 40rpx;
	font-weight: 700;
	color: #2D2A26;
}

.pl {
	font-size: 22rpx;
	color: #7A756F;
}

.settings-group {
	margin: 0 32rpx 24rpx;
	background: #FFFFFF;
	border: 1rpx solid #EDEAE5;
	border-radius: 28rpx;
	padding: 0 28rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.settings-row {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 26rpx 0;
	border-bottom: 1rpx solid #EDEAE5;
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
	color: #2D2A26;
}

.settings-meta {
	font-size: 26rpx;
	color: #A5A09A;
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
	background: #E0DCD7;
}

.toggle.off::after {
	right: auto;
	left: 4rpx;
}

.bottom-pad {
	height: 140rpx;
}
</style>
