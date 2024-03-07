const file = dv.current()

// get bibtex from doi
async function get_bibtex(doi) {
    return fetch(`https://doi.org/${doi}`, { headers: { Accept: "application/x-bibtex" }})
    .then(response => response.text())
    .catch(error => {
        console.error('Error:', error)
    })
}

const bibtex = await get_bibtex(file.doi)

// convert bibtex to yaml
dv.header(2, 'BibTeX to YAML')

async function get_citation(doi) {
	return fetch(`https://api.crossref.org/works/${doi}`)
		.then(response => response.json())
		.then(data => data['message']['is-referenced-by-count'])
		.catch(error => console.error('Error:', error))
}

async function parse_bitex(bibtexData, gen_id = false, gen_cite = false, lower_case_type = true) {
	// match type, id, & fields
	const entryRegex = /@([a-zA-Z]+){([^,]+),(.*)}/g;
	let match = entryRegex.exec(bibtexData)

	let fields = {}
	fields['type'] = match[1]

	if (gen_cite === true) {
		fields['cites'] = 0
	}

	fields['id'] = match[2]
	let fields_str = match[3]

	// parse bibtex fields
	let mode = 'key'
	let store = ''
	let max_layer = 0
	let stack = []
	let keys = []
	let values = []

	for (let [idx, char] of [...fields_str].entries()) {
		if (mode === 'key') {
			// parsing the key of a field
			if (char === '=') {
				keys.push(store.replace(/^[, ]+/, '').replace(/[, ]+$/, ''))
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

				// if the value has {} pairs, remove the outmost {
				if (max_layer === 1) {
					store = ''
				}
			} else if (char === '}') {
				stack.pop()
				
				// if the value has {} pairs, discard the outmost }
				if (stack.length === 0) {
					store = store.slice(0, -1)
				}
			}

			if ((max_layer > 0 && stack.length === 0) || (max_layer === 0 && (char === ',' || char === '}' || idx === fields_str.length - 1))) {
				// when the field has {} pairs, complete parsing when the '{' stack is empty
				// when the field has no {} layers, complete parsing when the ',' or '}' is encountered or the string ends
				value = store.replace(/^[ ]+/, '').replace(/[, ]+$/, '').replaceAll(": ", "{:} ")

				if (value[0] === '{' || value[-1] === '}') {
					value = `"${value}"`
				}

				values.push(value)
				store = ''
				max_layer = 0
				mode = 'key'
			}
		}
	}
	
	keys.map((key, idx) => { fields[key.toLowerCase()] = values[idx] })

	// if gen_id is true, generate bib_id in the format of SurnameNameYear
	if (gen_id === true) {
		if (Object.keys(fields).includes('author')) {
			// let author_idx = Object.keys(fields).indexOf('author')
			// let authors = values[author_idx].split(' and ')
			let authors = fields.author.split(' and ')
			let firstAuthor = authors[0]
			let firstName, lastName

			if (firstAuthor.includes(',')) {
				[lastName, firstName] = firstAuthor.split(',').map(s => s.trim())
			} else {
				let nameParts = firstAuthor.split(' ').map(s => s.trim())
				lastName = nameParts.pop()
				firstName = nameParts.join(' ')
			}

			fields['id'] = `${lastName}${firstName}${fields['year']}`.replace(/[^a-zA-Z0-9]/g, '')
		}
	}

	// if gen_cite is true, generate citation count
	if (gen_cite === true) {
		if (Object.keys(fields).includes('doi')) {
			fields['cites'] = await get_citation(fields['doi'])
		}
	}

	// if lower_case_type is true, convert bib_type to lower case
	if (lower_case_type === true) {
		fields['type'] = fields['type'].toLowerCase()
	}

	// temp
	const fields_to_delete = ['groups', 'comment', 'priority', 'file', 'progress'];
	fields_to_delete.forEach(field => {
		if (fields.hasOwnProperty(field)) {
			delete fields[field];
		}
	});

	return fields
}

const bibjson = await parse_bitex(bibtex, gen_id=true, gen_cite=true)

// generated bib_id
dv.paragraph(`Generated entry ID:\n\`\`\`\n${bibjson['id']}\n\`\`\``)

// yaml
dv.paragraph('The YAML format entry information:')
let commands = ['```']

for (let [key, value] of Object.entries(bibjson)) {
	commands.push(`bib_${key}: ${value}`)
}

commands.push('```')
dv.paragraph(commands.join('\n'))
