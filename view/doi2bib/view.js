const file = dv.current()

// doi2bib website
dv.header(2, 'DOI to BibTeX')

dv.paragraph('Enter the `doi` to the note property pane and then copy the retrived BibTeX to the `bibtex` property.')

if (file.doi != null) {
	dv.paragraph(`<iframe src="https://www.doi2bib.org/bib/${file.doi}" width=100% height=300/>`)
} else {
	dv.paragraph('```\nplease fill the doi field\n```\n')
}

// convert bibtex to yaml
dv.header(2, 'BibTeX to YAML')

dv.paragraph('The YAML format entry information should be shown as follows.')

function parse_bitex(bibtexData) {

	// match bibtype, bibid, & fields
	const entryRegex = /@([a-zA-Z]+){([^,]+),(.*)}/g;
	let match = entryRegex.exec(bibtexData)

	let fields = {}
	fields['bibtype'] = match[1]
	fields['bibid'] = match[2]
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

			if (max_layer > 0 && stack.length === 0) {
				// when the field has {} layers, complete parsing when the { stack is empty
				values.push(store.replace(head_trim, '').replace(trail_trim, '').replace(':', '{:}'))
				store = ''
				max_layer = 0
				mode = 'key'
			} else if (max_layer === 0 && (char === ',' || char === '}' || idx === fields_str.length - 1)) {
				// when the field has no {} layers, complete parsing when the ,/} is encountered or the string ends
				values.push(store.replace(head_trim, '').replace(trail_trim, '').replace(':', '{:}'))
				store = ''
				mode = 'key'
			}
		}
	}
	
	keys.map((key, idx) => { fields[key] = values[idx] })
	return fields
}

if (file.bibtex != null) {
	const bibtex = file.bibtex
	const bibjson = parse_bitex(bibtex)
	let commands = ['```']

	for (let [key, value] of Object.entries(bibjson)) {
		commands.push(`${key}: ${value}`)
	}

	commands.push('```')
	dv.paragraph(commands.join('\n'))
} else {
	dv.paragraph('```\nplease fill the bibtex field\n```\n')
}
