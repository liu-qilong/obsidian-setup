let current_name = dv.current().file.name

let current_tag
let query_str

try {
    if (dv.current().aliases[0][0] === '#') {
        current_tag = dv.current().aliases[0].replace('#', '')
        query_str = `(#${current_tag} or [[]])`
    }
} catch (err) {
    current_tag = null
    query_str = '[[]]'
}

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
    'Type/Course': {
        'show_name': 'course 👨🏼‍🏫',
        'show_vars': [],
    },
    'Type/Book': {
        'show_name': 'books 📚',
        'show_vars': [],
    },
}

for (let tag_name of Object.keys(tag_dict)) {
    let show_name = tag_dict[tag_name]['show_name']
    let show_vars = tag_dict[tag_name]['show_vars']
    let pages = dv.pages(`#${tag_name} and ${query_str}`)

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
let thoughts = dv.pages(`#Type/Diary and ${query_str}`).file.lists
    .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
    .sort(ls => dv.date(ls.link), 'desc')
    
if (thoughts.length > 0) {
    dv.header(2, 'Mentions in lists 💡')
    dv.table(
        ['link', 'text'],
        thoughts.map(ls => {
            const date = dv.date(dv.page(ls.link).date)
            ls.link.display = `${date.monthLong} ${date.day}, ${date.year}`
            return [ls.link, ls.text]
        })
    )
}