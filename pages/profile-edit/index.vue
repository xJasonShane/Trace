<template>
	<view class="page">
		<!-- 状态栏占位 -->
		<view class="statusbar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-header">
			<view class="back" @tap="onBack">
				<Icon name="back" :size="36" :color="fg" :stroke-width="2" />
			</view>
			<view class="title">编辑资料</view>
			<view class="placeholder-right"></view>
		</view>

		<scroll-view scroll-y class="content">
			<!-- 头像区域 -->
			<view class="edit-avatar-area">
				<view class="edit-avatar" @tap="onAvatarTap">
					<image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
					<Icon v-else name="profile" :size="60" :color="strokeWarm" :stroke-width="1.6" />
					<view class="cam-badge">
						<Icon name="camera" :size="24" :color="white" :stroke-width="2" />
					</view>
				</view>
				<view class="edit-link" @tap="onAvatarTap">更换头像</view>
			</view>

			<!-- 表单 -->
			<view class="edit-form">
				<!-- 昵称 -->
				<view class="form-group">
					<text class="form-label">昵称</text>
					<input
						class="form-input"
						v-model="form.nickname"
						placeholder="请输入昵称"
						placeholder-style="color: #A5A09A;"
						maxlength="20"
					/>
				</view>

				<!-- 个性签名 -->
				<view class="form-group">
					<text class="form-label">个性签名</text>
					<textarea
						class="form-textarea"
						v-model="form.bio"
						placeholder="记录你的心情…"
						placeholder-style="color: #A5A09A;"
						maxlength="50"
						:auto-height="false"
					/>
				</view>

				<!-- 所在城市 -->
				<view class="form-group">
					<text class="form-label">所在城市</text>
					<input
						class="form-input"
						v-model="form.city"
						placeholder="请输入所在城市"
						placeholder-style="color: #A5A09A;"
						maxlength="20"
					/>
				</view>

				<!-- 生日 -->
				<view class="form-group">
					<text class="form-label">生日</text>
					<picker mode="date" :value="form.birthday" :end="today" @change="onBirthdayChange">
						<view class="form-input picker-display">
							<text :class="{ 'picker-placeholder': !form.birthday }">{{ form.birthday || '请选择生日' }}</text>
							<Icon name="arrowRight" :size="32" :color="fgTertiary" :stroke-width="2" />
						</view>
					</picker>
				</view>

				<!-- 保存按钮 -->
				<view
					class="btn-primary"
					hover-class="btn-primary-hover"
					:hover-stay-time="100"
					@tap="onSave"
				>
					保存修改
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import Icon from '@/components/Icon.vue'
import { useProfileStore } from '@/store/profile.js'
import imageUtil from '@/utils/image.js'
import dateUtil from '@/utils/date.js'

