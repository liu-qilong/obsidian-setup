
let startdate = String(dv.current().start).split('T')[0]
let duration = dv.current().duration
let diary_folder = 'content/diary'

// parse week dates
function days_later(date_str, days) {
	let date = new Date(date_str)
	date.setDate(date.getDate() + days)
	return date.toISOString().split('T')[0]
}


let dates = Array.from({ length: duration }, (_, i) => days_later(startdate, i));

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
let sum = Array.from({ length: duration }, () => 0);
let arr_sum = Object.values(time_dict).map((arr) => {
	sum = sum.map((value, idx) => value + arr[idx])
	return sum
})

if (Object.entries(time_dict).length > 0) {
	dv.header(2, 'Time statistics 📊')
	
	const mermaid_style = "%%{init: {'themeVariables': {'xyChart': {'backgroundColor': '#00000000'}}}}%%" // xyChart/backgroundColor: background color
	let commands = [`\`\`\`mermaid\n${mermaid_style}\nxychart-beta`]
	commands.push(`title ${Object.keys(time_dict).join('-')}`)
	commands.push('x-axis [mon, tue, wed, thu, fri, sat, sun]')
	commands.push(`y-axis "Time (h)" 0 --> ${Math.max(...arr_sum.flat())}`)

	for (let arr of arr_sum.reverse()) {
		commands.push(`bar [${arr}]`)
	}

	dv.paragraph(commands.join('\n'))
}

// // tasks completed today
// let tasks = dv.pages().file.tasks
// 	.where(t => dv.equal(t.complete, today))
// 	.groupBy(t => dv.page(t.path).file.name)
	
// if (tasks.length > 0) {
// 	dv.header(2, 'Completed 🦾')
// 	dv.taskList(tasks)
// }

// // pages created/updated today separated by type
// let tag_dict = {
// 	'Type/Project': {
// 		'show_name': 'projects 🏗️',
//         'match_vars': ['project_start', 'project_complete'],
// 		'show_vars': ['project_start', 'project_complete'],
//     },
//     'Type/Paper': {
// 		'show_name': 'papers 📃',
// 		'match_vars': ['date', 'update'],
// 		'show_vars': ['bib_title', 'date', 'update'],
// 	},
//     'Type/Note': {
// 		'show_name': 'notes ✍️',
// 		'match_vars': ['date', 'update'],
// 		'show_vars': ['date', 'update'],
// 	},
// }

// for (let tag_name of Object.keys(tag_dict)) {
// 	let show_name = tag_dict[tag_name]['show_name']
// 	let match_vars = tag_dict[tag_name]['match_vars']
// 	let show_vars = tag_dict[tag_name]['show_vars']
//     let pages = dv.pages(`#${tag_name}`)
// 		.where(p => {
// 			let dates = []

// 			for (let v of match_vars) {
// 				if (dv.isArray(p[v])) {
// 					dates.push(...p[v])
// 				} else {
// 					dates.push(p[v])
// 				}
// 			}
			
// 			for (let date of dates) {
// 				if (dv.equal(date, today)) {
// 					return true
// 				}
// 			}
// 		})

//     if (pages.length > 0) {
//         dv.header(2, `Today's ${show_name}`)
//         dv.table(
//             ['link'].concat(show_vars),
//             pages.map(p => [p.file.link].concat(show_vars.map(v => {
//                 if (v === 'update') {
//                     if (dv.isArray(p[v])) {
//                         return p[v][p[v].length - 1]
//                     } else {
//                         return null
//                     }
//                 } else {
//                     return p[v]
//                 }
//             }))),
//         )
//     }
// }