const {PaperThread} = await cJS()
const {DailyLens} = await cJS()

const current_file = dv.current()

// parse periods dates
let dates, duration

if (current_file.tags.includes('Type/Diary')) {
	dates = DailyLens.day_dates(current_file.date)
	duration = 1
} else if (current_file.tags.includes('Type/Week')) {
	dates = DailyLens.week_dates(current_file.year, current_file.week)
	duration = 7
} else if (current_file.tags.includes('Type/Quarter')) {
	dates = DailyLens.quarter_dates(current_file.year, current_file.quarter)
	duration = dates.length
	console.log(duration)
} else {
	let startdate = String(dv.current().start).split('T')[0]
	duration = dv.current().duration
	dates = Array.from({ length: duration }, (_, i) => DailyLens.days_later(startdate, i))
}

// get time statistics
time_dict = DailyLens.time_stats(dv, dates)

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
		mermaid_style = "%%{init: {'themeVariables': {'xyChart': {'backgroundColor': '#00000000', 'plotColorPalette': '#fbcd9ba0, #bbbbbba0, #e18683a0, #037d7ea0, #ffffffa0'}}}}%%"
		// xyChart/backgroundColor: background color
		// xyChart/plotColorPalette: plot color palette
	} else {
		mermaid_style = "%%{init: {'xyChart': {'xAxis': {'showLabel': false}}, 'themeVariables': {'xyChart': {'backgroundColor': '#00000000', 'plotColorPalette': '#fbcd9ba0, #bbbbbba0, #e18683a0, #037d7ea0, #ffffffa0'}}}}%%"
		// xyChart/xAxis/showLabel: show x-axis label or not
		// themeVariables/xyChart/backgroundColor: background color
		// xyChart/plotColorPalette: plot color palette
	}
	
	let commands = [`\`\`\`mermaid\n${mermaid_style}\nxychart-beta`]
	commands.push(`title ${Object.keys(time_dict).join('-')}`)
	commands.push(`y-axis "Time (h) ${Object.keys(time_dict).join('/')}" 0 --> ${Math.max(...arr_sum.flat())}`)

	
	if (current_file.tags.includes('Type/Diary')) {
		commands.push('x-axis [today]')
	} else if (current_file.tags.includes('Type/Week')) {
		commands.push('x-axis [mon, tue, wed, thu, fri, sat, sun]')
	} else {
		commands.push(`x-axis [${Array.from({ length: duration }, (_, i) => i + 1)}]`)
	}

	for (let arr of arr_sum.reverse()) {
		commands.push(`bar [${arr}]`)
	}

	dv.paragraph(commands.join('\n'))

	// time statistics bar
	let time_tab_header
	let time_tab_avg

	if (duration > 1) {
		time_tab_header = ['total & avg']
		time_tab_avg = [(total_time / duration_with_time_stat).toFixed(2)]
	} else {
		time_tab_header = ['total']
		time_tab_avg = []
	}

	let time_tab_total = [total_time.toFixed(2)]
	
	for (let [key, value] of Object.entries(time_dict)) {
		let this_total = value.reduce((acc, val) => acc + val, 0)
		time_tab_header.push(`${key} (h)`)
		time_tab_total.push(this_total.toFixed(2))
		time_tab_avg.push((this_total / duration_with_time_stat).toFixed(2))
	}

	if (duration > 1) {
		dv.table(
			time_tab_header,
			[time_tab_total, time_tab_avg],
		)
	} else {
		dv.table(
			time_tab_header,
			[time_tab_total],
		)
	}
}

// pages created/updated during this period separated by type
let tag_dict = {
    'Type/Paper': {
		'show_name': 'Papers 📃',
		'match_vars': ['date', 'update'],
		'show_vars': ['bib_title', 'bib_cites', 'bib_badge'],
	},
    'Type/Note': {
		'show_name': 'Notes ✍️',
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
        dv.header(2, show_name)
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
					return PaperThread.bib_badge2str(dv, p[v])
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
	
if (tasks.length > 0) {
	dv.header(2, 'Completed 🦾')
	dv.taskList(tasks)
}

// thoughts during this period
let thoughts = []

for (let date of dates.reverse()) {
	try {
		let page = dv.page(`${DailyLens.diary_folder}/${date}.md`)

		for (let ls of page.file.lists) {
			if (!ls.task) {
				thoughts.push(ls)
			}
		}
	} catch {
		continue
	}
}
    
if (thoughts.length > 0) {
    dv.header(2, 'Thoughts 💡')
    dv.table(
        ['link', 'text'],
        thoughts.map(ls => {
            const date = dv.date(dv.page(ls.link).date)
            ls.link.display = `${date.monthLong} ${date.day}, ${date.year}`
            return [ls.link, ls.text]
        })
    )
}