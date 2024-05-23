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

    set_up(dv, PaperThread) {
        this.dv = dv
        this.PaperThread = PaperThread
    }

    show_related(show_name, show_vars, pages) {
        if (pages.length > 0) {
            this.dv.header(2, show_name)
            this.dv.table(
                ['link'].concat(show_vars),
                pages.map(p => [p.file.link].concat(show_vars.map(v => {
                    if (v === 'update') {
                        if (this.dv.isArray(p[v])) {
                            return p[v][p[v].length - 1]
                        } else {
                            return null
                        }
                    } else if (v === 'bib_badge') {
                        return this.PaperThread.bib_badge2str(p[v])
                    } else {
                        return p[v]
                    }
                }))),
            )
        }
    }

    show_thoughts(thoughts) {
        if (thoughts.length > 0) {
            this.dv.header(2, 'Thoughts 💡')
            this.dv.table(
                ['link', 'text'],
                thoughts.map(ls => {
                    const date = this.dv.date(this.dv.page(ls.link).date)
                    ls.link.display = `${date.monthLong} ${date.day}, ${date.year}`
                    return [ls.link, ls.text]
                })
            )
        }
    }
}