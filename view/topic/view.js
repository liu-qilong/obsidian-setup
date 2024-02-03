let current_tag = dv.current().aliases[0]
let current_name = dv.current().file.name

// topic
let tags = dv.pages("#Type/Topic").where(p => {
    if (p.aliases != null) {
        return (p.aliases[0].includes(current_tag) & p.aliases[0] != current_tag)
    } else {
        return false
    }
})

if (tags.length > 0) {
    dv.header(2, 'Sub tags')
    dv.table(
        ['link',],
        tags.map(p => [p.file.link,])
    )
}

// projects
let projects = dv.pages(`#Type/Project and ${current_tag}`)

if (projects.length > 0) {
    dv.header(2, 'Projects')
    dv.table(
        ['link', 'start', 'complete'],
        projects.map(p => [p.file.link, p.startProject, p.completeProject])
    )
}

// members
let members = dv.pages(`#Type/People and ${current_tag}`)

if (members.length > 0) {
    dv.header(2, 'Related people')
    dv.table(
        ['link', 'address', 'email'],
        members.map(m => [m.file.link, m.address, m.email])
    )
}

// notes
let notes = dv.pages(`#Type/Note and (${current_tag} or [[]])`).sort(n => n.date, 'desc')

if (notes.length > 0) {
    dv.header(2, 'Notes')
    dv.table(
        ['link', 'date', 'update'],
        notes.map(p => [p.file.link, p.date, (dv.isArray(p.update))?(p.update[p.update.length - 1]):(null)])
    )
}

// paper lists
let lists = dv.pages(`#Type/Thread and (${current_tag} or [[]])`).sort(n => n.date, 'desc')

if (lists.length > 0) {
    dv.header(2, 'Paper lists')
    dv.table(
        ['link', 'date', 'update'],
        lists.map(p => [p.file.link, p.date, (dv.isArray(p.update))?(p.update[p.update.length - 1]):(null)])
    )
}

// thoughts
let thoughts = dv.pages(`#Type/Diary and (${current_tag} or [[]])`).file.lists
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