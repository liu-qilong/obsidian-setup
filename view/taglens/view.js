let current_name = dv.current().file.name
let current_tag = dv.current().aliases[0].replace('#', '')

// tagged/linked pages separated by type
let tag_dict = {
    'Type/Project': {
        'show_name': 'projects 🏗️',
        'show_vars': [],
    },
    'Type/Topic': {
        'show_name': 'topics 📚',
        'show_vars': [],
    },
    'Type/Thread': {
        'show_name': 'threads 🗞️',
        'show_vars': [],
    },
    'Type/Note': {
        'show_name': 'notes ✍️',
        'show_vars': ['date', 'update'],
    },
    'Type/People': {
        'show_name': 'people 📞',
        'show_vars': ['address', 'email'],
    },
    'Type/Institute': {
        'show_name': 'institutes 🏛️',
        'show_vars': ['address', 'email'],
    },
}

for (let tag_name of Object.keys(tag_dict)) {
    let show_name = tag_dict[tag_name]['show_name']
    let show_vars = tag_dict[tag_name]['show_vars']
    let pages = dv.pages(`#${tag_name} and (#${current_tag} or [[]])`)

    if (pages.length > 0) {
        dv.header(2, `Related ${show_name}`)
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

// tagged/linked mentions in diary notes
let thoughts = dv.pages(`#Type/Diary and (#${current_tag} or [[]])`).file.lists
    .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
    .sort(ls => dv.date(ls.link), 'desc')
    
if (thoughts.length > 0) {
    dv.header(2, 'Mentions in lists 💡')
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