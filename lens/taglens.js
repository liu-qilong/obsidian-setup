class TagLens {
    tag_dict = {
        'Type/Project': {
            'show_name': 'Projects 🏗️',
            'show_vars': [],
        },
        'Type/Topic': {
            'show_name': 'Topics 📚',
            'show_vars': [],
        },
        'Type/Thread': {
            'show_name': 'Threads 🗞️',
            'show_vars': [],
        },
        'Type/Note': {
            'show_name': 'Notes ✍️',
            'show_vars': ['date', 'update'],
        },
        'Type/People': {
            'show_name': 'People 📞',
            'show_vars': ['address', 'email'],
        },
        'Type/Institute': {
            'show_name': 'Institutes 🏛️',
            'show_vars': ['address', 'email'],
        },
        'Type/Course': {
            'show_name': 'Course 👨🏼‍🏫',
            'show_vars': [],
        },
        'Type/Book': {
            'show_name': 'Books 📚',
            'show_vars': [],
        },
    }

    show_related(dv, show_name, show_vars, pages, PaperThread) {
        if (pages.length > 0) {
            dv.header(2, show_name)
            dv.table(
                ['link'].concat(show_vars),
                pages.map(p => [p.file.link].concat(show_vars.map(v => {
                    if (v === 'update') {
                        if (dv.isArray(p[v])) {
                            return p[v][p[v].length - 1]
                        } else {
                            return null
                        }
                    } else if (v === 'bib_badge') {
                        return PaperThread.bib_badge2str(dv, p[v])
                    } else {
                        return p[v]
                    }
                }))),
            )
        }
    }
}