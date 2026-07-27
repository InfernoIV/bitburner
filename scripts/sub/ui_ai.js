// Displays multiple component status blocks as separate menus on the UI page.
// components: Array of { id, title, status | getStatus }
// - status: a string, array, or object to display
// - getStatus: async function(ns) returning string|array|object
// Example usage:
// await showComponentStatusMenus(ns, [
//   { id: 'hack', title: 'Hack Worker', getStatus: async (ns) => ns.getServer('home') },
//   { id: 'gang', title: 'Gang', status: ['members: 3', 'wanted: 1'] }
// ])
// Simple registry for status providers.
// register(category, name, fn) - fn may be sync or async and should accept `ns` and return value
export const statusRegistry = (function () {
	const registry = new Map()

	function _ensureCategory(cat) {
		if (!registry.has(cat)) registry.set(cat, new Map())
		return registry.get(cat)
	}

	return {
		register(category, name, fn) {
			if (!category || !name || typeof fn !== 'function') throw new Error('Invalid register args')
			_ensureCategory(category).set(name, fn)
			return true
		},
		unregister(category, name) {
			if (!registry.has(category)) return false
			return registry.get(category).delete(name)
		},
		clearCategory(category) {
			if (!registry.has(category)) return false
			registry.get(category).clear()
			return true
		},
		clearAll() {
			registry.clear()
		},
		// returns { category: { name: value, ... }, ... }
		async getSnapshot(ns) {
			const out = {}
			for (const [cat, map] of registry.entries()) {
				out[cat] = {}
				const promises = []
				for (const [name, fn] of map.entries()) {
					const p = (async () => {
						try {
							const v = await fn(ns)
							out[cat][name] = v
						} catch (e) {
							out[cat][name] = `Error: ${e.message}`
						}
					})()
					promises.push(p)
				}
				await Promise.all(promises)
			}
			return out
		}
	}
})()

export async function showComponentStatusMenus(ns, components = [], opts = {}) {
	// opts: { layout: 'stack'|'grid', refreshMs: number }
	const layout = opts.layout || 'stack'
	const refreshMs = Number(opts.refreshMs) || 0
	const useRegistry = !!opts.useRegistry

	let _isRendering = false
	const renderOnce = async () => {
		if (_isRendering) return
		_isRendering = true
		// if using registry, build components list from snapshot
		if (useRegistry) {
			try {
				const snap = await statusRegistry.getSnapshot(ns)
				const built = []
				for (const [cat, items] of Object.entries(snap)) {
					const lines = []
					for (const [name, val] of Object.entries(items)) {
						if (val === null || val === undefined) lines.push(`${name}: `)
						else if (typeof val === 'object') lines.push(`${name}: ${JSON.stringify(val)}`)
						else lines.push(`${name}: ${String(val)}`)
					}
					built.push({ id: cat, title: cat, status: lines })
				}
				components = built
			} catch (e) {
				components = [{ id: 'registry-error', title: 'Registry Error', status: `Error: ${e.message}` }]
			}
		}
		const menus = []

		for (const comp of components) {
			const title = comp.title || comp.id || 'Component'
			const items = []

			// resolve status value
			let statusVal = null
			try {
				if (typeof comp.getStatus === 'function') {
					statusVal = await comp.getStatus(ns)
				} else {
					statusVal = comp.status
				}
			} catch (e) {
				statusVal = `Error: ${e.message}`
			}

			// render statusVal into list items
			if (statusVal === null || statusVal === undefined) {
				items.push(React.createElement('li', null, 'No data'))
			} else if (Array.isArray(statusVal)) {
				for (const v of statusVal) items.push(React.createElement('li', null, String(v)))
			} else if (typeof statusVal === 'object') {
				for (const [k, v] of Object.entries(statusVal)) items.push(React.createElement('li', null, `${k}: ${String(v)}`))
			} else {
				items.push(React.createElement('li', null, String(statusVal)))
			}

			// wrapper for the component menu
			const boxStyle = {
				border: '1px solid #888',
				padding: '6px',
				margin: '6px',
				boxSizing: 'border-box',
			}
			if (layout === 'grid') {
				boxStyle.minWidth = '220px'
				boxStyle.flex = '1 0 220px'
			}

			const box = React.createElement('div', { style: boxStyle },
				React.createElement('h3', null, title),
				React.createElement('ul', null, ...items)
			)

			menus.push(box)
		}

		const containerStyle = {}
		let containerProps = null
		if (layout === 'grid') {
			containerStyle.display = 'flex'
			containerStyle.flexWrap = 'wrap'
			containerStyle.alignItems = 'flex-start'
			containerProps = { style: containerStyle }
		} else {
			containerProps = { style: { display: 'block' } }
		}

		const page = React.createElement('div', containerProps, ...menus)
		ns.ui.renderPage(page)
	}

	// perform initial render
	await renderOnce()

	// handle returned to caller: always provide a manual refresh function and stop()
	let _running = false
	const handle = {
		refresh: async () => {
			await renderOnce()
		},
		stop: () => { _running = false },
		isRunning: () => _running
	}

	// if a periodic refresh interval is requested, start a safe async loop
	if (refreshMs > 0) {
		_running = true
		;(async function loop() {
			while (_running) {
				await renderOnce()
				await ns.sleep(refreshMs)
			}
		})()
	}

	return handle
}

