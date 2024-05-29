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

    tag2path = {}
    tag2title = {}

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

    show_thoughts(thoughts, title = 'Thoughts 💡') {
        if (thoughts.length > 0) {
            this.dv.header(2, title)
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

    get_tag_page_title_path(tag) {
        if (Object.keys(this.tag2path).length === 0) {
            // parse tag pages' paths and titles at the first call
            console.log('parsing tag pages')
            
            for (let page of this.dv.pages()) {
                if (page.file.aliases.length != 0) {
                    if (page.file.aliases[0][0] === '#' & !page.file.aliases[0].includes('<')) {
                        let page_tag = page.file.aliases[0].replace('#', '')
                        this.tag2path[page_tag] = page.file.path
                        this.tag2title[page_tag] = page.file.name
                    }
                }
            }
        }

        if (Object.keys(this.tag2path).includes(tag)) {
            return [this.tag2title[tag], this.tag2path[tag]]
        } else {
            return ['', '']
        }
    }
}