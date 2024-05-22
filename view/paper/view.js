const {PaperThread} = await cJS()

const current_file = dv.current()
const current_name = dv.current().file.name

// check consistency between bib_id and file name
if (current_file.bib_id != current_name) {
	dv.header(2, '==Warning==')
	dv.paragraph(`bib_id \`${current_file.bib_id}\` is different from file name \`${current_name}\`.`)
}

// thread view
dv.header(2, 'Thread')

let commands = [`\`\`\`mermaid\n${PaperThread.mermaid_style}\nclassDiagram`]
let id_dict = []

// draw current paper
PaperThread.paper_node(dv, current_file, id_dict, commands)

// draw linked papers
function draw_link(l, p_origin, p_target) {
	if (l.subpath != null) {
		if (l.subpath == 'related') {
			commands.push(`${p_origin.bib_id} <..> ${p_target.bib_id}: ${l.subpath}`)
		} else {
			commands.push(`${p_origin.bib_id} ..> ${p_target.bib_id}: ${l.subpath}`)
		}
	} else {
		commands.push(`${p_origin.bib_id} ..> ${p_target.bib_id}`)
	}
}

if (dv.isArray(current_file.bib_link)) {
	for (let l of current_file.bib_link) {
		PaperThread.paper_node(dv, dv.page(l), id_dict, commands)
		draw_link(l, dv.page(l), current_file)
	}
}

for (p of dv.pages('#Type/Paper and [[]]')) {
	// search all inward linked papers
	if (dv.isArray(p.bib_link)) {
		for (let l of p.bib_link) {
			// go through these papers bib_link
			if (dv.page(l).bib_id === current_file.bib_id) {
				// find  the entries that link to the current paper and draw paper links 
				PaperThread.paper_node(dv, p, id_dict, commands)
				draw_link(l, current_file, p)
			}
		}
	}
}

// parse nested threads
let threads = {}

for (let tag of current_file.tags) {
	if (tag.split('/')[0] === 'Thread') {
		PaperThread.setup_nested_dict(threads, tag.split('/'))
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
		commands.push(`${thread_id_dict[tag]} -- ${current_file.bib_id}`)
	}
}

commands.push('```')
dv.paragraph(commands.join('\n'))

// bibtex
dv.header(2, 'BibTex')

commands = ['```']
PaperThread.paper_bibtex(current_file, commands)
dv.paragraph(commands.join('\n'))

// check updates of citations counts
if (Object.keys(current_file).includes('bib_doi')) {
	dv.header(2, 'Cites')

	let cites = await PaperThread.get_cites(current_file.bib_doi)
	
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