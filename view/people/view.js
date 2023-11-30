let current_tag = dv.current().aliases[0]
let current_name = dv.current().file.name

// projects
let projects = dv.pages(`#Project and ${current_tag}`)

if (projects.length > 0) {
    dv.header(2, 'Projects')
    dv.table(
        ['link', 'start', 'complete'],
        projects.map(p => [p.file.link, p.startProject, p.completeProject])
    )
}

// notes
let notes = dv.pages(`#Note and (${current_tag} or [[]])`).sort(n => n.date, 'desc')

if (notes.length > 0) {
    dv.header(2, 'Notes')
    dv.table(
        ['link', 'date', 'update'],
        notes.map(p => [p.file.link, p.date, (p.update == null)?(null):(p.update.flat())])
    )
}

// chats
let chats = dv.pages(`#Chat and (${current_tag} or [[]])`).sort(n => n.date, 'desc')

if (chats.length > 0) {
    dv.header(2, 'Chats')
    dv.table(
        ['link', 'date', 'update'],
        chats.map(p => [p.file.link, p.date, (p.update == null)?(null):(p.update.flat())])
    )
}

// thoughts
let thoughts = dv.pages(`#Diary and (${current_tag} or [[]])`).file.lists
    .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
    .sort(ls => dv.date(ls.link), 'desc')

if (thoughts.length > 0) {
    dv.header(2, 'Thoughts')
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

// tasks
let tasks = dv.pages(`${current_tag} or [[]]`).file.lists
    .where(ls => (ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))

if (tasks.length > 0) {
    dv.header(2, 'Tasks')
    dv.taskList(tasks)
}