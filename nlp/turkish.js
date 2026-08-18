"use strict";

const SUFFIXES = [
    "lerinden", "larına", "lerinde", "larımızdan", "lerinden",
    "larından", "lerimizden", "larımız", "lerimiz", "larını", "lerinin",
    "larında", "lar", "ler",

    "imizden", "ımızdan", "imizde", "ımızda", "imize", "ımızı",
    "imiz", "ımız",

    "lerinden", "larına", "lerinde", "larından", "larını", "lerinin",

    "sinden", "sına", "sinde", "sında", "sini", "sının",
    "sı", "si", "su", "sü",

    "lerinden", "larına", "lerinde",
    "nden", "na", "nı", "ni", "nu", "nü", "nde", "nda",

    "dan", "den", "tan", "ten",
    "lar", "ler",
    "ları", "leri",
    "la", "le",
    "yi", "yı", "yu", "yü", "i", "ı", "u", "ü",
    "e", "a",
    "in", "ın", "un", "ün",
    "ım", "im", "um", "üm",
    "m", "n", "k",
    "dir", "dır", "dur", "dür",
    "tir", "tır", "tur", "tür"
];

const STOPWORDS = new Set([
    "ve", "ile", "için", "bir", "bu", "şu", "o", "da", "de", "ta", "te",
    "mi", "mı", "mu", "mü", "ne", "nasıl", "neden", "niçin", "niye",
    "kim", "hangi", "kaç", "ne", "kadar", "daha", "en", "çok", "az",
    "ben", "sen", "biz", "siz", "onlar", "bana", "sana", "ona", "bize",
    "ama", "fakat", "ancak", "veya", "ya", "ki", "de", "ise"
]);

function stem(word) {
    word = String(word || "").toLowerCase().trim();
    if (!word) return [word];

    word = word.replace(/[.,;:!?'"()]/g, "");

    if (!word) return [""];

    const stems = new Set([word]);

    for (let i = 1; i <= Math.min(word.length - 2, 6); i++) {
        if (i > word.length - 2) break;
        const candidate = word.slice(0, word.length - i);
        if (candidate.length < 2) break;

        for (const suf of SUFFIXES) {
            if (word === candidate + suf) {
                stems.add(candidate);
            }
        }
    }

    let shortest = word;
    for (const s of stems) {
        if (s.length < shortest.length && s.length >= 2) {
            shortest = s;
        }
    }

    return [shortest, word];
}

function splitSentence(text) {
    return String(text || "")
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(Boolean);
}

function wordsOf(text) {
    return String(text || "").toLowerCase().split(/\s+/).filter(Boolean);
}

module.exports = { stem, splitSentence, wordsOf, STOPWORDS };
