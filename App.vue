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
