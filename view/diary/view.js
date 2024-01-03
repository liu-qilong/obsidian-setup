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
		notes.map(n => [n.file.link, n.date, (n.update == null)?(null):(n.update.flat())])
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
		papers.map(n => [n.file.link, n.bib_title, n.date, (n.update == null)?(null):(n.update.flat())])
	)
}