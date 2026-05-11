import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { makeSubject, makeTask } from "../test/factories";
import { appDb } from "./db";
import { createTask, exportAllData, importAllData, listSubjects, listTasksByDate, replaceSubjects } from "./repositories";

describe("repositories", () => {
  beforeEach(async () => {
    await appDb.delete();
    await appDb.open();
  });

  it("stores subjects and tasks", async () => {
    await replaceSubjects([makeSubject({ id: "chinese" })]);
    await createTask(makeTask({ subjectId: "chinese", plannedDate: "2026-05-11" }));

    const tasks = await listTasksByDate("2026-05-11");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("晨读");
  });

  it("exports and imports local data", async () => {
    await replaceSubjects([makeSubject({ id: "chinese" })]);
    await createTask(makeTask({ subjectId: "chinese", plannedDate: "2026-05-11" }));

    const backup = await exportAllData();
    await replaceSubjects([]);
    await importAllData(backup);

    expect(await listSubjects()).toHaveLength(1);
    expect(await listTasksByDate("2026-05-11")).toHaveLength(1);
  });
});
