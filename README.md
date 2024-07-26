<!-- from obsidian to github markdown: -->
<!-- replace ![[ as ![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/ -->
<!-- replace .png) as .png) -->

# My [Obsidian](https://obsidian.md) setup

_P.S. For readability, click the [menu icon](https://github.blog/changelog/2021-04-13-table-of-contents-support-in-markdown-files/) on the top-left corner to see the table of contents._

## Introduction

I use [Obsidian](https://obsidian.md) as my major note-taking tool. This repository stores my customized [Dataview](https://github.com/blacksmithgu/obsidian-dataview) templates.

### PaperThread

A light-weight literature management tool that visualizes papers' relations as threads:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/paper-thread.png)

The mainstream literature management software, e.g. [Zotero](https://www.zotero.org), [Mendeley](https://www.mendeley.com), and [JabRef](https://www.jabref.org), typically adopts a _folder-based_ organization paradigm. However, when a paper is added to a large folder, it's hard to recall the relationships between papers. It could be a problem to find a _specific_ paper later since their titles usually don't reflect their _core idea_ in a sufficiently compact way.

What if we can see the trending & branching of a research topic at a glance? That's the major motivation for me to develop `PapetThread`, a lightweight literature management tool based on [Obsidian](https://obsidian.md).

### TagLens

Show related notes in different types:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/taglens.png)

### DailyLens

Benchmarks my time-spending, task completions, and other activities:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/dailylens.png)

## Get started

### Open the example vault

Download and install [Obsidian](https://obsidian.md). Download the example vault from the `Releases` of this repository. It should be a folder `obsidian-setup-example`. Open [Obsidian], click `Open folder as vault`, and select the downloaded folder. Click `Trust author and enable plugins`.

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/open-valut.png)

_P.S. If you don't see `Open folder as vault`, follow the instructions on [Create vault from an existing folder](https://help.obsidian.md/Files+and+folders/Manage+vaults#Create+vault+from+an+existing+folder)._

### TagLens

#### Create container note

Right-click any `container/*` folder and click `New note` to create a container note. Then you need to edit the `aliases` [property](https://help.obsidian.md/Editing+and+formatting/Properties) as a tag name associated with this note. For example, you can create a new _topic note_ under the `container/topic` folder titled `AI` and change its `aliases` [property](https://help.obsidian.md/Editing+and+formatting/Properties) as `Topic/AI`.

_P.S. Multi-layer tag name is supported. e.g. `Topic/AI/CNN/R-CNN`_.

_P.S. You can see a new tag `Topic/AI` appears in the tag plane in the right [sidebar](https://help.obsidian.md/User+interface/Sidebar). `Option` + click on it will open the `AI` note._

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/taglens-container-page.png)

#### Tag a note to a container note

Here comes the magic. Adding a new tag to a note's `tags` fields will make this note appear in the tag's note. For example, create a note under the `content/note` with titled `What is AI?`. You can add the tag `Topic/AI` to it, and then it will appear on the `AI` container note page.

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/taglens-add-tag.png)

#### Backlink a note to a container note

Another way to show a note on the container note page is [backlinks](https://help.obsidian.md/Plugins/Backlinks). For example, create a note in `content/book` titled `AI Book` and add a line `This book is about [[AI]].`. This note will appear on the `AI` container note page.

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/taglens-add-link.png)

_P.S. If the `AI` page doesn't change, press `cmd`+`E` (on macOS) or `ctrl` + `E` (on Windows) twice to refresh._

### DailyLens

#### Diary page

Open the right [sidebar](https://help.obsidian.md/User+interface/Sidebar) of Obsidian and click the calendar icon to shift to the calendar view. Click on a date. Confirm to create a diary page for this day by clicking the `Create` button. Then you will see the notes created this day automatically appear:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/dailylens-diary-page.png)

##### Daily thoughts

Under the `Thoughts` section, add bullet points to write brief thoughts. Tag it with a tag, e.g. `Topic/AI`, which will make it appears on that container page:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/dailylens-diary-thought.png)

##### Tasks completed

On any note, such as the AI topic, page, you can add a task like this:

```
- [ ] Read about AI
```

You can add a completion date to this task to make it appear in the `Completed` section of the diary pages.

```
- [x] Read about AI
      [complete::2024-07-22]
```

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/dailylens-task-completion.png)

_P.S. It will also be shown automatically on the associated weekly/quarterly pages._

##### Time spent

You may have noticed that the diary note has several [property](https://help.obsidian.md/Editing+and+formatting/Properties) fields in the format of `time_*`. They are used to log _time statistics_, which are then used to generate the _time spend chart_:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/dailylens-time-spent.png)

You can feel free to change the name and the number of these fields as long as they are in the format of `time_*`. You may edit the diary page format `obsidian-setup/templates/diary page.md` to make such changes reusable.

#### Weekly page

Click the week number on the calendar view and confirm to create a week page for this week by clicking the `Create` button. You will see all notes, thoughts, and completed tasks, as well as the time statistics during this week appears.

#### Quarter page

In the folder pane, right-click the `review/quarter` folder and click `New note` to create a quarter note. Title it as something like `2024-Q3` and fill in the `year` and `quarter` fields. Then you will see all notes, thoughts, completed tasks, as well as the time statistics during this quarter appear.

### PaperThread

#### Thread page

Right-click on the `container/thread` folder and click `New note` to create a _thread note_. Then you need to edit the `aliases` [property](https://help.obsidian.md/Editing+and+formatting/Properties) as a tag name associated with this note. For example, you can create a new note titled `AI papers` and change its `aliases` [property](https://help.obsidian.md/Editing+and+formatting/Properties) to `Thread/AI`.

_P.S. Multi-layer tag name is supported. e.g. `Topic/AI/CNN/R-CNN`_.

_P.S. You can see a new tag `Topic/AI` appears in the tag plane in the right [sidebar](https://help.obsidian.md/User+interface/Sidebar). `Option` + click on it will open the `AI` note._

#### Paper page

##### Get metadata

Open `material/doi2bib`, you can gather the metadata of a paper from its [DOI](https://www.doi.org):

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/paper-thread-doi2bib.png)

_P.S. If it fails to gather meta online, you can input the `bibtex` and `cites` (citation number) to the [property](https://help.obsidian.md/Editing+and+formatting/Properties) fields manually._

_P.S. If nothing is shown, you can press `cmd + P` (on macOS) or `ctrl + P` (on Windows) to raise the [command palette](https://help.obsidian.md/Plugins/Command+palette) and insert `Reload without saving`._

##### Create a paper page

Right-click on the `content/paper` folder and click `New note` to create a _paper note_. Change the title of this note as the `Generated entry ID`, and then copy `The YAML format entry information` and insert them to the end of the [property](https://help.obsidian.md/Editing+and+formatting/Properties) fields.

```
---
aliases: 
tags:
  - Type/Paper
  - Thread/AI
date: 2024-07-26
update: 
bib_link: 
bib_badge: 
bib_note: 
bib_remark: 
bib_pdf: 
bib_cites: 0
bib_type: article
bib_id: ZhangLiYing2024
bib_title: Prediction of Dynamic Plantar Pressure From Insole Intervention for Diabetic Patients Based on Patch-Based Multilayer Perceptron With Localization Embedding
bib_volume: 12
bib_issn: 2169-3536
bib_url: http://dx.doi.org/10.1109/ACCESS.2024.3425907
bib_doi: 10.1109/access.2024.3425907
bib_journal: IEEE Access
bib_publisher: Institute of Electrical and Electronics Engineers (IEEE)
bib_author: Zhang, Li-Ying and Ma, Ze-Qi and Yick, Kit-Lun and Li, Pui-Ling and Yip, Joanne and Ng, Sun-Pui and Liu, Qi-Long
bib_year: 2024
bib_pages: 100355–100365
---
```

_P.S. It's recommended to open `Settings` > `Editor` and set the `Default editing mode` as `source mode` so that you can insert the properties more easily._

##### Add badge, note, and remark

The badge, note, and remark are shown on the paper card (in a tiny scrollable window). Badges are little icons illustrating the status/properties of this paper:

| code | icon |
| --- | --- |
| `skimmed` | 🪫 |
| `read` |🔋 |
| `seminal` | 💡 |
| `important` | 📌 |
| `work-well` | 👍 |
| `widely-used` | 🔧 |
| `insightful` | 🧠 |

_P.S. The code-icon pairs can be edited by revising the `bib_badge2str()` function in `obsidian-setup/lens/paperthread.js`_.

Note and remark are used to present brief summary of the major takeaways/innovations of the paper.

```
bib_badge:
  - read
  - insightful
bib_note: 
  - footprint to pressure pred
  - simple mlp outperforms cnn
bib_remark: 
  - patching to increase data samples
```

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/paper-thread-paper-card.png)

_P.S. The same paper card appears in the thread pages._

_P.S. To the right of the badge icons is the citation number of the paper._

##### Add alias

You can add [alias](https://help.obsidian.md/Linking+notes+and+files/Aliases) to the paper note to make it more accessible. For example, I usually add the model name as the alias to the machine learning papers.

#### Tag paper to a thread

To tag a paper to a thread, just add the thread note's tag to the paper note.

You can even add this paper to a _sub thread_ by using a _multi-layer tag_, e.g. the tag `Thread/AI/Application/Medical` is shown as a sub-thread under `Thread/AI` in the thread page:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/paper-thread-thread-view.png)

_P.S. By default, the threads branches from top to bottom. However, a subthread name in the format `pre-*` will make the branching direction from bottom to top. e.g. `Thread/AI/pre-Tool`._

#### Link paper to a paper

You can link a paper to a paper. For example, _RumelhartDavid1986_ is used in the _ZhangLiying2024_ paper. So in _ZhangLiying2024_, I edit the `bib_link` field as:

```
bib_link:
  - "[[RumelhartDavid1986#MLP]]"
```

The linked paper will be shown in both _RumelhartDavid1986_ and _ZhangLiying2024_:

![img](https://github.com/liu-qilong/obsidian-setup/blob/main/figures/paper-thread-linked-paper.png)

## Setup from scratch

If you don't want to use the example vault, you can set it up from scratch following these steps.

### Create an Obsidian vault

Download and install [Obsidian](https://obsidian.md). [Create a new vault](https://help.obsidian.md/Getting+started/Create+a+vault).

Clone this repository:

```
git clone https://github.com/liu-qilong/obsidian-setup.git
```

_P.S. Or click the `Code` button on this repository and click the `Download ZIP` option to download the files._

 It should be a folder named `obsidian-setup`. Place this folder to directly under your vault folder.

### Folder structure

Create a `container`, a `content`, and a `journal` folder, then:

- Under the `container` folder, create `institute`, `people`, `project`, `thread`,  and `topic` folders.
- Under the `content` folder, create `book`, `course`, `note`, and `paper` folders.
- Under the `journal` folder, create `diary`, `quarter`, and `week` folders.

### Theme

My customized templates and scripts work best with the [Things](https://github.com/colineckert/obsidian-things) theme. To use it, open `Settings` > `Appearance` > `Themes`, click `Manage`m and search for `Things`. Click into it and click `Install and use`.

### Plugins

Open `Settings` > `Community plugins` and then click `Turn on community plugins`. Click `Browse` and search for these plugins and install them. **Remember to click `Enable` after installing them**:

- [Dataview](https://github.com/blacksmithgu/obsidian-dataview)
- [CustomJS](https://github.com/saml-dev/obsidian-custom-js)
- [Tag Wrangler](https://github.com/pjeby/tag-wrangler)
- [Templater](https://github.com/SilentVoid13/Templater)
- [Calendar](https://github.com/liamcain/obsidian-calendar-plugin)

Again, *remember to click `Enable` after installing each of these plugins.**

#### Dataview and CustomJS settings

Open `Settings` > `Dataview`, and turn on `Enable JavaScript queries`. Change the `Refresh interval` to `25000`.

Open `Settings` > `CustomJS`, and fill `Folder` with `obsidian-setup/lens`.

#### Templater settings

Open `Settings` > `Templater`, turn on `Trigger Templater on new file creation`. Then scroll down to the _Folder Templates_ section, add these _folder - template pairs_ one by one:

| Folder | Template |
| --- | --- |
| `container/institute` | `obsidian-setup/templates/institute page.md` |
| `container/people` | `obsidian-setup/templates/people page.md` |
| `container/project` | `obsidian-setup/templates/project page.md` |
| `container/thread` | `obsidian-setup/templates/thread page.md` |
| `container/topic` | `obsidian-setup/templates/topic page.md` |
| `content/book` | `obsidian-setup/templates/book page.md` |
| `content/course` | `obsidian-setup/templates/course page.md` |
| `content/note` | `obsidian-setup/templates/note page.md` |
| `content/paper` | `obsidian-setup/templates/paper page.md` |
| `journal/quarter` | `obsidian-setup/templates/quarter page.md` |

Whenever you right-click a folder and click `New note`, it will create a new note with the corresponding template.

#### Daily notes and Calendar settings

Open `Settings` > `Daily notes`:

- Fill `New file location` with `journal/diary`.
- Fill `Template file location` with `obsidian-setup/template/diary page`.

_P.S. If you can't find `Settings` > `Daily notes`, open `Settings` > `Core plugins` and confirm that the `Daily notes` core plugin is enabled._

Open `Settings` > `Calendar`:

- Set `Start week on` as `Monday`.
- Fill `Weekly note template` with `obsidian-setup/template/week page.md`.
- Fill `Weekly note folder` with `journal/week`.