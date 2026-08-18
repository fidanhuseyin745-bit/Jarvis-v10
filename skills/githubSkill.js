"use strict";

const axios = require("axios");

/**
 * GithubSkill — GitHub public API (GITHUB_TOKEN varsa rate-limit artar).
 * "github'da repo ara: X", "github'da kullanıcı Y" isteklerini yanıtlar.
 */
module.exports = {
    name: "GitHub",

    match(text) {
        return /github/i.test(text);
    },

    async run(input) {
        const userMatch = input.match(/kullanıcı\s+([a-zA-Z0-9_-]+)/i) ||
            input.match(/user\s+([a-zA-Z0-9_-]+)/i);
        if (userMatch) return await this._user(userMatch[1]);

        const repoMatch = input.match(/repo\s+(.+)/i) ||
            input.match(/depo\s+(.+)/i) ||
            input.match(/ara\s*:?\s*(.+)/i);
        if (repoMatch) return await this._repos(repoMatch[1].trim());

        return "GitHub: 'github'da repo ara: X' veya 'github'da kullanıcı Y' yaz.";
    },

    _headers() {
        const h = { "User-Agent": "JarvisBot/1.0", "Accept": "application/vnd.github+json" };
        if (process.env.GITHUB_TOKEN) h.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
        return h;
    },

    async _repos(query) {
        try {
            const res = await axios.get("https://api.github.com/search/repositories", {
                params: { q: query, per_page: 5, sort: "stars" },
                headers: this._headers(),
                timeout: 8000
            });
            const items = res.data && res.data.items;
            if (!items || items.length === 0) return "'" + query + "' için repo bulunamadı.";
            const lines = ["🐙 GitHub repo sonuçları (" + query + "):"];
            items.forEach((r, i) => {
                lines.push((i + 1) + ". " + r.full_name + " ⭐" + r.stargazers_count);
                if (r.description) lines.push("   " + r.description);
            });
            return lines.join("\n");
        } catch (e) {
            return "GitHub repo sorgusu başarısız: " + e.message;
        }
    },

    async _user(login) {
        try {
            const res = await axios.get("https://api.github.com/users/" + login, {
                headers: this._headers(),
                timeout: 8000
            });
            const u = res.data || {};
            if (u.message === "Not Found") return "'" + login + "' adlı kullanıcı bulunamadı.";
            return "🐙 GitHub kullanıcı: " + u.login + "\n" +
                "Ad: " + (u.name || "-") + "\n" +
                "Bio: " + (u.bio || "-") + "\n" +
                "Repo sayısı: " + (u.public_repos || 0) + "\n" +
                "Takipçi: " + (u.followers || 0) + "\n" +
                "URL: " + (u.html_url || "-");
        } catch (e) {
            return "GitHub kullanıcı sorgusu başarısız: " + e.message;
        }
    }
};
