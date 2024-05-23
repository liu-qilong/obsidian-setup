class PaperThread {
    // thread view related
    mermaid_style = "%%{ init: { 'themeVariables': { 'nodeBorder': '#00000000', 'mainBkg': '#00000000' }}}%%"
    // nodeBorder: class box segment line color
    // mainBkg: background color of the links' text box
    
    set_up(dv) {
        this.dv = dv
    }

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

    paper_node(p, id_dict, commands) {
        let badge_str = this.bib_badge2str(p.bib_badge)
        let cite_str = (p.bib_cites != null)?(`[${this.to_short_num(p.bib_cites)}]`):('')
        let note_str = (this.dv.isArray(p.bib_note) && p.bib_note.length > 0)?(p.bib_note.join('\n')):('')
        let comment_str = (this.dv.isArray(p.bib_remark) && p.bib_remark.length > 0)?(p.bib_remark.map(p => `*(${p})`).join('\n')):('')
        
        // set class name according to how many times an item appears in the thread
        let bib_id = ''

        if (id_dict[p.bib_id] === undefined) {
            id_dict[p.bib_id] = 1
            bib_id = p.bib_id
        } else {
            id_dict[p.bib_id] += 1
            bib_id = `${p.bib_id}-${id_dict[p.bib_id]}`
        }
        
        // add class definition to mermaid commands
        commands.push(`class ${bib_id} {\n${badge_str} ${cite_str}\n${note_str}\n${comment_str}}`) 
        
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