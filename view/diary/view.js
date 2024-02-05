let today = dv.current().date

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
    'Type/Note': ['date', 'update'],
    'Type/Paper': ['date', 'update'],
}

for (let [tag_name, tag_vars] of Object.entries(tag_dict)) {
    let pages = dv.pages(`#${tag_name}`)
		.where(n => {
			var dates = [n.date].concat(n.update)
			
			for (let date of dates) {
				if (dv.equal(date, today)) {
					return true
				}
			}
		})

    if (pages.length > 0) {
        dv.header(2, `Related ${tag_name.split('/')[1]}`)
        dv.table(
            ['link'].concat(tag_vars),
            pages.map(p => [p.file.link].concat(tag_vars.map(v => {
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