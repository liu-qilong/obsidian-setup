let current_tag = dv.current().aliases[0]
let current_name = dv.current().file.name

// projects
let projects = dv.pages("#Project").where(p => {
    if (p.aliases != null) {
        return (p.aliases[0].includes(current_tag) & p.aliases[0] != current_tag)
    } else {
        return false
    }
})

if (projects.length > 0) {
    dv.header(2, 'Sub projects')
    dv.table(
        ['link', 'start', 'complete'],
        projects.map(p => [p.file.link, p.startProject, p.completeProject])
    )
}

// members
let members = dv.pages("#People and " + current_tag)

if (members.length > 0) {
    dv.header(2, 'Related people')
    dv.table(
        ['link', 'address', 'email'],
        members.map(m => [m.file.link, m.address, m.email])
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

// paper lists
let lists = dv.pages(`#List and (${current_tag} or [[]])`).sort(n => n.date, 'desc')

if (lists.length > 0) {
    dv.header(2, 'Paper lists')
    dv.table(
        ['link', 'date', 'update'],
        lists.map(p => [p.file.link, p.date, (p.update == null)?(null):(p.update.flat())])
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