const {PaperThread} = await cJS()
const {DailyLens} = await cJS()
const {TagLens} = await cJS()
DailyLens.set_up(dv)
PaperThread.set_up(dv, TagLens)
TagLens.set_up(dv, PaperThread)

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
} else {
	let startdate = String(dv.current().start).split('T')[0]
	duration = dv.current().duration
	dates = Array.from({ length: duration }, (_, i) => DailyLens.days_later(startdate, i))
}

// time stats
class TimeChart {
	constructor(dates, duration) {
		this.dates = dates
		this.duration = duration
		this.parse_time_stats()

		if (this.total_time > 0) {
			this.chart()
			this.table()
		}
	}

	parse_time_stats() {
		// get time_dict {type: time_array}
		this.time_dict = DailyLens.time_stats(this.dates)

		// create accumulative time arrays
		// [
		//    1st type time_array,
		//    sum of 1st 2 types time_array,
		//    ...
		// ]
		let sum = Array.from({ length: duration }, () => 0)
		this.arr_sum = Object.values(this.time_dict).map(
			(arr) => {
				sum = sum.map((value, idx) => value + arr[idx])
				return sum
			})

		// calculate the total time and the number of days with time statistics
		this.total_time = sum.reduce((acc, val) => acc + val, 0)
		this.duration_with_time_stat = sum.filter((value) => value > 0).length
	}

	chart() {
		dv.header(2, `Time statistics 📊 [total::${this.total_time.toFixed(2)}] [avg::${(this.total_time / this.duration_with_time_stat).toFixed(2)}]`)

		let mermaid_style = ""

		if (duration <= 7) {
			mermaid_style = `%%{init: {'themeVariables': {'xyChart': {'backgroundColor': '#00000000', 'plotColorPalette': '${DailyLens.color_palette}'}}}}%%`
			// xyChart/backgroundColor: background color
			// xyChart/plotColorPalette: plot color palette
		} else {
			mermaid_style = `%%{init: {'xyChart': {'xAxis': {'showLabel': false}}, 'themeVariables': {'xyChart': {'backgroundColor': '#00000000', 'plotColorPalette': '${DailyLens.color_palette}'}}}}%%`
			// xyChart/xAxis/showLabel: show x-axis label or not
			// themeVariables/xyChart/backgroundColor: background color
			// xyChart/plotColorPalette: plot color palette
		}

		let commands = [`\`\`\`mermaid\n${mermaid_style}\nxychart-beta`]
		commands.push(`title ${Object.keys(this.time_dict).join('-')}`)
		commands.push(`y-axis "Time (h) ${Object.keys(this.time_dict).join('/')}" 0 --> ${Math.max(...this.arr_sum.flat())}`)

		
		if (current_file.tags.includes('Type/Diary')) {
			commands.push('x-axis [today]')
		} else if (current_file.tags.includes('Type/Week')) {
			commands.push('x-axis [mon, tue, wed, thu, fri, sat, sun]')
		} else {
			commands.push(`x-axis [${Array.from({ length: duration }, (_, i) => i + 1)}]`)
		}

		for (let arr of this.arr_sum.reverse()) {
			commands.push(`bar [${arr}]`)
		}

		dv.paragraph(commands.join('\n'))
	}

	table() {
		let tab_header

		// first column
		if (this.duration > 1) {
			tab_header = ['total & avg']
		} else {
			tab_header = ['total']
		}

		let tab_total = [this.total_time.toFixed(2)]
		let tab_avg = [(this.total_time / this.duration_with_time_stat).toFixed(2)]
		
		// type columns
		for (let [type, value] of Object.entries(this.time_dict)) {
			let type_total = value.reduce((acc, val) => acc + val, 0)
			tab_header.push(`${type} (h)`)
			tab_total.push(type_total.toFixed(2))
			tab_avg.push((type_total / this.duration_with_time_stat).toFixed(2))
		}

		// plot table
		if (duration > 1) {
			dv.table(
				tab_header,
				[tab_total, tab_avg],
			)
		} else {
			dv.table(
				tab_header,
				[tab_total],
			)
		}
	}
}

new TimeChart(dates, duration)

// pages created/updated during this period separated by type
for (let tag_name of Object.keys(DailyLens.tag_dict)) {
	let show_name = DailyLens.tag_dict[tag_name]['show_name']
	let match_vars = DailyLens.tag_dict[tag_name]['match_vars']
	let show_vars = DailyLens.tag_dict[tag_name]['show_vars']
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
	
		TagLens.show_related(show_name, show_vars, pages)
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
		let page = dv.page(date)

		for (let ls of page.file.lists) {
			if (!ls.task) {
				thoughts.push(ls)
			}
		}
	} catch {
		continue
	}
}
    
TagLens.show_thoughts(thoughts)