let today = dv.current().weekstart

// tasks completed today
let tasks = dv.pages().file.tasks
	.where(t => dv.equal(t.complete, today))
	.groupBy(t => dv.page(t.path).file.name)
	
if (tasks.length > 0) {
	dv.header(2, 'Completed 🦾')
	dv.taskList(tasks)
}

// pages created/updated today separated by type
let tag_dict = {
	'Type/Project': {
		'show_name': 'projects 🏗️',
        'match_vars': ['project_start', 'project_complete'],
		'show_vars': ['project_start', 'project_complete'],
    },
    'Type/Paper': {
		'show_name': 'papers 📃',
		'match_vars': ['date', 'update'],
		'show_vars': ['bib_title', 'date', 'update'],
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
                } else {
                    return p[v]
                }
            }))),
        )
    }
}