let today = dv.current().date

// tasks completed today
let tasks = dv.pages().file.tasks
	.where(t => dv.equal(t.complete, today))
	.groupBy(t => dv.page(t.path).file.name)
	
if (tasks.length > 0) {
	dv.header(2, 'Completed 🦾')
	dv.taskList(tasks)
}

// notes
let notes = dv.pages("#Note")
	.where(n => {
		var dates = [n.date]
		
		if (n.update != null) {
			dates.push(...n.update.flat())
		}
		
		for (let date of dates) {
			if (dv.equal(date, today)) {
				return true
			}
		}
	})

if (notes.length > 0) {
	dv.header(2, 'Notes 📖')
	dv.table(
		['link', 'date', 'update'],
		notes.map(n => [n.file.link, n.date, (dv.isArray(n.update))?(n.update[n.update.length - 1]):(null)])
	)
}

// Papers
let papers = dv.pages("#Paper")
	.where(n => {
		var dates = [n.date]
		
		if (n.update != null) {
			dates.push(...n.update.flat())
		}
		
		for (let date of dates) {
			if (dv.equal(date, today)) {
				return true
			}
		}
	})

if (papers.length > 0) {
	dv.header(2, 'Papers 🔬')
	dv.table(
		['link', 'title', 'date', 'update'],
		papers.map(p => [p.file.link, p.bib_title, p.date, (dv.isArray(p.update))?(p.update[p.update.length - 1]):(null)])
	)
}