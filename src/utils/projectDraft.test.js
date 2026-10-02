import { describe, expect, it } from 'vitest'
import { projectDraftSnapshot, restoreProjectDraft } from './projectDraft'

describe('project drafts', () => {
  it('preserves incomplete form fields and an optional cover for later editing', () => {
    const snapshot = projectDraftSnapshot({ title:'Web pendiente', slug:'web-pendiente', description:'', content:'Primer párrafo', show_on_homepage:false }, null)
    expect(restoreProjectDraft(snapshot, { category:'', tags:'' })).toEqual({
      project:{ category:'', tags:'', title:'Web pendiente', slug:'web-pendiente', description:'', content:'Primer párrafo', show_on_homepage:false },
      image:null
    })
  })
  it('restores missing fields from defaults without mutating them', () => {
    const defaults = { title:'', slug:'', category:'' }
    expect(restoreProjectDraft({ project:{ title:'Sin terminar' }, image:'https://example.com/cover.jpg' }, defaults).project.slug).toBe('')
    expect(defaults.title).toBe('')
  })
})
