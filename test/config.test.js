"use strict";

const test = require("node:test");
const assert = require("node:assert");
const config = require("../config/aiConfig");

test("config is local-only (no external API)", () => {
    assert.ok("url" in config);
    assert.ok("model" in config);
    assert.ok("key" in config);
    assert.ok("timeout" in config);
    assert.ok(typeof config.timeout === "number");
    assert.ok(config.timeout > 0);
    assert.strictEqual(config.url, "");
    assert.strictEqual(config.key, "");
    assert.strictEqual(config.isConfigured, false);
});

test("model has a sensible default", () => {
    assert.ok(config.model && config.model.length > 0);
});

test("coder returns local reply via localEngine", async () => {
    const Coder = require("../ai/coder");
    const coder = new Coder();
    const reply = await coder.ask("merhaba");
    assert.ok(typeof reply === "string");
    assert.ok(reply.includes("Jarvis"));
});
