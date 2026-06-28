<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		onError: function(err) {
			console.error('全局错误:', err)
		}
	}
</script>

<style lang="scss">
/* ═══════════════════════════════════════════════════════════════
   全局样式 — 拾光手账
   ═══════════════════════════════════════════════════════════════ */

/* 设计令牌 */
$seed-bg: #FAF8F5;
$seed-fg: #2D2A26;
$seed-primary: #E09080;
$seed-accent: #7FA3C8;
$seed-surface: #FFFFFF;

/* 页面基础 */
page {
	background-color: #FAF8F5;
	color: #2D2A26;
	font-family: -apple-system, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', sans-serif;
	font-size: 28rpx;
	line-height: 1.5;
}

/* 全局盒模型：border-box 防止 padding 导致宽度溢出 */
view, text, image, scroll-view, input, textarea, button {
	box-sizing: border-box;
}

/* ═══════════════════════════════════════════════════════════════
   主题 CSS 变量
   在各页面根 view (.page) 上绑定 :class="themeClass" 切换

   命名说明：
   - --primary  主色（橙红 #E09080），对应 uni.scss 的 $accent
   - --accent   辅色（蓝 #7FA3C8），对应 uni.scss 的 $accent-secondary
   注意：scss 的 $accent 与 CSS 的 --accent 含义不同（一个是主色、一个是辅色），
   这是历史命名遗留，使用时请以颜色值为准。
   ═══════════════════════════════════════════════════════════════ */

/* 白天模式（默认） */
.page {
	--bg: #FAF8F5;
	--fg: #2D2A26;
	--surface: #FFFFFF;
	--surface-alt: #F5F2EE;
	--border: #E0DCD7;
	--border-light: #EDEAE5;
	--primary: #E09080;
	--accent: #7FA3C8;
	--star-active: #D9A54A;
	--danger: #C8504A;
	--primary-soft: rgba(224, 144, 128, 0.15);
	--accent-soft: rgba(127, 163, 200, 0.15);
	--on-primary: #FFFFFF;
	--text-secondary: #7A756F;
	--text-tertiary: #A5A09A;
	--shadow: rgba(0, 0, 0, 0.06);
	--shadow-strong: rgba(0, 0, 0, 0.10);
	--overlay: rgba(250, 248, 245, 0.96);
	--input-bg: rgba(45, 42, 38, 0.07);
}

/* 黑夜模式 */
.page.theme-dark {
	--bg: #1A1816;
	--fg: #E8E4E0;
	--surface: #2A2724;
	--surface-alt: #322E2B;
	--border: #3A3734;
	--border-light: #44403C;
	--primary: #E09080;
	--accent: #8FB3D8;
	--star-active: #E4B85A;
	--danger: #D86A64;
	--primary-soft: rgba(224, 144, 128, 0.18);
	--accent-soft: rgba(127, 163, 200, 0.18);
	--on-primary: #FFFFFF;
	--text-secondary: #A5A09A;
	--text-tertiary: #6E6A65;
	--shadow: rgba(0, 0, 0, 0.3);
	--shadow-strong: rgba(0, 0, 0, 0.4);
	--overlay: rgba(26, 24, 22, 0.96);
	--input-bg: rgba(255, 255, 255, 0.08);
}

/* 通用工具类 */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-1 { flex: 1; }

/* 文字省略 */
.text-ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.text-ellipsis-2 {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

/* 安全区域 */
.safe-bottom {
	padding-bottom: env(safe-area-inset-bottom);
}

/* ═══════════════════════════════════════════════════════════════
   共享组件样式（跨页面复用，避免重复定义）
   ═══════════════════════════════════════════════════════════════ */

/* 照片占位渐变（journal / search / location-detail 共用） */
.ph-warm { background: linear-gradient(135deg, #EDCFC6, #D9AFA2); }
.ph-blue { background: linear-gradient(135deg, #BDD3E8, #9DBBD8); }
.ph-lavender { background: linear-gradient(135deg, #D2C5E2, #B5A8CE); }
.ph-green { background: linear-gradient(135deg, #C0D9B8, #9EC594); }
.ph-gold { background: linear-gradient(135deg, #E2D4B8, #CEBC98); }

/* 浮动按钮 FAB（journal / location-detail 共用，bottom/z-index 由页面覆盖） */
.fab {
	position: fixed;
	right: 40rpx;
	bottom: 160rpx;
	width: 104rpx;
	height: 104rpx;
	background: var(--primary);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 28rpx rgba(224, 144, 128, 0.4);
	z-index: 50;
}

/* 筛选标签栏（journal / search 共用） */
.filter-bar {
	white-space: nowrap;
	padding: 8rpx 32rpx 16rpx;
}

.filter-item {
	display: inline-flex;
	align-items: center;
	padding: 8rpx 24rpx;
	margin-right: 12rpx;
	border-radius: 999rpx;
	border: 1rpx solid var(--border-light);
	background: transparent;
	font-size: 24rpx;
	color: var(--text-secondary);
}

.filter-item.active {
	background: var(--primary-soft);
	border-color: transparent;
	color: var(--primary);
	font-weight: 500;
}

/* 表单元素（journal-edit / profile-edit 共用） */
.form-group {
	margin-bottom: 32rpx;
}

.form-label {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-secondary);
	margin-bottom: 16rpx;
}

.form-input {
	width: 100%;
	padding: 24rpx 28rpx;
	min-height: 88rpx;
	line-height: 1.5;
	border: 1rpx solid var(--border-light);
	border-radius: 20rpx;
	font-size: 28rpx;
	font-family: -apple-system, 'PingFang SC', sans-serif;
	background: var(--surface);
	color: var(--fg);
	box-sizing: border-box;
}

.form-textarea {
	width: 100%;
	padding: 24rpx 28rpx;
	border: 1rpx solid var(--border-light);
	border-radius: 20rpx;
	font-size: 28rpx;
	font-family: -apple-system, 'PingFang SC', sans-serif;
	background: var(--surface);
	color: var(--fg);
	min-height: 120rpx;
	line-height: 1.6;
	box-sizing: border-box;
}

/* 评分维度（journal-detail / journal-edit 共用） */
.dim-ratings {
	background: var(--surface);
	border: 1rpx solid var(--border);
	border-radius: 28rpx;
	padding: 20rpx 32rpx;
	box-shadow: 0 2rpx 16rpx var(--shadow);
}

.dim-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid var(--border);
}

.dim-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid var(--border);
}

.dim-row:last-child {
	border-bottom: none;
	padding-bottom: 0;
}

.dim-label {
	font-size: 28rpx;
	color: var(--fg);
	font-weight: 500;
}

/* 错误状态（journal-detail / location-detail 共用） */
.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 140rpx 24rpx;
	text-align: center;
}

.error-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--fg);
	margin-bottom: 8rpx;
}

.error-hint {
	font-size: 26rpx;
	color: var(--text-secondary);
	margin-bottom: 32rpx;
}

.error-btn {
	padding: 16rpx 48rpx;
	background: var(--primary);
	color: var(--on-primary);
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
