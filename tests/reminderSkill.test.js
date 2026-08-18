"use strict";

const Reminder = require("../skills/reminderSkill");

describe("ReminderSkill (yerel dosya)", () => {

    test("hatırlatıcı ekler ve listeler", async () => {
        await Reminder.run("hatırlat: 18:00 ekmek al");
        const out = await Reminder.run("hatırlatıcıları göster");
        expect(out).toMatch(/hatırlatıcı/i);
        expect(out).toMatch(/ekmek/);
    });

    test("match doğru", () => {
        expect(Reminder.match("hatırlat bir şey")).toBe(true);
        expect(Reminder.match("selam")).toBe(false);
    });
});