export default {
	components: { Icon },
	data() {
		return {
			statusBarHeight: 20,
			form: {
				nickname: '',
				bio: '',
				city: '',
				birthday: '',
				avatar: ''
			},
			saving: false,
			fg: '#2D2A26',
			fgTertiary: '#A5A09A',
			strokeWarm: '#C09080',
			white: '#FFFFFF'
		}
	},
	computed: {
		today() {
			return dateUtil.formatDate(new Date())
		}
	},
	onLoad() {
		const sysInfo = uni.getSystemInfoSync()
		this.statusBarHeight = sysInfo.statusBarHeight || 20

		const profileStore = useProfileStore()
		const p = profileStore.profile || {}
		this.form = {
			nickname: p.nickname || '',
			bio: p.bio || '',
			city: p.city || '',
			birthday: p.birthday || '',
			avatar: p.avatar || ''
		}
	},
	methods: {
		onBack() {
			uni.navigateBack()
		},
		async onAvatarTap() {
			try {
				uni.showLoading({ title: '处理中…' })
				const paths = await imageUtil.pickAndSaveImages(1)
				uni.hideLoading()
				if (paths && paths.length > 0) {
					this.form.avatar = paths[0]
				}
			} catch (e) {
				uni.hideLoading()
				if (e && e.errMsg && e.errMsg.indexOf('cancel') === -1) {
					uni.showToast({ title: '选择头像失败', icon: 'none' })
				}
			}
		},
		onBirthdayChange(e) {
			this.form.birthday = e.detail.value
		},
		onSave() {
			if (this.saving) return
			if (!this.form.nickname.trim()) {
				uni.showToast({ title: '请输入昵称', icon: 'none' })
				return
			}
			this.saving = true
			const profileStore = useProfileStore()
			profileStore.saveProfile({
				nickname: this.form.nickname.trim(),
				bio: this.form.bio.trim(),
				city: this.form.city.trim(),
				birthday: this.form.birthday,
				avatar: this.form.avatar
			})
			uni.showToast({ title: '保存成功', icon: 'success' })
			setTimeout(() => {
				this.saving = false
				uni.navigateBack()
			}, 800)
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: #FAF8F5;
	display: flex;
	flex-direction: column;
}

.statusbar {
	width: 100%;
}

/* 顶部导航栏 */
.nav-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8rpx 32rpx 16rpx;
}

.back {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 20rpx;
	background: rgba(45, 42, 38, 0.07);
}

.title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2D2A26;
	letter-spacing: -0.01em;
}

.placeholder-right {
	width: 64rpx;
	height: 64rpx;
}

.content {
	flex: 1;
}

/* 头像区域 */
.edit-avatar-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 32rpx 32rpx 16rpx;
}

.edit-avatar {
	width: 144rpx;
	height: 144rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #EDCFC6, #D2C5E2);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	margin-bottom: 16rpx;
}

.avatar-img {
	width: 144rpx;
	height: 144rpx;
	border-radius: 50%;
}

.cam-badge {
	position: absolute;
	bottom: -4rpx;
	right: -4rpx;
	width: 48rpx;
	height: 48rpx;
	background: #E09080;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #FAF8F5;
	box-shadow: 0 2rpx 8rpx rgba(224, 144, 128, 0.4);
}

.edit-link {
	font-size: 26rpx;
	color: #E09080;
	font-weight: 500;
	padding: 8rpx 16rpx;
}

/* 表单 */
.edit-form {
	padding: 16rpx 32rpx 48rpx;
}

.form-group {
	margin-bottom: 24rpx;
}

.form-label {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: #6E6A65;
	margin-bottom: 12rpx;
}

.form-input {
	width: 100%;
	padding: 20rpx 24rpx;
	border: 1rpx solid #E0DCD7;
	border-radius: 20rpx;
	font-size: 28rpx;
	font-family: -apple-system, 'PingFang SC', sans-serif;
	background: #FFFFFF;
	color: #2D2A26;
	box-sizing: border-box;
}

.form-textarea {
	width: 100%;
	padding: 20rpx 24rpx;
	border: 1rpx solid #E0DCD7;
	border-radius: 20rpx;
	font-size: 28rpx;
	font-family: -apple-system, 'PingFang SC', sans-serif;
	background: #FFFFFF;
	color: #2D2A26;
	min-height: 120rpx;
	line-height: 1.6;
	box-sizing: border-box;
}

.picker-display {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.picker-placeholder {
	color: #A5A09A;
	font-size: 28rpx;
}

/* 保存按钮 */
.btn-primary {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	min-height: 88rpx;
	background: #E09080;
	color: #FFFFFF;
	border-radius: 24rpx;
	font-size: 30rpx;
	font-weight: 600;
	margin-top: 32rpx;
	box-shadow: 0 4rpx 16rpx rgba(224, 144, 128, 0.3);
	letter-spacing: 0.04em;
}

.btn-primary-hover {
	opacity: 0.85;
	transform: scale(0.99);
}
</style>
