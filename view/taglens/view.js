let current_name = dv.current().file.name
let current_tag = dv.current().aliases[0].replace('#', '')

// tagged/linked pages separated by type
let tag_dict = {
    'Type/Project': ['startProject', 'endProject'],
    'Type/Topic': [],
    'Type/Thread': ['date', 'update'],
    'Type/Note': ['date', 'update'],
    'Type/People': ['address', 'email'],
    'Type/Institute': ['address', 'email'],
}

for (let [tag_name, tag_vars] of Object.entries(tag_dict)) {
    let pages = dv.pages(`#${tag_name} and (#${current_tag} or [[]])`)

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

// tagged/linked mentions in notes
let thoughts = dv.pages(`#Type/Diary and (#${current_tag} or [[]])`).file.lists
    .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
    .sort(ls => dv.date(ls.link), 'desc')
    
if (thoughts.length > 0) {
    dv.header(2, 'Mentions')
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