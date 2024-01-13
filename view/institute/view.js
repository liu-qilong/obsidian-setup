let current_tag = dv.current().aliases[0]
let current_name = dv.current().file.name

// members
let members = dv.pages(`#People and ${current_tag}`)

if (members.length > 0) {
    dv.header(2, 'Members')
    dv.table(
        ['link', 'address', 'email'],
        members.map(m => [m.file.link, m.address, m.email])
    )
}

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
        notes.map(p => [p.file.link, p.date, (dv.isArray(p.update))?(p.update[p.update.length - 1]):(null)])
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