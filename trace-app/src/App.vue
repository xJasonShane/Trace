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
   ═══════════════════════════════════════════════════════════════ */

/* 白天模式（默认） */
.page {
	--bg: #FAF8F5;
	--fg: #2D2A26;
	--surface: #FFFFFF;
	--surface-alt: #F5F2EE;
	--border: #EDEAE5;
	--border-light: #E0DCD7;
	--primary: #E09080;
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
</style>
