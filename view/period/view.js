const current_file = dv.current()
let diary_folder = 'content/diary'

// parse periods dates
function days_later(date_str, days) {
	let date = new Date(date_str)
	date.setDate(date.getDate() + days)
	return date.toISOString().split('T')[0]
}

function week_dates(year, week) {
	let date = new Date(`${year}-01-01`)
	let day_of_week = date.getDay()
	let first_mon = new Date(date.setDate(1 + (1 + 7 - day_of_week) % 7))
	let week_start = new Date(first_mon.setDate(first_mon.getDate() + (week - 1) * 7))
	
	return Array.from({ length: 7 }, (_, i) => days_later(week_start, i))
}

function quarter_dates(year, quarter) {
	let month = (quarter - 1) * 3
	let start = new Date(year, month, 1)
	let end = new Date(year, month + 3, 0)
	let duration = (end - start) / (1000 * 60 * 60 * 24) + 1
	return Array.from({ length: duration }, (_, i) => days_later(start, i))
}

let dates, duration

if (current_file.tags.includes('Type/Week')) {
	dates = week_dates(current_file.year, current_file.week)
	duration = 7
} else if (current_file.tags.includes('Type/Quarter')) {
	dates = quarter_dates(current_file.year, current_file.quarter)
	duration = dates.length
	console.log(duration)
} else {
	let startdate = String(dv.current().start).split('T')[0]
	duration = dv.current().duration
	dates = Array.from({ length: duration }, (_, i) => days_later(startdate, i))
}

// time statistics
// extract time values
function timestr2hour(time_str) {
	try {
		const [hours, minutes] = time_str.split(':')
		return parseInt(hours) + parseInt(minutes) / 60
	} catch {
		return 0
	}
}

let date_time_dict = {}
let entry_set = new Set()

for (let date of dates) {
	date_time_dict[date] = {}
	try {
		for (let [key, value] of Object.entries(dv.page(`${diary_folder}/${date}.md`))) {
			if (key.includes('time_')) {
				entry_set.add(key.replace('time_', ''))
				date_time_dict[date][key.replace('time_', '')] = timestr2hour(value)
			}
		}
	} catch {
		continue
	}
}

let time_dict = {}

for (let entry of entry_set) {
	time_dict[entry] = []
	for (let date of dates) {
		time_dict[entry].push(date_time_dict[date][entry] || 0)
	}
}

// sum of times array
let sum = Array.from({ length: duration }, () => 0)
let arr_sum = Object.values(time_dict).map((arr) => {
	sum = sum.map((value, idx) => value + arr[idx])
	return sum
})
let total_time = sum.reduce((acc, val) => acc + val, 0)
let duration_with_time_stat = sum.filter((value) => value > 0).length

if (total_time > 0) {
	dv.header(2, `Time statistics 📊 [total::${total_time.toFixed(2)}] [avg::${(total_time / duration_with_time_stat).toFixed(2)}]`)
	
	// time statistics bar
	let mermaid_style = ""

	if (duration < 20) {
		mermaid_style = "%%{init: {'themeVariables': {'xyChart': {'backgroundColor': '#00000000', 'plotColorPalette': '#fbcd9be0, #bbbbbbe0, #e18683e0, #037d7ee0'}}}}%%"
		// xyChart/backgroundColor: background color
		// xyChart/plotColorPalette: plot color palette
	} else {
		mermaid_style = "%%{init: {'xyChart': {'xAxis': {'showLabel': false}}, 'themeVariables': {'xyChart': {'backgroundColor': '#00000000', 'plotColorPalette': '#fbcd9be0, #bbbbbbe0, #e18683e0, #037d7ee0'}}}}%%"
		// xyChart/xAxis/showLabel: show x-axis label or not
		// themeVariables/xyChart/backgroundColor: background color
		// xyChart/plotColorPalette: plot color palette
	}
	
	let commands = [`\`\`\`mermaid\n${mermaid_style}\nxychart-beta`]
	commands.push(`title ${Object.keys(time_dict).join('-')}`)
	commands.push(`y-axis "Time (h) ${Object.keys(time_dict).join('/')}" 0 --> ${Math.max(...arr_sum.flat())}`)

	if (current_file.tags.includes('Type/Week')) {
		commands.push('x-axis [mon, tue, wed, thu, fri, sat, sun]')
	} else {
		commands.push(`x-axis [${Array.from({ length: duration }, (_, i) => i + 1)}]`)
	}

	for (let arr of arr_sum.reverse()) {
		commands.push(`bar [${arr}]`)
	}

	dv.paragraph(commands.join('\n'))

	// time statistics bar
	let time_tab_header = ['total & avg']
	let time_tab_total = [total_time.toFixed(2)]
	let time_tab_avg = [(total_time / duration_with_time_stat).toFixed(2)]

	for (let [key, value] of Object.entries(time_dict)) {
		let this_total = value.reduce((acc, val) => acc + val, 0)
		time_tab_header.push(`${key} (h)`)
		time_tab_total.push(this_total.toFixed(2))
		time_tab_avg.push((this_total / duration_with_time_stat).toFixed(2))
	}

	dv.table(
		time_tab_header,
		[time_tab_total, time_tab_avg],
	)
}

