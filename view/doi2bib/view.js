const file = dv.current()

// get bibtex from doi
async function get_bibtex(doi) {
    const url = `https://doi.org/${doi}`

    return fetch(url, {
        headers: {
            Accept: "application/x-bibtex",
        },
    })
    .then(response => response.text())
    .catch(error => {
        console.error('Error:', error)
    })
}

const bibtex = await get_bibtex(file.doi)

// convert bibtex to yaml
dv.header(2, 'BibTeX to YAML')

function parse_bitex(bibtexData, gen_id = false, lower_case_type = true) {
	// match type, id, & fields
	const entryRegex = /@([a-zA-Z]+){([^,]+),(.*)}/g;
	let match = entryRegex.exec(bibtexData)

	let fields = {}
	fields['type'] = match[1]
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
		if (keys.includes('author')) {
			let authorIndex = keys.indexOf('author')
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

			fields['id'] = `${lastName}${firstName}${fields['year']}`.replace(/[^a-zA-Z0-9]/g, '')
		}
	}

	// if lower_case_type is true, convert bib_type to lower case
	if (lower_case_type === true) {
		fields['type'] = fields['type'].toLowerCase()
	}

	// temp
	const fieldsToDelete = ['groups', 'comment', 'priority', 'file', 'progress'];
	fieldsToDelete.forEach(field => {
		if (fields.hasOwnProperty(field)) {
			delete fields[field];
		}
	});

	return fields
}

const bibjson = parse_bitex(bibtex, gen_id = true)

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
