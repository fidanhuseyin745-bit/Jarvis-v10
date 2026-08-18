"use strict";

const { ok, fail, catchAsync } = require("../webserver/helpers");

// Express benzeri sahte res nesnesi
function fakeRes() {
    const r = { statusCode: 200, body: null };
    r.status = (c) => { r.statusCode = c; return r; };
    r.json = (d) => { r.body = d; return r; };
    return r;
}

describe("webserver helpers", () => {

    test("ok başarı formatı", () => {
        const res = fakeRes();
        ok(res, { a: 1 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, data: { a: 1 } });
    });

    test("fail hata formatı", () => {
        const res = fakeRes();
        fail(res, "boom", 400);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, error: "boom" });
    });

    test("catchAsync hatayı yakalar", async () => {
        const handler = catchAsync(() => { throw new Error("patladı"); });
        const res = fakeRes();
        await handler({}, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});
