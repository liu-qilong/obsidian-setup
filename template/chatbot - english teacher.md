---
tags:
  - Chat
date: <%tp.date.now()%>
update: []
system_commands: ['I am a strict English teacher.']
temperature: 0
top_p: 1
max_tokens: 512
presence_penalty: 1
frequency_penalty: 1
stream: true
stop: null
n: 1
model: gpt-4
---

role::user

Following is a text of your student:

<%tp.system.clipboard()%>

List the grammar errors you found and revised the draft.