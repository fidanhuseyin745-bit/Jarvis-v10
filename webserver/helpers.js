"use strict";

/**
 * HTTP yardımcıları: sonuç/error için tutarlı cevap formatları.
 */
function ok(res, data, status = 200) {
    res.status(status).json({ success: true, data });
}

function fail(res, error, status = 400) {
    res.status(status).json({ success: false, error: String(error || "hata") });
}

function catchAsync(handler) {
    return (req, res) => {
        try {
            return Promise.resolve(handler(req, res)).catch(err => {
                fail(res, err.message, 500);
            });
        } catch (err) {
            fail(res, err.message, 500);
        }
    };
}

module.exports = { ok, fail, catchAsync };
