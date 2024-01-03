const file = dv.current()

// bibtex
dv.header(2, 'BibTex')

let commands = ['```', `@${file.bib_type}{${file.bib_id},`]
let flag = false

for (let [key, value] of Object.entries(file)) {
	if (key == 'bib_id') {
		flag = true
		continue
	}

	if (flag == true && key.includes('bib_')) {
		commands.push(`\t${key.replace('bib_', '')} = {${value}},`)
	}
}

commands.push('}', '```')

dv.paragraph(commands.join('\n'))

// flow
dv.header(2, 'Flow')

mermaid_style = "%%{ init: { 'themeVariables': { 'nodeBorder': '#00000000', 'mainBkg': '#00000000' }}}%%"
// nodeBorder: class box segment line color
// mainBkg: background color of the links' text box

commands = [`\`\`\`mermaid\n${mermaid_style}\nclassDiagram`]

let badge2emoji = {
    'skimmed': '🪫',
    'read': '🔋',
    'seminal': '💡',
}

function paper_node(p) {
	let badge_str = (dv.isArray(p.bib_badge) && p.bib_badge.length > 0)?(p.bib_badge.map(p => badge2emoji[p]).join('')):('')
	let note_str = (dv.isArray(p.bib_note) && p.bib_note.length > 0)?(p.bib_note.join('\n')):('')
	let comment_str = (dv.isArray(p.bib_remark) && p.bib_remark.length > 0)?(p.bib_remark.map(p => `*(${p})`).join('\n')):('')

	if (badge_str + note_str + comment_str != '') {
		return `class ${p.bib_id} {\n${badge_str}${note_str}\n${comment_str}}`
	} else {
		return `class ${p.bib_id}`
	}
}

p = dv.page(file.file.link)
commands.push(paper_node(p))

if (dv.isArray(file.bib_link)) {
	// find linked papers
	let paper_links = []
	paper_links.push(...file.bib_link)

	for (let p of dv.pages("#Paper and [[]]")) {
		for (let l of p.bib_link) {
			l.path = p.file.path
			paper_links.push(l)
		}
	}

	// draw linked papers
	for (let l of paper_links) {
		commands.push(paper_node(l))

		if (l.subpath != null) {
			commands.push(`${file.bib_id} .. ${dv.page(l).bib_id}: ${l.subpath}`)
		} else {
			commands.push(`${file.bib_id} .. ${dv.page(l).bib_id}`)
		}
	}
}

if (dv.isArray(file.bib_list)) {
	// draw linked lists
	function list_node(link, list_id) {
		list = dv.page(link)
		return `class List${list_id} {\n ${list.file.name}\n}`
	}

	let id = 1

	for (let l of file.bib_list) {
		commands.push(list_node(l, id))

		if (l.subpath != null) {
			commands.push(`List${id} -- ${file.bib_id}: ${l.subpath}`)
		} else {
			commands.push(`List${id} -- ${file.bib_id}`)
		}

		id = id + 1
	}
}

commands.push('```')
dv.paragraph(commands.join('\n'))