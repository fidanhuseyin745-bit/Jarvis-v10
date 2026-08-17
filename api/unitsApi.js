"use strict";

class UnitsApi {

    constructor() {
        this.categories = {
            length: {
                units: {
                    "mm": 0.001, "milimetre": 0.001, "cm": 0.01, "santimetre": 0.01,
                    "m": 1, "metre": 1, "km": 1000, "kilometre": 1000,
                    "inç": 0.0254, "inch": 0.0254, "ft": 0.3048, "feet": 0.3048, "ayak": 0.3048,
                    "yarda": 0.9144, "mi": 1609.344, "mil": 1609.344, "deniz mili": 1852
                }
            },
            weight: {
                units: {
                    "mg": 0.000001, "miligram": 0.000001,
                    "g": 0.001, "gram": 0.001,
                    "kg": 1, "kilogram": 1, "kilo": 1,
                    "ton": 1000, "t": 1000,
                    "lb": 0.453592, "libre": 0.453592, "ons": 0.0283495, "oz": 0.0283495
                }
            },
            temperature: {
                units: {
                    "c": "c", "celsius": "c", "celscius": "c",
                    "f": "f", "fahrenheit": "f",
                    "k": "k", "kelvin": "k"
                }
            },
            volume: {
                units: {
                    "ml": 0.001, "mililitre": 0.001,
                    "l": 1, "litre": 1,
                    "m³": 1000, "metreküp": 1000,
                    "galon": 3.78541, "pint": 0.473176, "cc": 0.001
                }
            },
            time: {
                units: {
                    "saniye": 1, "sn": 1, "dakika": 60, "dk": 60, "min": 60,
                    "saat": 3600, "h": 3600, "gün": 86400, "hafta": 604800,
                    "ay": 2629800, "yıl": 31557600
                }
            },
            speed: {
                units: {
                    "m/s": 1, "km/s": 0.277778, "km/h": 0.277778, "mph": 0.44704, "knot": 0.514444
                }
            }
        };
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();

        const tempResult = this._detectTemp(lower);
        if (tempResult) return tempResult;

        const allUnits = new Set();
        for (const cat of Object.keys(this.categories)) {
            if (cat === "temperature") continue;
            for (const u of Object.keys(this.categories[cat].units)) {
                allUnits.add(u);
            }
        }
        const unitPattern = Array.from(allUnits).sort((a, b) => b.length - a.length)
            .map(u => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

        const fromRe = new RegExp("(\\d+(?:[.,]\\d+)?)\\s*(" + unitPattern + ")", "");
        const fromMatch = lower.match(fromRe);
        if (!fromMatch) return null;

        const value = parseFloat(fromMatch[1].replace(",", "."));
        const fromUnit = fromMatch[2];

        const toRe = new RegExp("(?:kaç|edere|yapar|ne kadar|eder)\\s*(" + unitPattern + ")", "");
        const toMatch = lower.match(toRe);
        if (!toMatch) return null;

        const toUnit = toMatch[1];

        for (const [cat, data] of Object.entries(this.categories)) {
            if (cat === "temperature") continue;
            if (data.units[fromUnit] !== undefined && data.units[toUnit] !== undefined) {
                return { category: cat, value, fromUnit, toUnit };
            }
        }

        return null;
    }

    _detectTemp(lower) {
        if (!lower.includes("derece")) return null;

        const value = lower.match(/(\d+(?:[.,]\d+)?)\s*derece/);
        if (!value) return null;
        const v = parseFloat(value[1].replace(",", "."));

        const scaleMatch = lower.match(/derece\s*(c|f|k|celsius|fahrenheit|kelvin)/);
        const fromScale = scaleMatch ? this._normScale(scaleMatch[1]) : "c";

        const toMatch = lower.match(/(?:kaç|ne kadar)\s*(c|f|k|celsius|fahrenheit|kelvin)\b/);
        if (!toMatch) return null;
        const toScale = this._normScale(toMatch[1]);

        return { category: "temperature", value: v, fromUnit: fromScale, toUnit: toScale };
    }

    _normScale(s) {
        s = String(s || "").toLowerCase();
        if (s === "c" || s === "celsius" || s === "celscius") return "c";
        if (s === "f" || s === "fahrenheit") return "f";
        if (s === "k" || s === "kelvin") return "k";
        return s;
    }

    convert(text) {
        const detected = this.detect(text);
        if (!detected) return null;

        const { category, value, fromUnit, toUnit } = detected;
        const units = this.categories[category].units;

        let result;
        if (category === "temperature") {
            result = this._convertTemp(value, fromUnit, toUnit);
        } else {
            const fromFactor = units[fromUnit];
            const toFactor = units[toUnit];
            result = (value * fromFactor) / toFactor;
        }

        if (typeof result !== "number" || !isFinite(result)) return null;

        const fmt = (n) => Number.isInteger(n) ? n.toLocaleString("tr-TR") : parseFloat(n.toFixed(4));
        return `📐 ${value} ${fromUnit} = ${fmt(result)} ${toUnit}`;
    }

    _convertTemp(value, from, to) {
        let celsius;
        if (from === "c") celsius = value;
        else if (from === "f") celsius = (value - 32) * 5 / 9;
        else if (from === "k") celsius = value - 273.15;
        else return null;

        if (to === "c") return celsius;
        if (to === "f") return celsius * 9 / 5 + 32;
        if (to === "k") return celsius + 273.15;
        return null;
    }

}

module.exports = new UnitsApi();
