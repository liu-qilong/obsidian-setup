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

function parseBibTeX(bibtexData) {
	const entries = [];
	const entryRegex = /@([a-zA-Z]+){([^,]+),(.*)}/g;
	
	let match = entryRegex.exec(bibtexData)
	const bibtype = match[1]
	const bibid = match[2]
	const fields = match[3].split(',  ')
	
	const entry = {
	  bibtype,
	  bibid,
	}
	
	fields.forEach((field) => {
		const [name, value] = field.split('=')
		
		if (value.trim()[0] == '{') {
			entry[name.trim()] = value.trim().slice(1, -1)
		} else {
			entry[name.trim()] = value.trim()
		}
	})
	
	return entry
}

if (file.bibtex != null) {
	const bibtex = file.bibtex
	const bibjson = parseBibTeX(bibtex)
	let commands = ['```']

	for (let [key, value] of Object.entries(bibjson)) {
		commands.push(`${key}: ${value}`)
	}

	commands.push('```')
	dv.paragraph(commands.join('\n'))
} else {
	dv.paragraph('```\nplease fill the bibtex field\n```\n')
}