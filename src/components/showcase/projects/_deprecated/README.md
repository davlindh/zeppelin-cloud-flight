# Deprecated Components

This directory contains deprecated components that have been replaced by newer implementations.

## ProjectMediaSection.tsx

**Status:** DEPRECATED (2025-01-19)  
**Replaced By:** `ProjectMediaDisplay.tsx` in `src/components/showcase/`

**Reason for Deprecation:**  
- Used static props data instead of dynamic queries
- Duplicated functionality with `ProjectMediaDisplay`
- No auto-updates when media is linked/unlinked
- Not connected to `media_library` table

**Migration Guide:**  
Replace:
```tsx
<ProjectMediaSection
  media={project.media}
  projectId={project.id}
  rawData={{ project_media: project.project_media }}
/>
```

With:
```tsx
<ProjectMediaDisplay
  projectId={project.id}
  showAdminControls={isAdmin}
/>
```

**DO NOT USE** these deprecated components in new code.
