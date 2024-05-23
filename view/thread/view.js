const {PaperThread} = await cJS()
PaperThread.set_up(dv)
const {TagLens} = await cJS()
TagLens.set_up(dv, PaperThread)

const current_file = dv.current()
const current_name = current_file.file.name
const current_tag = current_file.aliases[0].replace('#', '')
const max_depth = current_file.max_depth

// choose page fit or scroll
if (current_file.scroll) {
    dv.container.classList.add("page_scroll_class")
} else {
    dv.container.classList.add("page_fit_class")
}

let papers = dv.pages(`#Type/Paper and #${current_tag}`).sort(p => p.bib_year, 'asc')

// thread view
class ThreadView {
    constructor(papers, current_name, current_tag) {
        this.papers = papers
        this.current_name = current_name
        this.current_tag = current_tag
        this.id_dict = {}
        this.commands = []

        this.head()
        this.parse_branch()
        this.draw_branch()
        this.end()
    }

    head() {
        dv.header(2, `Thread [total::${this.papers.length}] [skimmed::${this.papers.filter(p => String(p.bib_badge).includes('skimmed')).length}] [read::${this.papers.filter(p => String(p.bib_badge).includes('read')).length}]`)

        this.commands.push(`\`\`\`mermaid\nflowchart TD`)
        // statistics
        
        PaperThread.thread_node(this.current_tag, '', {}, this.commands)
    }

    parse_branch() {
        this.branches = { __items__: [] }

        for (let p of this.papers) {
            for (let tag of p.tags) {
                if (tag.includes(this.current_tag)) {
                    if (tag.includes(`${this.current_tag}/`)) {
                        // belongs to a sub tag
                        let branch_index = tag.replace(`${this.current_tag}/`, '').split('/')
                        PaperThread.push_nested_dict(this.branches, branch_index, p)
                    } else {
                        // belongs to the current tag
                        this.branches.__items__.push(p)
                    }
                }
            }
        }
    }

    draw_branch() {
        function recursive_draw(obj, name, tag, node, start, mode, layer) {
            if (max_depth != null && layer > max_depth) {
                return
            }
            
            for (let [sub_name, sub_node] of Object.entries(node)) {
                let current = start
                let bib_id_ls = []
    
                if (sub_name == '__items__') {
                    if (mode == 'downward') {
                        // draw downward branch items
                        for (let p of sub_node) {
                            let bib_id = PaperThread.paper_node(p, obj.id_dict, obj.commands)
                            bib_id_ls.push(bib_id)
                            obj.commands.push(`${current} --> ${bib_id}`)
                            current = bib_id
                        }
                    } else if (mode == 'upward') {
                        // draw upward branch items
                        for (let p of sub_node.toReversed()) {
                            let bib_id = PaperThread.paper_node(p, obj.id_dict, obj.commands)
                            bib_id_ls.push(bib_id)
                            obj.commands.push(`${bib_id} --> ${current}`)
                            current = bib_id
                        }
                    }

                    if (name.length != 0 & bib_id_ls.length != 0) {
                        // draw box around sub branch
                        let thread_path = TagLens.get_tag_path('#Type/Thread', tag)
                        let link_str = (thread_path != '')?(`<a class="internal-link" data-href="${thread_path}">${name}</a>`):(name)
                        obj.commands.push(`subgraph ${tag} ["${link_str}"]\n`)
                        obj.commands.push(bib_id_ls.map((id) => id).join('\n'))
                        obj.commands.push('end')
                    }
                } else {
                    if (node.__items__.length > 0 & sub_node.__items__.length > 0) {
                        // if current branch and sub branch both have items
                        // adjust the current drawing item to the last item in current branch
                        // that are published before the first item in sub branch
                        // if none, then set as the first item in current branch when drawing sub-branches
                        // while leave the current drawing item unchanged when drawing root branches
                        if (mode == 'downward') {
                            current = node.__items__[0].bib_id
                            const sub_first = sub_node.__items__[0]
    
                            for (let p of node.__items__) {
                                if (sub_first.bib_year > p.bib_year) {
                                    current = p.bib_id
                                }
                            }
                        } else if (mode == 'upward') {
                            current = node.__items__[node.__items__.length - 1].bib_id
                            const sub_last = sub_node.__items__[sub_node.__items__.length - 1]
    
                            for (let p of node.__items__) {
                                if (sub_last.bib_year < p.bib_year) {
                                    current = p.bib_id
                                }
                            }
                        }
                        
                    } else if (node.__items__.length === 0) {
                        // if current branch doesn't have items
                        // combine current branch name to sub branch name
                        sub_name = (name != '')?(`${name}/${sub_name}`):(sub_name)
                    }
                    
                    if (sub_name.startsWith('pre-')) {
                        // if sub branch name contains 'pre-', set drawing mode as upward
                        recursive_draw(obj, sub_name, `${tag}/${sub_name}`, sub_node, current, 'upward', layer + 1)
                    } else {
                        // otherwise, pass current mode to the next level
                        recursive_draw(obj, sub_name, `${tag}/${sub_name}`, sub_node, current, mode, layer + 1)
                    }
                }
            }
        }

        recursive_draw(this, '', current_tag, this.branches, 'List-1', 'downward', 0)
    }

    end() {
        this.commands.push('```')
        dv.paragraph(this.commands.join('\n'))
    }
}


if (current_file.no_flow != true) {
    new ThreadView(papers, current_name, current_tag)
}

// paper list
if (current_file.no_list != true) {
    dv.header(2, 'Papers')

    papers = papers.sort(item => item.bib_year, 'asc')

    dv.table(
        ['link', 'title', 'venue'],
        papers.map(p => [p.file.link, p.bib_title, (p.bib_journal != null)?(p.bib_journal):(p.bib_booktitle)]),
    )
}

// bibtex
if (current_file.no_bibtex != true) {
    dv.header(2, 'BibTex')

    commands = ['```']

    for (let p of papers) {
        PaperThread.paper_bibtex(p, commands)
    }

    dv.paragraph(commands.join('\n'))
}