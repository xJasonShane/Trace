import { describe, it, expect } from 'vitest'
import {
	combineDateWithCurrentTime,
	buildJournalData,
	shouldUpdateCoordinates,
	buildLocationUpdatePayload,
	calcLocationPhotoCount
} from './save-helpers.js'

// 构造标准表单对象，复用避免重复
function makeForm(overrides = {}) {
	return {
		title: ' 测试标题 ',
		locationName: ' 测试地点 ',
		locationAddress: '测试地址',
		locationLat: 30.123456,
		locationLng: 120.654321,
		content: ' 测试内容 ',
		photos: ['a.jpg', 'b.jpg'],
		mood: '😊',
		date: '2024-06-15',
		ratings: { scenery: 4, food: 5 },
		tags: ['旅行', '美食'],
		...overrides
	}
}

describe('combineDateWithCurrentTime', () => {
	it('将日期与当前时间组合为 YYYY-MM-DD HH:mm 格式', () => {
		const now = new Date(2024, 5, 15, 9, 30)
		expect(combineDateWithCurrentTime('2024-06-15', now)).toBe('2024-06-15 09:30')
	})

	it('小时和分钟不足两位时补零', () => {
		const now = new Date(2024, 0, 1, 1, 5)
		expect(combineDateWithCurrentTime('2024-01-01', now)).toBe('2024-01-01 01:05')
	})

	it('23:59 边界情况正确处理', () => {
		const now = new Date(2024, 11, 31, 23, 59)
		expect(combineDateWithCurrentTime('2024-12-31', now)).toBe('2024-12-31 23:59')
	})
})

describe('buildJournalData', () => {
	it('构建完整的手账数据对象', () => {
		const form = makeForm()
		const createdAt = '2024-06-15 09:30'
		const data = buildJournalData(form, 'loc-1', createdAt)

		expect(data).toEqual({
			title: '测试标题',
			locationId: 'loc-1',
			locationName: '测试地点',
			content: '测试内容',
			photos: ['a.jpg', 'b.jpg'],
			mood: '😊',
			createdAt: '2024-06-15 09:30',
			ratings: { scenery: 4, food: 5 },
			tags: ['旅行', '美食']
		})
	})

	it('对 title、locationName、content 执行 trim', () => {
		const form = makeForm({
			title: '  带空格的标题  ',
			locationName: '  带空格的地点  ',
			content: '  带空格的内容  '
		})
		const data = buildJournalData(form, '', '')

		expect(data.title).toBe('带空格的标题')
		expect(data.locationName).toBe('带空格的地点')
		expect(data.content).toBe('带空格的内容')
	})

	it('ratings 和 tags 创建浅拷贝，不引用原表单对象', () => {
		const form = makeForm()
		const data = buildJournalData(form, 'loc-1', '2024-06-15 09:30')

		// 修改返回值不应影响原表单
		data.ratings.scenery = 1
		data.tags.push('新标签')

		expect(form.ratings.scenery).toBe(4)
		expect(form.tags).toEqual(['旅行', '美食'])
	})

	it('locationId 为空字符串时正常处理', () => {
		const form = makeForm()
		const data = buildJournalData(form, '', '2024-06-15 09:30')
		expect(data.locationId).toBe('')
	})
})

describe('shouldUpdateCoordinates', () => {
	it('坐标不同时返回 true', () => {
		const loc = { latitude: 30.123456, longitude: 120.654321 }
		const form = makeForm({ locationLat: 31.000000, locationLng: 121.000000 })
		expect(shouldUpdateCoordinates(loc, form)).toBe(true)
	})

	it('坐标完全相同时返回 false', () => {
		const loc = { latitude: 30.123456, longitude: 120.654321 }
		const form = makeForm({ locationLat: 30.123456, locationLng: 120.654321 })
		expect(shouldUpdateCoordinates(loc, form)).toBe(false)
	})

	it('仅纬度不同时返回 true', () => {
		const loc = { latitude: 30.123456, longitude: 120.654321 }
		const form = makeForm({ locationLat: 30.999999, locationLng: 120.654321 })
		expect(shouldUpdateCoordinates(loc, form)).toBe(true)
	})

	it('仅经度不同时返回 true', () => {
		const loc = { latitude: 30.123456, longitude: 120.654321 }
		const form = makeForm({ locationLat: 30.123456, locationLng: 120.999999 })
		expect(shouldUpdateCoordinates(loc, form)).toBe(true)
	})

	it('loc 为 null 时返回 false', () => {
		const form = makeForm()
		expect(shouldUpdateCoordinates(null, form)).toBe(false)
	})

	it('表单坐标为 0 时不更新（原逻辑：0 为 falsy）', () => {
		const loc = { latitude: 30.123456, longitude: 120.654321 }
		const form = makeForm({ locationLat: 0, locationLng: 0 })
		expect(shouldUpdateCoordinates(loc, form)).toBe(false)
	})

	it('表单仅纬度为 0 时不更新', () => {
		const loc = { latitude: 30.123456, longitude: 120.654321 }
		const form = makeForm({ locationLat: 0, locationLng: 120.654321 })
		expect(shouldUpdateCoordinates(loc, form)).toBe(false)
	})
})

describe('buildLocationUpdatePayload', () => {
	it('使用表单坐标和地址构建更新数据', () => {
		const loc = { latitude: 30.0, longitude: 120.0, address: '旧地址' }
		const form = makeForm({ locationLat: 31.0, locationLng: 121.0, locationAddress: '新地址' })

		expect(buildLocationUpdatePayload(form, loc)).toEqual({
			latitude: 31.0,
			longitude: 121.0,
			address: '新地址'
		})
	})

	it('表单地址为空时回退到地点原有地址', () => {
		const loc = { latitude: 30.0, longitude: 120.0, address: '旧地址' }
		const form = makeForm({ locationAddress: '' })

		expect(buildLocationUpdatePayload(form, loc).address).toBe('旧地址')
	})
})

describe('calcLocationPhotoCount', () => {
	it('累加所有手账的照片数量', () => {
		const journals = [
			{ photos: ['a.jpg', 'b.jpg'] },
			{ photos: ['c.jpg'] },
			{ photos: [] }
		]
		expect(calcLocationPhotoCount(journals)).toBe(3)
	})

	it('手账没有 photos 字段时计为 0', () => {
		const journals = [
			{ photos: ['a.jpg'] },
			{},
			{ photos: null }
		]
		expect(calcLocationPhotoCount(journals)).toBe(1)
	})

	it('空数组返回 0', () => {
		expect(calcLocationPhotoCount([])).toBe(0)
	})
})
