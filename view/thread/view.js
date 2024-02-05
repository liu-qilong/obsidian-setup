const current_file = dv.current()
const current_tag = current_file.aliases[0].replace('#', '')
const current_name = current_file.file.name

let papers = dv.pages(`#Type/Paper and #${current_tag}`).sort(p => p.bib_year, 'asc')

// flow view
dv.header(2, 'Thread')

const mermaid_style = "%%{ init: { 'themeVariables': { 'nodeBorder': '#00000000', 'mainBkg': '#00000000' }}}%%"
// nodeBorder: class box segment line color
// mainBkg: background color of the links' text box

let commands = []
commands.push(`\`\`\`mermaid\n${mermaid_style}\nclassDiagram`)
commands.push(`class root {\n${current_name}\n#${current_tag}\n}`)

// parse paper branches
function push_nested_dict(dict, index, value) {
	let current = dict
	
	for (let id of index) {
		if (current[id] === undefined) {
			current[id] = { __items__: [] }
		}
        current = current[id]
	}

	current.__items__.push(value)
}

let branches = { __items__: [] }

for (let p of papers) {
	for (let tag of p.tags) {
		if (tag.includes(current_tag)) {
            if (tag.includes(`${current_tag}/`)) {
                // belongs to a sub tag
                let branch_index = tag.replace(`${current_tag}/`, '').split('/')
                push_nested_dict(branches, branch_index, p)
            } else {
                // belongs to the current tag
                branches.__items__.push(p)
            }
		}
	}
}

// draw branches
let id_dict = []

function draw_paper(p, id_dict, commands) {
    let badge2emoji = {
        'skimmed': '🪫',
        'read': '🔋',
        'seminal': '💡',
        'important': '📌',
        'work-well': '👍',
    }
    
	let badge_str = (dv.isArray(p.bib_badge) && p.bib_badge.length > 0)?(p.bib_badge.map(p => badge2emoji[p]).join('')):('')
	let note_str = (dv.isArray(p.bib_note) && p.bib_note.length > 0)?(p.bib_note.join('\n')):('')
	let comment_str = (dv.isArray(p.bib_remark) && p.bib_remark.length > 0)?(p.bib_remark.map(p => `*(${p})`).join('\n')):('')

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
	if (badge_str + note_str + comment_str != '') {
		commands.push(`class ${bib_id} {\n${badge_str} ${note_str}\n${comment_str}}`) 
	} else {
		commands.push(`class ${bib_id}`)
	}
    
    return bib_id
}

function draw_branch(name, node, start, mode) {
	for (let [sub_name, sub_node] of Object.entries(node)) {
        let current = start

        if (sub_name == '__items__') {
            if (mode == 'downward') {
                // draw downward branch items
                for (let p of sub_node) {
                    bib_id = draw_paper(p, id_dict, commands)
                    name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${current} -- ${bib_id}${name_str}`)
                    current = bib_id
                }
            } else if (mode == 'upward') {
                // draw upward branch items
                for (let p of sub_node.toReversed()) {
                    let bib_id = draw_paper(p, id_dict, commands)
                    let name_str = (name.length == 0)?(''):(`: ${name}`)
                    commands.push(`${bib_id} -- ${current}${name_str}`)
                    current = bib_id
                }
            }
        } else {
            if (node.__items__.length > 0 & sub_node.__items__.length > 0) {
                // if current branch and sub branch both have items
                // adjust the current drawing item to the last item in current branch
                // that are published before the first item in sub branch
                // if none, then set as the first item in current branch
                current = node.__items__[0].bib_id
                const sub_first = sub_node.__items__[0]

                for (let p of node.__items__) {
                    if (sub_first.bib_year > p.bib_year) {
                        current = p.bib_id
                    }
                }
            }
            else if (node.__items__.length === 0) {
                // if current branch doesn't have items
                // combine current branch name to sub branch name
                sub_name = (name != '')?(`${name}/${sub_name}`):(sub_name)
            }
            
            if (sub_name.startsWith('pre-')) {
                // if sub branch name contains 'pre-', set drawing mode as upward
                draw_branch(sub_name, sub_node, current, 'upward')
            } else {
                // otherwise, pass current mode to the next level
                draw_branch(sub_name, sub_node, current, mode)
            }
        }
	}
}

draw_branch('', branches, 'root', 'downward')
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