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

let dates, duration

if (current_file.tags.includes('Type/Week')) {
	dates = week_dates(current_file.year, current_file.week)
	duration = 7
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

if (total_time > 0) {
	dv.header(2, `Time statistics 📊 [total::${total_time.toFixed(2)}] [avg::${(total_time / duration).toFixed(2)}]`)
	
	// time statistics bar
	const mermaid_style = "%%{init: {'themeVariables': {'xyChart': {'backgroundColor': '#00000000'}}}}%%" // xyChart/backgroundColor: background color
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
	let time_tab_total = [total_time]
	let time_tab_avg = [(total_time / duration).toFixed(2)]

	for (let [key, value] of Object.entries(time_dict)) {
		let this_total = value.reduce((acc, val) => acc + val, 0)
		time_tab_header.push(`${key} (h)`)
		time_tab_total.push(this_total)
		time_tab_avg.push((this_total / duration).toFixed(2))
	}

	dv.table(
		time_tab_header,
		[time_tab_total, time_tab_avg],
	)
}

// pages created/updated during this period separated by type
let tag_dict = {
	'Type/Project': {
		'show_name': 'projects 🏗️',
        'match_vars': ['project_start', 'project_complete'],
		'show_vars': ['project_start', 'project_complete'],
    },
    'Type/Paper': {
		'show_name': 'papers 📃',
		'match_vars': ['date', 'update'],
		'show_vars': ['bib_title', 'bib_cites', 'date', 'update'],
	},
    'Type/Note': {
		'show_name': 'notes ✍️',
		'match_vars': ['date', 'update'],
		'show_vars': ['date', 'update'],
	},
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
                } else {
                    return p[v]
                }
            }))),
        )
    }
}

// tasks completed today
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