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
commands = ['```mermaid\nclassDiagram']

function paper_node(link) {
	paper = dv.page(link)
	return `class ${paper.bibid} {\n ${paper.bibnote.join('\n')}\n ${dv.isArray(paper.bibremark)?(paper.bibremark.map(p => `(${p})`).join('\n')):('')}\n}`
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