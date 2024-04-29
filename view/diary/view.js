const current_file = dv.current()
let today = current_file.date

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

let time_dict = {}

for (let [key, value] of Object.entries(current_file)) {
	if (key.includes('time_')) {
		time_dict[key.replace('time_', '')] = timestr2hour(value)
	}
}

// sum of times array
let sum = 0
let arr_sum = Object.values(time_dict).map((value) => {
	sum += value
	return sum
})

let total_time = sum

if (total_time > 0) {
	dv.header(2, `Time statistics 📊 [total::${total_time.toFixed(2)}]`)
	
	// time statistics bar
	const mermaid_style = "%%{init: {'themeVariables': {'xyChart': {'backgroundColor': '#00000000'}}}}%%" // xyChart/backgroundColor: background color
	let commands = [`\`\`\`mermaid\n${mermaid_style}\nxychart-beta`]
	commands.push(`title ${Object.keys(time_dict).join('-')}`)
	commands.push('x-axis [today]')
	commands.push(`y-axis "Time (h) ${Object.keys(time_dict).join('/')}" 0 --> ${Math.max(...arr_sum)}`)

	for (let value of arr_sum.reverse()) {
		commands.push(`bar [${value}]`)
	}

	dv.paragraph(commands.join('\n'))

	// time statistics table
	let time_tab_header = ['total']
	let time_tab_total = [total_time.toFixed(2)]

	for (let [key, value] of Object.entries(time_dict)) {
		time_tab_header.push(`${key} (h)`)
		time_tab_total.push(value.toFixed(2))
	}

	dv.table(
		time_tab_header,
		[time_tab_total,],
	)
}

// pages created/updated today separated by type
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
			let dates = []

			for (let v of match_vars) {
				if (dv.isArray(p[v])) {
					dates.push(...p[v])
				} else {
					dates.push(p[v])
				}
			}
			
			for (let date of dates) {
				if (dv.equal(date, today)) {
					return true
				}
			}
		})

    if (pages.length > 0) {
        dv.header(2, `Today's ${show_name}`)
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

// tasks completed today
let tasks = dv.pages().file.tasks
	.where(t => dv.equal(t.complete, today))
	.groupBy(t => dv.page(t.path).file.name)
	
if (tasks.length > 0) {
	dv.header(2, 'Completed 🦾')
	dv.taskList(tasks)
}