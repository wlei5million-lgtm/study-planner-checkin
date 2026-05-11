# Date Repeat Planner Design

## Goal

Enhance the existing study planner day view so users can switch the active planning date and create basic repeated tasks without leaving the current workflow.

## Scope

This design implements the first follow-up after the MVP:

- Add previous day, today, next day, and direct date selection controls.
- Make dashboard and planner data follow the selected date.
- Extend task creation with basic repeat modes:
  - No repeat
  - Daily
  - Workdays
  - Custom weekdays
- Generate one independent task for each expanded date.

Out of scope for this round:

- Monthly repeat rules.
- Ebbinghaus or memory review cycles.
- Editing a whole repeat series after creation.
- Weekly calendar board layout.
- Separate task creation wizard.

## User Experience

The "学习计划" page keeps the existing day-list structure. Its header gains a date control row:

- Previous day button.
- Today button.
- Next day button.
- Date input for direct selection.

Changing the date updates the visible task list. Creating a non-repeating task creates one task on the selected date. Creating a repeating task uses the selected date as the default start date, asks for an end date, and optionally asks for weekdays when the mode is "custom weekdays".

The dashboard uses the same selected date, so a user can switch to a future date in the planner and then see that day's dashboard metrics.

## Data Flow

`App` owns the active date state and passes it to dashboard and planner views. Repository reads remain date-based through `listTasksByDate(date)`.

Task creation accepts a repeat rule from the form. `App` calls `expandRepeatDates(rule, selectedDate)` and creates one task per returned date. Each generated task has:

- A unique task id.
- The expanded `plannedDate`.
- The same title, content, subject, planned duration, and repeat rule.
- `actualDurationSeconds` set to `0`.
- `status` set to `planned`.

Existing timer and statistics logic continue to operate on individual tasks.

## Components

### DateNavigator

A small reusable control for planner/dashboard date selection. It receives:

- `date`
- `onDateChange`

It renders previous day, today, next day, and native date input controls.

### TaskForm

The existing task form gains repeat controls:

- Repeat mode select.
- End date input for repeating modes.
- Weekday checkboxes for custom weekdays.

The form validates that repeating modes have an end date on or after the selected date. Custom weekdays require at least one selected weekday.

### PlannerView

`PlannerView` receives `onDateChange` and renders `DateNavigator` near the page header. It passes the selected date into `TaskForm`.

## Error Handling

Validation stays local to `TaskForm` and prevents invalid submissions:

- Empty title remains invalid through the existing required field.
- Repeating without an end date shows an inline message.
- End date before selected date shows an inline message.
- Custom weekdays without selected days shows an inline message.

Repository errors are not redesigned in this round. Existing async flows keep their current behavior.

## Testing

Add tests at three levels:

- Domain/repository-adjacent behavior: verify task creation input can expand into multiple tasks by using existing repeat rule logic through App-level flow.
- Component behavior: `DateNavigator` emits previous, today, next, and direct date changes.
- UI behavior: `PlannerView` submits daily, workday, and custom weekday repeated tasks through the form.
- App behavior: switching dates reloads the task list and repeated tasks appear on their generated dates.

Full verification remains:

```bash
npm test
npm run build
```

## Acceptance Criteria

- A user can move from today to previous or next day in the planner.
- A user can choose a date directly.
- Dashboard and planner use the same selected date.
- Creating a non-repeating task still creates exactly one task.
- Creating a daily repeated task creates tasks for every date in the range.
- Creating a workday repeated task excludes Saturday and Sunday.
- Creating a custom weekday repeated task creates tasks only on selected weekdays.
- Existing timer controls still work on generated tasks.
