const file = dv.current()

// doi2bib website
dv.header(2, 'DOI to BibTeX')

dv.paragraph('Enter the `doi` to the note property pane and then copy the retrived BibTeX to the `bibtex` property:')

if (file.doi != null) {
	dv.paragraph(`<iframe src="https://www.doi2bib.org/bib/${file.doi}" width=100% height=300/>`)
} else {
	dv.paragraph('```\nplease fill the doi field\n```\n')
}

// convert bibtex to yaml
dv.header(2, 'BibTeX to YAML')

function parse_bitex(bibtexData, gen_id = false, lower_case_type = true) {

	// match bib_type, bib_id, & fields
	const entryRegex = /@([a-zA-Z]+){([^,]+),(.*)}/g;
	let match = entryRegex.exec(bibtexData)

	let fields = {}
	fields['bib_type'] = match[1]
	fields['bib_id'] = match[2]
	let fields_str = match[3]

	// parse bibtex fields
	let mode = 'key'
	let store = ''
	let max_layer = 0
	let stack = []
	let keys = []
	let values = []
	const head_trim = /^[,={} ]+/
	const trail_trim = /[,={} ]+$/

	for (let [idx, char] of [...fields_str].entries()) {
		if (mode === 'key') {
			// parsing the key of a field
			if (char === '=') {
				keys.push(store.replace(head_trim, '').replace(trail_trim, ''))
				store = ''
				mode = 'value'
			} else {
				store += char
			}
		} else if (mode === 'value') {
			// parsing the value of a field
			store += char

			if (char === '{') {
				stack.push(char)
				max_layer += 1
			} else if (char === '}') {
				stack.pop()
			}

			if ((max_layer > 0 && stack.length === 0) || (max_layer === 0 && (char === ',' || char === '}' || idx === fields_str.length - 1))) {
				// when the field has {} pairs, complete parsing when the '{' stack is empty
				// when the field has no {} layers, complete parsing when the ',' or '}' is encountered or the string ends
				values.push(store.replace(head_trim, '').replace(trail_trim, '').replace(": ", "{:}"))
				store = ''
				max_layer = 0
				mode = 'key'
			}
		}
	}
	
	keys.map((key, idx) => { fields[`bib_${key.toLowerCase()}`] = values[idx] })

	// if gen_id is true, generate bib_id in the format of SurnameNameYear
	if (gen_id === true) {
		if (keys.includes('bib_author')) {
			let authorIndex = keys.indexOf('bib_author')
			let authors = values[authorIndex].split(' and ')
			let firstAuthor = authors[0]
			let firstName, lastName

			if (firstAuthor.includes(',')) {
				[lastName, firstName] = firstAuthor.split(',').map(s => s.trim())
			} else {
				let nameParts = firstAuthor.split(' ').map(s => s.trim())
				lastName = nameParts.pop()
				firstName = nameParts.join(' ')
			}

			fields['bib_id'] = `${lastName}${firstName}${fields['year']}`.replace(/[^a-zA-Z0-9]/g, '')
			console.log(fields['bib_id'])
		}
	}

	// if lower_case_type is true, convert bib_type to lower case
	if (lower_case_type === true) {
		fields['bib_type'] = fields['bib_type'].toLowerCase()
	}

	// temp
	const fieldsToDelete = ['bib_groups', 'bib_comment', 'bib_priority', 'bib_file', 'bib_progress'];
	fieldsToDelete.forEach(field => {
		if (fields.hasOwnProperty(field)) {
			delete fields[field];
		}
	});

	return fields
}

if (file.bibtex != null) {
	const bibtex = file.bibtex
	const bibjson = parse_bitex(bibtex, gen_id = true)

	// generated bib_id
	dv.paragraph(`Generated entry ID:\n\`\`\`\n${bibjson['bib_id']}\n\`\`\``)

	// yaml
	dv.paragraph('The YAML format entry information:')
	let commands = ['```']

	for (let [key, value] of Object.entries(bibjson)) {
		commands.push(`${key}: ${value}`)
	}

	commands.push('```')
	dv.paragraph(commands.join('\n'))
} else {
	dv.paragraph('```\nplease fill the bibtex field\n```\n')
}
