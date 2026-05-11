# Product Analysis: Study Plan and Check-in Statistics Assistant

## Source

- Source page: https://www.xiaohongshu.com/goods-detail/690ae3774545900001c4f32a
- Product title on listing: 作业规划与打卡统计工具使用指南，作业打卡神器，寒假逆袭计划表
- Product name shown in detail images: 好学伴 -- 学习计划与打卡统计助手
- Price observed: ¥18.8
- Sales observed: 已售1269
- Delivery method: 网盘
- Research assets saved locally:
  - `research/xhs-690ae377/group1/contact.png`
  - `research/xhs-690ae377/group2/contact.png`
  - `research/xhs-690ae377/group3/contact.png`
  - `research/xhs-690ae377/group4/contact.png`

## Product Positioning

This is a parent-assisted student planning and habit-building tool. It combines study task planning, timer-based check-ins, daily statistics, score tracking, badges, and points-based rewards.

The core value proposition is to replace paper study plans with a reusable digital system that helps children follow a plan, helps parents track progress, and uses visible feedback and rewards to improve motivation.

## Target Users

- Primary user: parents who want to manage a child's study plan and monitor execution.
- Secondary user: students who follow tasks, check in, earn badges, and redeem rewards.
- Typical scenario: holiday study planning, daily homework scheduling, subject review, exam preparation, habit building.

## Core Functional Modules

### 1. Study Plan and Task Management

Users can create study tasks by manual entry, batch entry, or preset templates.

Expected task fields:

- Task name
- Subject/category, such as Chinese, Math, English, Sports, Entertainment
- Task content
- Planned date
- Planned duration
- Repeat mode
- Completion status
- Actual duration

Supported repeat modes observed or implied:

- Daily
- Weekly
- Monthly
- Workdays
- Custom weekdays
- Memory/review cycle, such as an Ebbinghaus-style review pattern

Key operations:

- Add a single task
- Batch add tasks
- Create or use task templates
- Modify task plans
- Filter or switch by date
- Clear study plan
- Import study plan

### 2. Timer and Check-in Flow

Each task has timer controls:

- Start
- Pause
- Stop

The product records actual study duration and uses the duration/completion result to update statistics, badges, and points.

Task list behavior:

- Tasks are grouped by date.
- The interface supports previous day, next day, today, and calendar date selection.
- Tasks show planned time and actual timer state.
- Completed tasks contribute to daily completion rate.

### 3. Home Dashboard

The dashboard shows high-level daily and cumulative metrics.

Observed dashboard cards:

- Today's study time
- Outdoor/sports time
- Today's task count
- Today's completion rate
- Statistics chart entry
- Honor badge display entry
- Score tracking entry
- Points reward redemption entry

Observed example numbers:

- Today study time: 1.8h
- Outdoor time: 2.0h
- Today tasks: 6/7
- Completion rate: 86%
- Points: 1011 or 481 in different screenshots

### 4. Learning Data Statistics

The system generates charts from task and timer data.

Observed chart types:

- Daily plan completion
- Daily study time vs sports time vs entertainment time
- Total time share by category
- Daily time comparison by category
- Planned duration vs actual duration

Filtering and navigation:

- Select date range
- Filter by category or subject
- Paginate long chart data

Purpose:

- Make learning progress visible
- Help parents identify time distribution
- Compare plan execution against actual behavior

### 5. Score Tracking and Analysis

Parents can enter exam scores and compare them across time, subjects, and targets.

Expected score fields:

- Exam name
- Exam date
- Academic year
- Grade
- Semester
- Subject
- Target score
- Actual score
- Class average
- Highest score
- Ranking
- Performance label, such as excellent or good

Observed operations:

- Add score
- Score analysis
- Filter by academic year, grade, semester, and subject
- Backup data
- Import data

Observed chart types:

- Subject score trend
- Average score rate by subject
- Target vs actual score gap
- Score position histogram
- Weakness analysis radar chart
- Exam performance pie chart

### 6. Badge Motivation System

Children unlock badges after completing milestones.

Observed badge examples:

- 时间小新芽: total study time reaches 50 hours
- 知识探险家: study time reaches 80 hours
- 智慧萤火虫: study time reaches 100 hours
- 星空小学霸: study time reaches 150 hours
- 永恒时间大师: study time reaches 200 hours
- 活力小太阳: sports time reaches 5 hours
- 疾风小猎豹: sports time reaches 20 hours
- 活力萤火女: sports time reaches 50 hours
- 每日签到星: first check-in
- 七日坚持者: one full week of continuous check-ins
- 启航小能手: complete 50 tasks

