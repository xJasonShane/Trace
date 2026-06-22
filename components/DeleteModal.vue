<template>
	<view v-if="visible" class="modal-overlay" @tap="$emit('cancel')">
		<view class="modal-box" @tap.stop>
			<view class="modal-icon">
				<Icon name="trash" :size="44" color="#C8504A" :strokeWidth="2" />
			</view>
			<text class="modal-title">{{ title }}</text>
			<text class="modal-desc">{{ message }}</text>
			<view class="modal-actions">
				<view class="modal-btn modal-btn-cancel" @tap="$emit('cancel')">
					<text class="modal-btn-text">取消</text>
				</view>
				<view class="modal-btn modal-btn-danger" @tap="$emit('confirm')">
					<text class="modal-btn-text-danger">删除</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import Icon from './Icon.vue'

export default {
	name: 'DeleteModal',
	components: { Icon },
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		title: {
			type: String,
			default: '删除手账'
		},
		message: {
			type: String,
			default: '确定要删除吗？删除后无法恢复。'
		}
	},
	emits: ['cancel', 'confirm']
}
</script>

<style lang="scss" scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.modal-box {
	background: var(--surface);
	border-radius: 32rpx;
	padding: 48rpx 40rpx 32rpx;
	width: 520rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.1);
}

.modal-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: #F0D0CC;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 12rpx;
}

.modal-desc {
	font-size: 26rpx;
	color: var(--text-secondary);
	text-align: center;
	line-height: 1.4;
	margin-bottom: 36rpx;
}

.modal-actions {
	display: flex;
	gap: 16rpx;
	width: 100%;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-btn-cancel {
	background: var(--surface);
	border: 1rpx solid var(--border-light);
}

.modal-btn-danger {
	background: #C8504A;
}

.modal-btn-text {
	font-size: 28rpx;
	font-weight: 500;
	color: var(--fg);
}

.modal-btn-text-danger {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
