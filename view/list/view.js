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
	.sort(p => p.year, 'asc')

let badge2emoji = {
    'skimmed': '🪫',
    'read': '🔋',
    'seminal': '💡',
}

function paper_node(p) {
	let badge_str = (dv.isArray(p.bibbadge) && p.bibbadge.length > 0)?(p.bibbadge.map(p => badge2emoji[p]).join('')):('')
	let note_str = (dv.isArray(p.bibnote) && p.bibnote.length > 0)?(p.bibnote.join('\n')):('')
	let comment_str = (dv.isArray(p.bibcomment) && p.bibcomment.length > 0)?(p.bibcomment.map(p => `*(${p})`).join('\n')):('')

	if (badge_str + note_str + comment_str != '') {
		return `class ${p.bibid} {\n${badge_str}${note_str}\n${comment_str}}`
	} else {
		return `class ${p.bibid}`
	}
}

for (let p of papers) {
	commands.push(paper_node(p))
}

// parse paper branches
let branches = { papers: [] }

for (let p of papers) {
	for (let link of p.biblist) {
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
                    commands.push(`${current} -- ${p.bibid}${name_str}`)
                    current = p.bibid
                }
            } else if (mode == 'pre') {
                for (let p of sub_node) {
                    name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${p.bibid} -- ${current}${name_str}`)
                    current = p.bibid
                }
            } else {
                for (let p of sub_node.toReversed()) {
                    name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${p.bibid} .. ${current}${name_str}`)
                    current = p.bibid
                }
            }
        } else {
            if (sub_node.papers.length > 0 & node.papers.length > 0) {
                const sub_first = sub_node.papers[0]

                for (let p of node.papers) {
                    if (sub_first.year > p.year) {
                        current = p.bibid
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
const paper_ids = papers.bibid

for (let p of papers) {
    if (dv.isArray(p.biblink)) {
        for (let l of p.biblink) {
            let lid = dv.page(l).bibid

            if (paper_ids.includes(lid)) {
                if (l.subpath != null) {
                    commands.push(`${p.bibid} .. ${lid}: ${l.subpath}`)
                } else {
                    commands.push(`${p.bibid} .. ${lid}`)
                }
            }
        }
    }
}

dv.paragraph(commands.join('\n'))

// paper list
dv.header(2, 'Papers')

papers = papers.sort(item => item.bibid, 'asc')

dv.table(
	['link', 'title', 'venue'],
	papers.map(p => [p.file.link, p.title, (p.journal != null)?(p.journal):(p.booktitle)]),
)

// bibtex
dv.header(2, 'BibTex')

commands = ['```']

for (let p of papers) {
    commands.push(`@${p.bibtype}{${p.bibid},`)
    let flag = false

    for (let [key, value] of Object.entries(p)) {
        if (key == 'bibid') {
            flag = true
            continue
        }

        if (flag == true) {
            commands.push(`\t${key} = {${value}},`)
        }
    }

    commands.push('}\n')
}

dv.paragraph(commands.join('\n'))