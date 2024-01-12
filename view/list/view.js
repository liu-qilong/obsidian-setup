// flow view
dv.header(2, 'Flow')

const file = dv.current()

mermaid_style = "%%{ init: { 'themeVariables': { 'nodeBorder': '#00000000', 'mainBkg': '#00000000' }}}%%"
// nodeBorder: class box segment line color
// mainBkg: background color of the links' text box

let commands = [`\`\`\`mermaid\n${mermaid_style}\nclassDiagram`]

// root class
commands.push(`class root {\n${file.file.name}\n}`)

// paper class
let papers = dv.pages(`#Paper and [[]]`)
	.sort(p => p.bib_year, 'asc')

let badge2emoji = {
    'skimmed': '🪫',
    'read': '🔋',
    'seminal': '💡',
    'important': '📌',
    'work-well': '👍',
}

function paper_node(p) {
	let badge_str = (dv.isArray(p.bib_badge) && p.bib_badge.length > 0)?(p.bib_badge.map(p => badge2emoji[p]).join('')):('')
	let note_str = (dv.isArray(p.bib_note) && p.bib_note.length > 0)?(p.bib_note.join('\n')):('')
	let comment_str = (dv.isArray(p.bib_remark) && p.bib_remark.length > 0)?(p.bib_remark.map(p => `*(${p})`).join('\n')):('')

	if (badge_str + note_str + comment_str != '') {
		return `class ${p.bib_id} {\n${badge_str} ${note_str}\n${comment_str}}`
	} else {
		return `class ${p.bib_id}`
	}
}

for (let p of papers) {
	commands.push(paper_node(p))
}

// parse paper branches
let branches = { papers: [] }

for (let p of papers) {
	for (let link of p.bib_list) {
		if (link.path == file.file.path) {
			if (link.subpath == null) {
				branches.papers.push(p)
			} else {
                const idx = link.subpath.split('-')
                let current_node = branches

                for (let id of idx) {
                    if (current_node[id] == null) {
                        current_node[id] = { 'papers': [] }
                    }
                    current_node = current_node[id]
                }
                
                current_node.papers.push(p)
			}
		}
	}
}

// draw branches
function draw(name, node, start, mode) {
	for (let [sub_name, sub_node] of Object.entries(node)) {
        let current = start

        if (sub_name == 'papers') {
            if (mode == 'sub') {
                for (let p of sub_node) {
                    name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${current} -- ${p.bib_id}${name_str}`)
                    current = p.bib_id
                }
            } else if (mode == 'pre') {
                for (let p of sub_node) {
                    name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${p.bib_id} -- ${current}${name_str}`)
                    current = p.bib_id
                }
            } else {
                for (let p of sub_node.toReversed()) {
                    name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${p.bib_id} .. ${current}${name_str}`)
                    current = p.bib_id
                }
            }
        } else {
            if (sub_node.papers.length > 0 & node.papers.length > 0) {
                const sub_first = sub_node.papers[0]

                for (let p of node.papers) {
                    if (sub_first.year > p.year) {
                        current = p.bib_id
                    }
                }
            }
            if (sub_name == 'pre') {
                draw(sub_name, sub_node, current, 'pre')
            } else if (sub_name == 'link') {
                draw(sub_name, sub_node, current, 'link')
            } else {
                draw(sub_name, sub_node, current, mode)
            }
            
        }
	}
}

draw('', branches, 'root', 'sub')

// paper links
const paper_ids = papers.bib_id

for (let p of papers) {
    if (dv.isArray(p.bib_link)) {
        for (let l of p.bib_link) {
            let lid = dv.page(l).bib_id

            if (paper_ids.includes(lid)) {
                if (l.subpath != null) {
                    commands.push(`${p.bib_id} .. ${lid}: ${l.subpath}`)
                } else {
                    commands.push(`${p.bib_id} .. ${lid}`)
                }
            }
        }
    }
}

dv.paragraph(commands.join('\n'))

// paper list
dv.header(2, 'Papers')

papers = papers.sort(item => item.bib_id, 'asc')

dv.table(
	['link', 'title', 'venue'],
	papers.map(p => [p.file.link, p.bib_title, (p.bib_journal != null)?(p.bib_journal):(p.bib_booktitle)]),
)

// bibtex
dv.header(2, 'BibTex')

commands = ['```']

for (let p of papers) {
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

dv.paragraph(commands.join('\n'))