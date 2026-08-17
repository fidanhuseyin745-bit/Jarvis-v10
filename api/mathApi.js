"use strict";

class MathApi {

    constructor() {
        this.functions = {
            "karekök": (x) => Math.sqrt(x),
            "sqrt": (x) => Math.sqrt(x),
            "küpkök": (x) => Math.cbrt(x),
            "cbrt": (x) => Math.cbrt(x),
            "mutlak": (x) => Math.abs(x),
            "abs": (x) => Math.abs(x),
            "sin": (x) => Math.sin(this._toRad(x)),
            "cos": (x) => Math.cos(this._toRad(x)),
            "tan": (x) => Math.tan(this._toRad(x)),
            "ln": (x) => Math.log(x),
            "log": (x) => Math.log10(x),
            "log10": (x) => Math.log10(x),
            "taban": (x) => Math.floor(x),
            "tavan": (x) => Math.ceil(x),
            "yuvarla": (x) => Math.round(x),
            "faktöriyel": (x) => this._factorial(x),
            "faktoriyel": (x) => this._factorial(x),
            "asal mı": (x) => this._isPrime(x),
            "asalmı": (x) => this._isPrime(x)
        };

        this.constants = {
            "pi": Math.PI,
            "π": Math.PI,
            "e": Math.E
        };
    }

    _toRad(deg) {
        return deg * Math.PI / 180;
    }

    _factorial(n) {
        n = Math.floor(n);
        if (n < 0) return NaN;
        if (n > 170) return Infinity;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
    }

    _isPrime(n) {
        n = Math.floor(n);
        if (n < 2) return 0;
        if (n === 2) return 1;
        if (n % 2 === 0) return 0;
        for (let i = 3; i * i <= n; i += 2) {
            if (n % i === 0) return 0;
        }
        return 1;
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();

        for (const fn of Object.keys(this.functions)) {
            if (lower.includes(fn)) {
                const nums = lower.match(/\d+(?:[.,]\d+)?/g);
                if (nums && nums.length) {
                    const x = parseFloat(nums[nums.length - 1].replace(",", "."));
                    return { fn, x };
                }
            }
        }

        if (lower.includes("yüzde")) {
            const nums = lower.match(/\d+(?:[.,]\d+)?/g);
            if (nums && nums.length >= 2) {
                const a = parseFloat(nums[0].replace(",", "."));
                const b = parseFloat(nums[1].replace(",", "."));
                return { fn: "yüzde", a, b };
            }
        }

        if (lower.includes("üs") || lower.includes("kuvvet") || lower.includes("^") || lower.includes("üzeri")) {
            const nums = lower.match(/\d+(?:[.,]\d+)?/g);
            if (nums && nums.length >= 2) {
                const base = parseFloat(nums[0].replace(",", "."));
                const exp = parseFloat(nums[1].replace(",", "."));
                return { fn: "üs", base, exp };
            }
        }

        return null;
    }

    evaluate(text) {
        const detected = this.detect(text);
        if (!detected) return null;

        if (detected.fn === "yüzde") {
            const result = (detected.a * detected.b) / 100;
            return `🧮 ${detected.a} sayısının %${detected.b}'i = ${this._fmt(result)}`;
        }

        if (detected.fn === "üs") {
            const result = Math.pow(detected.base, detected.exp);
            return `🧮 ${detected.base} üzeri ${detected.exp} = ${this._fmt(result)}`;
        }

        const fn = this.functions[detected.fn];
        if (!fn) return null;

        const result = fn(detected.x);
        if (typeof result !== "number" || !isFinite(result)) return null;

        let label = detected.fn;
        if (detected.fn === "asal mı" || detected.fn === "asalmı") {
            return `🧮 ${detected.x} ${result ? "asal bir sayıdır" : "asal değildir"}.`;
        }

        return `🧮 ${label}(${detected.x}) = ${this._fmt(result)}`;
    }

    evaluateExpr(expr) {
        const cleaned = String(expr || "").toLowerCase()
            .replace(/\s+/g, "")
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/,/g, ".");

        for (const [name, val] of Object.entries(this.constants)) {
            cleaned.replace(new RegExp(name, "g"), String(val));
        }

        let resolved = cleaned;
        for (const [name, val] of Object.entries(this.constants)) {
            resolved = resolved.replace(new RegExp(name, "g"), "(" + val + ")");
        }

        if (!/^[\d+\-*/.()]+$/.test(resolved)) return null;

        try {
            const result = Function('"use strict"; return (' + resolved + ")")();
            if (typeof result !== "number" || !isFinite(result)) return null;
            return `🧮 ${expr.replace(/\s+/g, "")} = ${this._fmt(result)}`;
        } catch {
            return null;
        }
    }

    _fmt(n) {
        if (Number.isInteger(n)) return n.toLocaleString("tr-TR");
        return String(parseFloat(n.toFixed(8)));
    }

}

module.exports = new MathApi();
