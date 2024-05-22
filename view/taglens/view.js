const {TagLens} = await cJS()
const {PaperThread} = await cJS()

let current_name = dv.current().file.name
let current_tag
let query_str

try {
    if (dv.current().aliases[0][0] === '#') {
        current_tag = dv.current().aliases[0].replace('#', '')
        query_str = `(#${current_tag} or [[]])`
    }
} catch (err) {
    current_tag = null
    query_str = '[[]]'
}

// tagged/linked pages separated by type
for (let tag_name of Object.keys(TagLens.tag_dict)) {
    let show_name = TagLens.tag_dict[tag_name]['show_name']
    let show_vars = TagLens.tag_dict[tag_name]['show_vars']
    let pages = dv.pages(`#${tag_name} and ${query_str}`)

    TagLens.show_related(dv, show_name, show_vars, pages, PaperThread)
}

// tagged/linked mentions in diary notes
let thoughts = dv.pages(`#Type/Diary and ${query_str}`).file.lists
    .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
    .sort(ls => dv.date(ls.link), 'desc')
    
if (thoughts.length > 0) {
    dv.header(2, 'Thoughts 💡')
    dv.table(
        ['link', 'text'],
        thoughts.map(ls => {
            const date = dv.date(dv.page(ls.link).date)
            ls.link.display = `${date.monthLong} ${date.day}, ${date.year}`
            return [ls.link, ls.text]
        })
    )
}