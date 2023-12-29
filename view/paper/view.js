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

mermaid_style = "%%{ init: { 'theme': 'base', 'themeVariables': { 'primaryTextColor': 'lightgray', 'primaryBorderColor': '#00000000', 'lineColor': 'gray', 'mainBkg': '#00000000' }}}%%"
// priminaryTextColor: text color
// primaryBorderColor: class box segment line color
// lineColor: line color of the links
// mainBkg: background color of the links' text box

commands = [`\`\`\`mermaid\n${mermaid_style}classDiagram`]

let badge2emoji = {
    'skimmed': '🪫',
    'read': '🔋',
    'seminal': '💡',
}

function paper_node(link) {
	p = dv.page(link)
	return `class ${p.bibid} {\n${dv.isArray(p.bibbadge)?(p.bibbadge.map(p => badge2emoji[p]).join('')):('')}${dv.isArray(p.bibnote)?(p.bibnote.join('\n')):('')}\n${dv.isArray(p.bibcomment)?(p.bibcomment.map(p => `*(${p})`).join('\n')):('')}}`
}

commands.push(paper_node(file.file.link))

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