const {TagLens} = await cJS()
const {PaperThread} = await cJS()
TagLens.set_up(dv, PaperThread)
PaperThread.set_up(dv, TagLens)

const current_file = dv.current()
const current_name = dv.current().file.name

// choose page fit or scroll
if (current_file.scroll) {
    dv.container.classList.add("page_scroll_class")
} else {
    dv.container.classList.add("page_fit_class")
}

// check consistency between bib_id and file name
if (current_file.bib_id != current_name) {
	dv.header(2, '==Warning==')
	dv.paragraph(`bib_id \`${current_file.bib_id}\` is different from file name \`${current_name}\`.`)
}

// thread view
class ThreadView {
	constructor(current_file, current_name) {
		this.current_file = current_file
		this.current_name = current_name
		this.commands = []
		this.id_dict = {}
		this.threads = {}

		this.head()
		this.draw_current_paper()
		this.draw_linked_papers()
		this.draw_linked_threads()
		this.end()
	}

	head() {
		dv.header(2, `Thread`)
	}

	draw_current_paper() {
		this.commands.push(`\`\`\`mermaid\nflowchart TD`)
		PaperThread.paper_node(this.current_file, this.id_dict, this.commands)
	}

	draw_linked_papers() {
		function draw_link(obj, l, p_origin, p_target) {
			if (l.subpath != null) {
				if (l.subpath == 'related') {
					obj.commands.push(`${p_origin.bib_id} <-..-> |${l.subpath}| ${p_target.bib_id}`)
				} else {
					obj.commands.push(`${p_origin.bib_id} -..-> |${l.subpath}| ${p_target.bib_id}`)
				}
			} else {
				obj.commands.push(`${p_origin.bib_id} -..-> ${p_target.bib_id}`)
			}
		}

		// from current paper to linked papers
		if (dv.isArray(this.current_file.bib_link)) {
			for (let l of this.current_file.bib_link) {
				PaperThread.paper_node(dv.page(l), this.id_dict, this.commands)
				draw_link(this, l, dv.page(l), this.current_file)
			}
		}

		// from linked papers to current paper
		for (let p of dv.pages('#Type/Paper and [[]]')) {
			// search all inward linked papers
			if (dv.isArray(p.bib_link)) {
				for (let l of p.bib_link) {
					// go through these papers bib_link
					if (dv.page(l).bib_id === this.current_file.bib_id) {
						// find  the entries that link to the current paper and draw paper links 
						PaperThread.paper_node(p, this.id_dict, this.commands)
						draw_link(this, l, this.current_file, p)
					}
				}
			}
		}
	}

	draw_linked_threads() {
		// parse nested threads
		for (let tag of this.current_file.tags) {
			if (tag.split('/')[0] === 'Thread') {
				PaperThread.setup_nested_dict(this.threads, tag.split('/'))
			}
		}

		// draw nested threads
		let thread_id_dict = {}

		function recursive_draw(obj, tag, node, source_tag) {
			if (Object.keys(node).length === 1) {
				// the current node only has 1 child
				let sub_tag = Object.keys(node)[0]
				let sub_node = Object.values(node)[0]
				let pre_str = (tag != '')?(`${tag}/`):('')
				recursive_draw(obj, `${pre_str}${sub_tag}`, sub_node, source_tag)
			} else {
				// the current node is a leaf node or have multiple children
				PaperThread.thread_node(tag, source_tag, thread_id_dict, obj.commands)

				for (let [sub_tag, sub_node] of Object.entries(node)) {
					let pre_str = (tag != '')?(`${tag}/`):('')
					recursive_draw(obj, `${pre_str}${sub_tag}`, sub_node, tag)
				}
			}
		}

		// recursively draw threads
		if (Object.keys(this.threads).length > 0) {
			recursive_draw(this, '', this.threads, '')
		}

		// draw links to threads
		for (let tag of current_file.tags) {
			if (tag.split('/')[0] === 'Thread') {
				this.commands.push(`${thread_id_dict[tag]} ---> ${current_file.bib_id}`)
			}
		}
	}

	end() {
		this.commands.push('```')
		dv.paragraph(this.commands.join('\n'))
	}
}

new ThreadView(current_file, current_name)

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