Badge states:

- Locked
- Unlocked
- Progress toward unlock condition

### 7. Points Reward Redemption

Completed tasks accumulate points. Students can redeem rewards from a reward pool.

Observed reward examples:

- 狗狗: 10 points
- 带我出去玩: 30 points
- 小天才电话手表: 500 points
- 安静书: 50 points
- 卡皮巴拉礼盒: 100 points
- 磁吸玩偶: 60 points
- 手工 DIY 礼盒: 150 points
- 化妆包: 300 points
- 编程特技狗: 300 points

Expected reward fields:

- Reward name
- Description
- Required points
- Icon
- Inventory or availability
- Redeemed status

Reward module tabs:

- Reward pool
- Points record

Expected operations:

- Add reward
- Edit reward
- Redeem reward
- View points history

### 8. Parent Control and Data Safety

The product emphasizes parental control and local data safety.

Expected capabilities:

- Parent password verification for sensitive operations
- Prevent students from modifying learning records casually
- Local data storage
- One-click backup
- Restore/import backup
- Clear data or clear study plan

Sensitive operations should include:

- Editing completed task records
- Deleting tasks
- Clearing plans
- Importing data
- Editing points or rewards
- Changing score records

## End-to-End User Flow

1. Parent opens the app and configures basic settings.
2. Parent sets subjects/categories, task templates, reward items, and parent password.
3. Parent creates a study plan for a day, week, holiday, or exam-preparation period.
4. Student starts a task and uses the timer to record actual study time.
5. Student pauses or stops the timer after finishing the task.
6. The app marks the task complete and updates daily completion rate, duration statistics, points, and badge progress.
7. Parent checks the dashboard and statistics charts to review execution.
8. Parent enters exam scores after tests.
9. The app generates score trend, subject comparison, gap, and weakness analysis charts.
10. Student unlocks badges and redeems rewards with accumulated points.
11. Parent periodically backs up data and restores or migrates it when needed.

## Suggested MVP Scope

Build these first:

- Local-first data storage
- Subject/category management
- Task creation and repeat rules
- Daily task list
- Start/pause/stop timer
- Completion status
- Dashboard summary
- Basic statistics charts

Defer these to the second phase:

- Score tracking and analysis
- Badge unlock system
- Points reward store
- Parent password
- Backup and restore
- Batch task import

## Suggested Data Models

### Subject

- `id`
- `name`
- `color`
- `icon`
- `sortOrder`

### Task

- `id`
- `title`
- `subjectId`
- `content`
- `plannedDate`
- `plannedDurationMinutes`
- `actualDurationSeconds`
- `status`
- `repeatRuleId`
- `createdAt`
- `updatedAt`

### Timer Session

- `id`
- `taskId`
- `startedAt`
- `endedAt`
- `durationSeconds`
- `status`

### Repeat Rule

- `id`
- `type`
- `weekdays`
- `interval`
- `startDate`
- `endDate`
- `reviewOffsets`

### Score Record

- `id`
- `examName`
- `examDate`
- `academicYear`
- `grade`
- `semester`
- `subjectId`
- `targetScore`
- `actualScore`
- `averageScore`
- `highestScore`
- `ranking`
- `notes`

### Badge

- `id`
- `name`
- `description`
- `icon`
- `conditionType`
- `conditionValue`
- `unlockedAt`

### Reward

- `id`
- `name`
- `description`
- `icon`
- `pointsCost`
- `stock`
- `active`

### Points Ledger

- `id`
- `type`
- `points`
- `reason`
- `taskId`
- `rewardId`
- `createdAt`

## Implementation Notes

- The original product appears to be tablet-friendly and card-based, with large touch targets.
- It should work well as a local-first web app or PWA.
- Charting is central to the product, so use a chart library rather than drawing charts manually.
- Timer state should be resilient to page refresh and app sleep.
- Parent password should protect destructive or trust-sensitive actions.
- Backup should export all local data as a JSON file.

## Product Risks and Open Questions

- The exact scoring rules for points are not fully visible from the listing.
- The exact formulas for badges need to be defined; only some examples are visible.
- The original product may include templates not fully shown in the screenshots.
- It is unclear whether multi-child support exists; consider adding it if the target users are families with more than one child.
- It is unclear whether the product has cloud sync; the listing emphasizes local storage and backup.

## Recommended Next Step

Create a product requirements document based on this analysis, then define the first development milestone:

1. Build local data storage.
2. Build subject and task management.
3. Build daily task list with timer.
4. Build dashboard summary.
5. Build basic statistics charts.
