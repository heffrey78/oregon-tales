# Oregon Tales: Task Management System

This document outlines the task structure and workflow for the Oregon Tales project.

## Task Structure

Each task in the project is documented in its own markdown file with the naming convention: `{task-id}-{task-name}.md`.

### Task ID Format
- Three-digit number (e.g., 001, 002, 003)
- Sequential assignment to ensure uniqueness

### Task File Structure

```markdown
# Task {ID}: {Task Name}

**User Story**: As a {role}, I want {goal} so that {benefit}.

## Status: {EMOJI} {STATUS}

## Parent Task: {Parent Task ID or "None"}
## Sub Tasks: {Comma-separated list of task IDs or "None"}

## Description
{Detailed description of the task}

## {Additional Sections}
{Task-specific content such as implementation details, requirements, etc.}

## Success Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- ...
```

### Task Status Legend

The following emoji are used to indicate task status:

- ✅ COMPLETE - Task is completed and validated
- 🔄 IN PROGRESS - Task is currently being worked on
- ⏱️ PENDING - Task is queued but not yet started
- ⚠️ BLOCKED - Task cannot proceed due to dependencies
- 🔍 REVIEW - Task is completed but pending review

## Task Relationships

Tasks can have hierarchical relationships:

1. **Parent Task**: A higher-level task that this task is part of
2. **Sub Tasks**: Lower-level tasks that are part of this task

This creates a task tree structure that helps organize work into manageable chunks.

## Workflow

1. FIRST review parent tasks to understand context
2. UPDATE task status AS YOU PROGRESS
3. MARK sub-tasks as they are completed
4. UPDATE the parent task status only when all sub-tasks are complete
5. ADD new tasks as needed, maintaining the numeric sequence
6. CREATE `{task-id}-{task-name}-retrospective.md` with concise START, STOP, and CONTINUE sections.

## Task Creation Directives

When creating a new task:

1. Assign the next available task ID
2. Write a clear user story
3. Link to parent tasks if applicable
4. Break down into sub-tasks if complex
5. Define clear and measurable success criteria

This structured approach ensures that development work is organized, traceable, and accountable.