const {PaperThread} = await cJS()
const {TagLens} = await cJS()
PaperThread.set_up(dv, TagLens)
TagLens.set_up(dv, PaperThread)

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

    TagLens.show_related(show_name, show_vars, pages)
}

// tagged/linked mentions in diary notes
let thoughts = dv.pages(`#Type/Diary and ${query_str}`).file.lists
    .where(ls => (!ls.task & (ls.text.includes(current_name) | ls.text.includes(current_tag))))
    .sort(ls => dv.date(ls.link), 'desc')
    
TagLens.show_thoughts(thoughts)