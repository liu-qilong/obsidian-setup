class PaperThread {
    list_style = 'fill:#bbbbbba0, stroke:#000000, stroke-width:2px, stroke-dasharray: 5 5'
    paper_embed_style = 'max-width:200px;max-height:200px;text-align:left;line-height:100%;padding:5px;overflow-x:scroll;'

    set_up(dv, TagLens) {
        this.dv = dv
        this.TagLens = TagLens
    }

    // thread view related
    bib_badge2str(bib_badge) {
        let badge2emoji = {
            'skimmed': '🪫',
            'read': '🔋',
            'seminal': '💡',
            'important': '📌',
            'work-well': '👍',
            'widely-used': '🔧',
            'insightful': '🧠',
        }
    
        return (this.dv.isArray(bib_badge) && bib_badge.length > 0)?(bib_badge.map(badge => badge2emoji[badge]).join('')):('')
    }

    thread_node(tag, source_tag, thread_id_dict, commands) {
        let thread_id = `List-${Object.keys(thread_id_dict).length + 1}`
        thread_id_dict[tag] = thread_id

        let [thread_title, thread_path] = this.TagLens.get_tag_title_path('Type/Thread', tag)

        // draw thread node
        let branch_tag = (source_tag != '')?(tag.replace(`${source_tag}/`, '')):(`#${tag}`)
        let link_str = (thread_title != '')?(`<a class="internal-link" data-href="${thread_path}">${branch_tag}</a>\n`):(`${branch_tag}\n`)
        let title_str = (thread_title != '')?(`${thread_title}`):('')
        commands.push(`${thread_id}([${link_str}${title_str}])`)
        commands.push(`style ${thread_id} ${this.list_style}`)

        if (source_tag != '') {
            if (branch_tag.startsWith('pre-')) {
                commands.push(`${thread_id} ---> ${thread_id_dict[source_tag]}`)
            } else {
                commands.push(`${thread_id_dict[source_tag]} ---> ${thread_id}`)
            }
        }
    }

    paper_node(p, id_dict, commands) {
        // set class name according to how many times an item appears in the thread
        let bib_id = ''

        if (id_dict[p.bib_id] === undefined) {
            id_dict[p.bib_id] = 1
            bib_id = p.bib_id
        } else {
            id_dict[p.bib_id] += 1
            bib_id = `${p.bib_id}-${id_dict[p.bib_id]}`
        }

        // assemble strings
        let seg_line = '------------------------------'
        let link_str = `<a class="internal-link" data-href="${p.file.path}">${bib_id}</a>`
        let badge_str = this.bib_badge2str(p.bib_badge)
        let cite_str = (p.bib_cites != null)?(`[${this.to_short_num(p.bib_cites)}]`):('')
        let note_str = (this.dv.isArray(p.bib_note) && p.bib_note.length > 0)?(`${seg_line}\n` + p.bib_note.join('\n')):('')
        let comment_str = (this.dv.isArray(p.bib_remark) && p.bib_remark.length > 0)?(`${seg_line}\n` + p.bib_remark.map(p => `# ${p}`).join('\n')):('') 

        // add class definition to mermaid commands
        commands.push(`\n${bib_id}["${link_str}\n${badge_str} ${cite_str}`)
        commands.push(`<pre style='${this.paper_embed_style}'>\n<code>${p.bib_title}`)
        commands.push(note_str)
        commands.push(`${comment_str}\n</code></pre>"]\n`)
        
        return bib_id
    }

    to_short_num(num) {
        if (Math.abs(num) >= 1e9) {
            return Math.sign(num)*((Math.abs(num)/1e9).toFixed(1)) + 'b'
        } else if (Math.abs(num) >= 1e6) {
            return Math.sign(num)*((Math.abs(num)/1e6).toFixed(1)) + 'm'
        } else if (Math.abs(num) >= 1e3) {
            return Math.sign(num)*((Math.abs(num)/1e3).toFixed(1)) + 'k'
        } else {
            return num
        }
    }

    // nested dict operations
    setup_nested_dict(dict, index) {
        let current = dict
        
        for (let id of index) {
            if (current[id] === undefined) {
                current[id] = {}
            }
            current = current[id]
        }
    }

    push_nested_dict(dict, index, value) {
        let current = dict
        
        for (let id of index) {
            if (current[id] === undefined) {
                current[id] = { __items__: [] }
            }
            current = current[id]
        }

        current.__items__.push(value)
    }

    // bibtex related
    paper_bibtex(p, commands) {
        commands.push(`@${p.bib_type}{${p.bib_id},`)
        let flag = false

        for (let [key, value] of Object.entries(p)) {
            if (key == 'bib_id') {
                flag = true
                continue
            }
            if (flag == true && key.includes('bib_')) {
                commands.push(`\t${key.replace('bib_', '')} = {${value}},`)
            }
        }

        commands.push('}\n')
    }

    async get_cites(doi) {
        return fetch(`https://api.crossref.org/works/${doi}`)
            .then(response => response.json())
            .then(data => data['message']['is-referenced-by-count'])
            .catch(error => console.error('Error:', error))
    }

    async get_bibtex(doi) {
        return fetch(`https://doi.org/${doi}`, { headers: { Accept: "application/x-bibtex" }})
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error)
        })
    }   
}