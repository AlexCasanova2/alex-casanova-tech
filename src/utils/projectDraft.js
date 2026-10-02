export const projectDraftSnapshot = (project, image) => ({
  project:{ ...project },
  image:image || null
})

export const restoreProjectDraft = (snapshot, defaults) => ({
  project:{ ...defaults, ...(snapshot?.project || {}) },
  image:snapshot?.image || null
})