// pages created/updated during this period separated by type
let tag_dict = {
    'Type/Paper': {
		'show_name': 'papers 📃',
		'match_vars': ['date', 'update'],
		'show_vars': ['bib_title', 'bib_cites', 'bib_badge'],
	},
    'Type/Note': {
		'show_name': 'notes ✍️',
		'match_vars': ['date', 'update'],
		'show_vars': ['date', 'update'],
	},
}

function bib_badge2str(bib_badge) {
	let badge2emoji = {
		'skimmed': '🪫',
		'read': '🔋',
		'seminal': '💡',
		'important': '📌',
		'work-well': '👍',
		'widely-used': '🔧',
		'insightful': '🧠',
	}

	return (dv.isArray(bib_badge) && bib_badge.length > 0)?(bib_badge.map(badge => badge2emoji[badge]).join('')):('')
}

for (let tag_name of Object.keys(tag_dict)) {
	let show_name = tag_dict[tag_name]['show_name']
	let match_vars = tag_dict[tag_name]['match_vars']
	let show_vars = tag_dict[tag_name]['show_vars']
    let pages = dv.pages(`#${tag_name}`)
		.where(p => {
			let page_dates = []

			for (let v of match_vars) {
				if (dv.isArray(p[v])) {
					page_dates.push(...p[v])
				} else {
					page_dates.push(p[v])
				}
			}
			
			for (let date of dates) {
				for (let page_date of page_dates) {
					if (dv.equal(page_date, dv.date(date))) {
						return true
					}
				}
			}
		})
	
	if (pages.length > 0) {
        dv.header(2, `Period's ${show_name}`)
        dv.table(
            ['link'].concat(show_vars),
            pages.map(p => [p.file.link].concat(show_vars.map(v => {
                if (v === 'update') {
                    if (dv.isArray(p[v])) {
                        return p[v][p[v].length - 1]
                    } else {
                        return null
                    }
                } else if (v === 'bib_badge') {
					return bib_badge2str(p[v])
				} else {
                    return p[v]
                }
            }))),
        )
    }
}

// tasks completed during this period
let tasks = dv.pages().file.tasks
	.where(t => {
		for (let date of dates) {
			if (dv.equal(t.complete, dv.date(date))) {
				return true
			}
		}
	})
	.groupBy(t => dv.page(t.path).file.name)
	// .where(t => dv.equal(t.complete, today))
	
if (tasks.length > 0) {
	dv.header(2, 'Completed 🦾')
	dv.taskList(tasks)
}

// thoughts during this period
let thoughts = []

for (let date of dates) {
	try {
		let page = dv.page(`${diary_folder}/${date}.md`)

		for (let ls of page.file.lists) {
			if (!ls.task) {
				thoughts.push(ls)
			}
		}
	} catch {
		continue
	}
}

console.log(thoughts)

// let thoughts = dv.pages(`#Type/Diary`).file.lists
//     .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
//     .sort(ls => dv.date(ls.link), 'desc')
    
if (thoughts.length > 0) {
    dv.header(2, 'Mentions in lists 💡')
    dv.table(
        ['link', 'text'],
        thoughts.map(ls => {
            const date = dv.date(dv.page(ls.link).date)
            ls.link.display = `${date.monthLong} ${date.day}, ${date.year}`
            console.log(date)
            return [ls.link, ls.text]
        })
    )
}