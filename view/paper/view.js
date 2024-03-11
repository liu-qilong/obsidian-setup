const current_file = dv.current()
const current_name = dv.current().file.name

// check consistency between bib_id and file name
if (current_file.bib_id != current_name) {
	dv.header(2, '==Warning==')
	dv.paragraph(`bib_id \`${current_file.bib_id}\` is different from file name \`${current_name}\`.`)
}

// thread view
dv.header(2, 'Thread')

const mermaid_style = "%%{ init: { 'themeVariables': { 'nodeBorder': '#00000000', 'mainBkg': '#00000000' }}}%%"
// nodeBorder: class box segment line color
// mainBkg: background color of the links' text box

let commands = [`\`\`\`mermaid\n${mermaid_style}\nclassDiagram`]

function to_short_num(num) {
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

let badge2emoji = {
	'skimmed': '🪫',
	'read': '🔋',
	'seminal': '💡',
	'important': '📌',
	'work-well': '👍',
	'insightful': '🧠',
}

function paper_node(p, commands) {
	let badge_str = (dv.isArray(p.bib_badge) && p.bib_badge.length > 0)?(p.bib_badge.map(p => badge2emoji[p]).join('')):('')
	let cite_str = (p.bib_cites != null)?(`[${to_short_num(p.bib_cites)}]`):('')
	let note_str = (dv.isArray(p.bib_note) && p.bib_note.length > 0)?(p.bib_note.join('\n')):('')
	let comment_str = (dv.isArray(p.bib_remark) && p.bib_remark.length > 0)?(p.bib_remark.map(p => `*(${p})`).join('\n')):('')

	if (badge_str + cite_str + note_str + comment_str != '') {
		commands.push(`class ${p.bib_id} {\n${badge_str} ${cite_str}\n${note_str}\n${comment_str}}`)
	} else {
		commands.push(`class ${p.bib_id}`)
	}
}

// draw current paper
paper_node(current_file, commands)

// draw linked papers
function draw_link(l, p_origin, p_target) {
	if (l.subpath != null) {
		if (l.subpath == 'related') {
			commands.push(`${p_origin.bib_id} <..> ${p_target.bib_id}: ${l.subpath}`)
		} else {
			commands.push(`${p_origin.bib_id} <.. ${p_target.bib_id}: ${l.subpath}`)
		}
	} else {
		commands.push(`${p_origin.bib_id} <.. ${p_target.bib_id}`)
	}
}

if (dv.isArray(current_file.bib_link)) {
	for (let l of current_file.bib_link) {
		paper_node(dv.page(l), commands)
		draw_link(l, current_file, dv.page(l))
	}
}

for (p of dv.pages('#Type/Paper and [[]]')) {
	// search all inward linked papers
	if (dv.isArray(p.bib_link)) {
		for (let l of p.bib_link) {
			// go through these papers bib_link
			if (dv.page(l).bib_id === current_file.bib_id) {
				// find  the entries that link to the current paper and draw paper links 
				paper_node(p, commands)
				draw_link(l, current_file, p)
			}
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
	let thread_id = `List-${Object.keys(thread_id_dict).length + 1}`
	thread_id_dict[tag] = thread_id

	// search for thread title
	let thread_title = ''

	for (let thread of thread_ls) {
		if (thread.file.aliases[0] === `#${tag}`) {
			thread_title = thread.file.name
			break
		}
	}

	// draw thread node
	commands.push(`class ${thread_id} {\n${(thread_title != '')?(`${thread_title}\n`):('')}#${tag}\n}`)

	if (source_tag != '') {
		let branch_tag = tag.replace(`${source_tag}/`, '')

		if (branch_tag.startsWith('pre-')) {
			commands.push(`${thread_id} -- ${thread_id_dict[source_tag]}: ${branch_tag}`)
		} else {
			commands.push(`${thread_id_dict[source_tag]} -- ${thread_id}: ${branch_tag}`)
		}
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

if (Object.keys(threads).length > 0) {
	draw_threads('', threads, '')
}

// draw links to threads
for (let tag of current_file.tags) {
	if (tag.split('/')[0] === 'Thread') {
		commands.push(`${thread_id_dict[tag]} .. ${current_file.bib_id}`)
	}
}

commands.push('```')
dv.paragraph(commands.join('\n'))

// bibtex
dv.header(2, 'BibTex')

commands = ['```', `@${current_file.bib_type}{${current_file.bib_id},`]
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

// check updates of citations counts
async function get_cites(doi) {
	return fetch(`https://api.crossref.org/works/${doi}`)
		.then(response => response.json())
		.then(data => data['message']['is-referenced-by-count'])
		.catch(error => console.error('Error:', error))
}

if (Object.keys(current_file).includes('bib_doi')) {
	dv.header(2, 'Cites')

	let cites = await get_cites(current_file.bib_doi)
	
	if (Object.keys(current_file).includes('bib_cites')) {
		dv.paragraph('Citation counts:')
		dv.paragraph(`\`\`\`\n${current_file.bib_cites}\n\`\`\``)

		if (cites != current_file.bib_cites) {
			dv.paragraph('==Citation counts updated==:')
			dv.paragraph(`\`\`\`\n${cites}\n\`\`\``)
		}
	} else {
		dv.paragraph('==The `bib_cites` properties haven\'t been created:==')
		dv.paragraph(`\`\`\`\nbib_cites: ${cites}\n\`\`\``)
	}

	dv.paragraph(`The ciation number is retrieved from [CrossRef API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/a-non-technical-introduction-to-our-api/) or [Google Scholar](https://scholar.google.com).`)
}