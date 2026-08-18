"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");

test("memory saves and loads conversation entries", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jarvis-mem-"));
    const file = path.join(tmpDir, "memory.json");
    fs.writeFileSync(file, "[]");

    const Memory = require("../engine/memory");
    const mem = new Memory();
    mem.file = file;

    await mem.save("merhaba", "selam");
    await mem.save("nasılsın", "iyiyim");

    const all = mem.loadAll();
    assert.strictEqual(all.length, 2);
    assert.strictEqual(all[0].prompt, "merhaba");
    assert.strictEqual(all[1].reply, "iyiyim");

    const recent = await mem.recent(1);
    assert.strictEqual(recent.length, 1);
    assert.strictEqual(recent[0].prompt, "nasılsın");

    fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("memory caps stored entries at maxItems", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jarvis-mem-"));
    const file = path.join(tmpDir, "memory.json");
    fs.writeFileSync(file, "[]");

    const Memory = require("../engine/memory");
    const mem = new Memory();
    mem.file = file;
    mem.maxItems = 3;

    for (let i = 0; i < 5; i++) {
        await mem.save("q" + i, "a" + i);
    }

    const all = mem.loadAll();
    assert.strictEqual(all.length, 3);
    assert.strictEqual(all[0].prompt, "q2");

    fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("memory loadAll returns empty array on missing file", () => {
    const Memory = require("../engine/memory");
    const mem = new Memory();
    mem.file = "/nonexistent/path/memory.json";
    assert.deepStrictEqual(mem.loadAll(), []);
});
