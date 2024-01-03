const file = dv.current()

// bibtex
dv.header(2, 'BibTex')

let commands = ['```', `@${file.bibtype}{${file.bibid},`]
let flag = false

for (let [key, value] of Object.entries(file)) {
	if (key == 'bibid') {
		flag = true
		continue
	}

	if (flag == true) {
		commands.push(`\t${key} = {${value}},`)
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
	let badge_str = (dv.isArray(p.bibbadge) && p.bibbadge.length > 0)?(p.bibbadge.map(p => badge2emoji[p]).join('')):('')
	let note_str = (dv.isArray(p.bibnote) && p.bibnote.length > 0)?(p.bibnote.join('\n')):('')
	let comment_str = (dv.isArray(p.bibcomment) && p.bibcomment.length > 0)?(p.bibcomment.map(p => `*(${p})`).join('\n')):('')

	if (badge_str + note_str + comment_str != '') {
		return `class ${p.bibid} {\n${badge_str}${note_str}\n${comment_str}}`
	} else {
		return `class ${p.bibid}`
	}
}

p = dv.page(file.file.link)
commands.push(paper_node(p))

if (dv.isArray(file.biblink)) {
	// find linked papers
	let paper_links = []
	paper_links.push(...file.biblink)

	for (let p of dv.pages("#Paper and [[]]")) {
		for (let l of p.biblink) {
			l.path = p.file.path
			paper_links.push(l)
		}
	}


	// draw linked papers
	for (let l of paper_links) {
		commands.push(paper_node(l))

		if (l.subpath != null) {
			commands.push(`${file.bibid} .. ${dv.page(l).bibid}: ${l.subpath}`)
		} else {
			commands.push(`${file.bibid} .. ${dv.page(l).bibid}`)
		}
	}
}

if (dv.isArray(file.biblist)) {
	// draw linked lists
	function list_node(link, list_id) {
		list = dv.page(link)
		return `class List${list_id} {\n ${list.file.name}\n}`
	}

	let id = 1

	for (let l of file.biblist) {
		commands.push(list_node(l, id))

		if (l.subpath != null) {
			commands.push(`List${id} -- ${file.bibid}: ${l.subpath}`)
		} else {
			commands.push(`List${id} -- ${file.bibid}`)
		}

		id = id + 1
	}
}

commands.push('```')
dv.paragraph(commands.join('\n'))