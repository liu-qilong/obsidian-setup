const current_file = dv.current()
const current_name = dv.current().file.name

// bibtex
dv.header(2, 'BibTex')

let commands = ['```', `@${current_file.bib_type}{${current_file.bib_id},`]
let flag = false

for (let [key, value] of Object.entries(current_file)) {
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

// thread view
dv.header(2, 'Thread')

const mermaid_style = "%%{ init: { 'themeVariables': { 'nodeBorder': '#00000000', 'mainBkg': '#00000000' }}}%%"
// nodeBorder: class box segment line color
// mainBkg: background color of the links' text box

commands = [`\`\`\`mermaid\n${mermaid_style}\nclassDiagram`]

function paper_node(p, commands) {
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

	if (badge_str + note_str + comment_str != '') {
		commands.push(`class ${p.bib_id} {\n${badge_str} ${note_str}\n${comment_str}}`)
	} else {
		commands.push(`class ${p.bib_id}`)
	}
}

// draw current paper
paper_node(current_file, commands)

// draw linked papers
if (dv.isArray(current_file.bib_link)) {
	let paper_links = []
	paper_links.push(...current_file.bib_link)

	for (let l of paper_links) {
		paper_node(dv.page(l), commands)

		if (l.subpath != null) {
			commands.push(`${current_file.bib_id} .. ${dv.page(l).bib_id}: ${l.subpath}`)
		} else {
			commands.push(`${current_file.bib_id} .. ${dv.page(l).bib_id}`)
		}
	}
}

// parse nested threads
function setup_nested_dict(dict, index) {
	let current = dict
	
	for (let id of index) {
		if (current[id] === undefined) {
			current[id] = {}
		}
        current = current[id]
	}
}

let threads = {}

for (let tag of current_file.tags) {
	if (tag.split('/')[0] === 'Thread') {
		setup_nested_dict(threads, tag.split('/'))
	}
}

// draw nested threads
let thread_id_dict = {}
let thread_ls = dv.pages('#Type/Thread')

function thread_node(tag, source_tag, commands) {
	let thread_title = `#${tag}`
	let thread_id = `List-${Object.keys(thread_id_dict).length + 1}`
	thread_id_dict[tag] = thread_id

	for (let thread of thread_ls) {
		if (thread.file.aliases[0] === `#${tag}`) {
			thread_title = thread.file.name
			break
		}
	}

	if (source_tag != '') {
		commands.push(`class ${thread_id} {\n${thread_title}\n}`)
		let branch_tag = tag.replace(`${source_tag}/`, '')

		if (branch_tag.startsWith('pre-')) {
			commands.push(`${thread_id} -- ${thread_id_dict[source_tag]}: ${branch_tag}`)
		} else {
			commands.push(`${thread_id_dict[source_tag]} -- ${thread_id}: ${branch_tag}`)
		}
	} else {
		commands.push(`class ${thread_id} {\n${thread_title}\n#${tag}\n}`)
	}
}

function draw_threads(tag, node, source_tag) {
	if (Object.keys(node).length === 1) {
		// the current node only has 1 child
		let sub_tag = Object.keys(node)[0]
		let sub_node = Object.values(node)[0]
		let pre_str = (tag != '')?(`${tag}/`):('')
		draw_threads(`${pre_str}${sub_tag}`, sub_node, source_tag)
	} else {
		// the current node is a leaf node or have multiple children
		thread_node(tag, source_tag, commands)

		for (let [sub_tag, sub_node] of Object.entries(node)) {
			pre_str = (tag != '')?(`${tag}/`):('')
			draw_threads(`${pre_str}${sub_tag}`, sub_node, tag)
		}
	}
}

draw_threads('', threads, '')

// draw links to threads
for (let tag of current_file.tags) {
	if (tag.split('/')[0] === 'Thread') {
		commands.push(`${thread_id_dict[tag]} .. ${current_name}`)
	}
}

commands.push('```')
dv.paragraph(commands.join('\n'))