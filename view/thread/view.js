const {PaperThread} = await cJS()

const current_file = dv.current()
const current_name = current_file.file.name
const current_tag = current_file.aliases[0].replace('#', '')
const max_depth = current_file.max_depth

let papers = dv.pages(`#Type/Paper and #${current_tag}`).sort(p => p.bib_year, 'asc')

// flow view
if (current_file.no_flow != true) {
    // statistics
    dv.header(2, `Thread [total::${papers.length}] [skimmed::${papers.filter(p => String(p.bib_badge).includes('skimmed')).length}] [read::${papers.filter(p => String(p.bib_badge).includes('read')).length}]`)

    let commands = []
    commands.push(`\`\`\`mermaid\n${PaperThread.mermaid_style}\nclassDiagram`)
    commands.push(`class List {\n${current_name}\n#${current_tag}\n}`)

    // parse paper branches
    let branches = { __items__: [] }

    for (let p of papers) {
        for (let tag of p.tags) {
            if (tag.includes(current_tag)) {
                if (tag.includes(`${current_tag}/`)) {
                    // belongs to a sub tag
                    let branch_index = tag.replace(`${current_tag}/`, '').split('/')
                    PaperThread.push_nested_dict(branches, branch_index, p)
                } else {
                    // belongs to the current tag
                    branches.__items__.push(p)
                }
            }
        }
    }

    // draw branches
    let id_dict = []

    function draw_branch(name, node, start, mode, layer) {
        if (max_depth != null && layer > max_depth) {
            return
        }

        for (let [sub_name, sub_node] of Object.entries(node)) {
            let current = start

            if (sub_name == '__items__') {
                if (mode == 'downward') {
                    // draw downward branch items
                    for (let p of sub_node) {
                        bib_id = PaperThread.paper_node(dv, p, id_dict, commands)
                        name_str = (name.length == 0)?(''):(`: ${name}`)
                        commands.push(`${current} --> ${bib_id}${name_str}`)
                        current = bib_id
                    }
                } else if (mode == 'upward') {
                    // draw upward branch items
                    for (let p of sub_node.toReversed()) {
                        let bib_id = PaperThread.paper_node(dv, p, id_dict, commands)
                        let name_str = (name.length == 0)?(''):(`: ${name}`)
                        commands.push(`${bib_id} --> ${current}${name_str}`)
                        current = bib_id
                    }
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
                    draw_branch(sub_name, sub_node, current, 'upward', layer + 1)
                } else {
                    // otherwise, pass current mode to the next level
                    draw_branch(sub_name, sub_node, current, mode, layer + 1)
                }
            }
        }
    }

    draw_branch('', branches, 'List', 'downward', 0)
    dv.paragraph(commands.join('\n'))
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