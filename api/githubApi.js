"use strict";

const http = require("./httpClient");
const { execSync } = require("child_process");

class GithubApi {

    constructor() {
        this.token = process.env.GITHUB_TOKEN || "";
        this.apiBase = "https://api.github.com";
        this.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        };
        if (this.token) {
            this.headers["Authorization"] = "Bearer " + this.token;
        }
    }

    _hasAuth() {
        return !!this.token;
    }

    _ghAvailable() {
        try {
            execSync("gh --version", { stdio: "ignore", timeout: 3000 });
            return true;
        } catch {
            return false;
        }
    }

    async _gh(args) {
        if (!this._ghAvailable()) return null;
        try {
            const out = execSync("gh " + args, {
                encoding: "utf8",
                timeout: 15000,
                env: Object.assign({}, process.env, { GH_TOKEN: this.token })
            });
            return out.trim();
        } catch (e) {
            return null;
        }
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (!lower.includes("github")) return null;

        if (lower.includes("repo listele") || lower.includes("repolarım") ||
            lower.includes("github repoları") || lower.includes("projelerim") ||
            lower.includes("github projeler")) {
            return { type: "list" };
        }

        const issueRepo = text.match(/(?:issue|bug)\s+([a-z0-9_.\-]+\/[a-z0-9_.\-]+)/i);
        if (lower.includes("issue") || lower.includes("bug")) {
            return { type: "issues", repo: issueRepo ? issueRepo[1] : null };
        }

        const prRepo = text.match(/pr\s+([a-z0-9_.\-]+\/[a-z0-9_.\-]+)/i);
        if (lower.includes("pr ") || lower.includes("pull request")) {
            return { type: "pulls", repo: prRepo ? prRepo[1] : null };
        }

        const commitRepo = text.match(/commit\s+([a-z0-9_.\-]+\/[a-z0-9_.\-]+)/i);
        if (lower.includes("commit")) {
            return { type: "commits", repo: commitRepo ? commitRepo[1] : null };
        }

        const fullRepo = text.match(/github[:\s]+([a-z0-9_.\-]+\/[a-z0-9_.\-]+)/i);
        if (fullRepo) {
            if (lower.includes("oku") || lower.includes("göster") || lower.includes("goster")) {
                return { type: "readme", repo: fullRepo[1] };
            }
            return { type: "repo", ref: fullRepo[1] };
        }

        if (lower.includes("oku") || lower.includes("göster") || lower.includes("goster")) {
            const fileRepo = text.match(/([a-z0-9_.\-]+\/[a-z0-9_.\-]+)\s+(.+)$/i);
            return { type: "readme", repo: fileRepo ? fileRepo[1] : null };
        }

        return { type: "info" };
    }

    async execute(text) {
        const detected = this.detect(text);
        if (!detected) return null;

        if (!this._hasAuth()) {
            return "🔒 GitHub erişimi için GITHUB_TOKEN ayarlı değil. Token ayarlayınca repo listeleme, issue/PR/commit bilgisi alabilirim.";
        }

        switch (detected.type) {
            case "list":
                return await this._listRepos();
            case "repo":
                return await this._repoInfo(detected.ref);
            case "issues":
                return await this._listIssues(detected.repo);
            case "pulls":
                return await this._listPulls(detected.repo);
            case "commits":
                return await this._listCommits(detected.repo);
            case "readme":
                return await this._readme(detected.repo);
            default:
                return "GitHub komutun: 'github repolarım', 'github issue <repo>', 'github commit <repo>', 'github <kullanıcı/repo> oku'.";
        }
    }

    async _listRepos() {
        try {
            const data = await http.getJson(this.apiBase + "/user/repos?sort=updated&per_page=10", {
                headers: this.headers, timeout: 8000
            });
            if (!Array.isArray(data) || !data.length) {
                return "📂 Hiç GitHub repo'nuz bulunamadı.";
            }
            const lines = ["📂 Son güncellenen repolarınız:"];
            data.slice(0, 10).forEach((r, i) => {
                lines.push((i + 1) + ". " + r.full_name + " — " + (r.description || "(açıklama yok)"));
                lines.push("   ⭐ " + r.stargazers_count + " | 🍴 " + r.forks_count + " | " + (r.language || "dil yok"));
            });
            return lines.join("\n");
        } catch (e) {
            return "❌ Repo listesi alınamadı: " + e.message;
        }
    }

    async _repoInfo(ref) {
        const repo = await this._resolveRepo(ref);
        if (!repo) return "Repo bulunamadı: " + ref;
        try {
            const data = await http.getJson(this.apiBase + "/repos/" + repo, {
                headers: this.headers, timeout: 8000
            });
            const lines = [
                "📦 " + data.full_name,
                data.description || "(açıklama yok)",
                "• Dil: " + (data.language || "belirtilmemiş"),
                "• Yıldız: " + data.stargazers_count + " | Fork: " + data.forks_count,
                "• Varsayılan dal: " + data.default_branch,
                "• Oluşturulma: " + (data.created_at || "").slice(0, 10),
                "• Son güncelleme: " + (data.updated_at || "").slice(0, 10),
                "• URL: " + data.html_url
            ];
            return lines.join("\n");
        } catch (e) {
            return "❌ Repo bilgisi alınamadı: " + e.message;
        }
    }

    async _listIssues(repoRef) {
        const repo = await this._resolveRepo(repoRef);
        if (!repo) return "Repo belirtilmedi. 'github issue kullanıcı/repo' şeklinde deneyin.";
        try {
            const data = await http.getJson(this.apiBase + "/repos/" + repo + "/issues?state=open&per_page=5",
                { headers: this.headers, timeout: 8000 });
            if (!Array.isArray(data) || !data.length) {
                return "✅ " + repo + " reposunda açık issue yok.";
            }
            const lines = ["🐞 " + repo + " açık issue'lar:"];
            data.slice(0, 5).forEach((i, idx) => {
                lines.push((idx + 1) + ". #" + i.number + " " + i.title);
                if (i.labels && i.labels.length) {
                    lines.push("   etiketler: " + i.labels.map(l => l.name).join(", "));
                }
            });
            return lines.join("\n");
        } catch (e) {
            return "❌ Issue listesi alınamadı: " + e.message;
        }
    }

    async _listPulls(repoRef) {
        const repo = await this._resolveRepo(repoRef);
        if (!repo) return "Repo belirtilmedi. 'github pr kullanıcı/repo' şeklinde deneyin.";
        try {
            const data = await http.getJson(this.apiBase + "/repos/" + repo + "/pulls?state=open&per_page=5",
                { headers: this.headers, timeout: 8000 });
            if (!Array.isArray(data) || !data.length) {
                return "✅ " + repo + " reposunda açık PR yok.";
            }
            const lines = ["🔀 " + repo + " açık pull request'ler:"];
            data.slice(0, 5).forEach((p, idx) => {
                lines.push((idx + 1) + ". #" + p.number + " " + p.title + " (@" + p.user.login + ")");
            });
            return lines.join("\n");
        } catch (e) {
            return "❌ PR listesi alınamadı: " + e.message;
        }
    }

    async _listCommits(repoRef) {
        const repo = await this._resolveRepo(repoRef);
        if (!repo) return "Repo belirtilmedi. 'github commit kullanıcı/repo' şeklinde deneyin.";
        try {
            const data = await http.getJson(this.apiBase + "/repos/" + repo + "/commits?per_page=5",
                { headers: this.headers, timeout: 8000 });
            if (!Array.isArray(data) || !data.length) {
                return "Commit bulunamadı.";
            }
            const lines = ["📝 " + repo + " son commit'ler:"];
            data.slice(0, 5).forEach((c, idx) => {
                const msg = (c.commit.message || "").split("\n")[0];
                const sha = (c.sha || "").slice(0, 7);
                const author = c.commit.author ? c.commit.author.name : "?";
                const date = c.commit.author ? (c.commit.author.date || "").slice(0, 10) : "";
                lines.push((idx + 1) + ". " + sha + " " + msg + " (" + author + ", " + date + ")");
            });
            return lines.join("\n");
        } catch (e) {
            return "❌ Commit listesi alınamadı: " + e.message;
        }
    }

    async _readme(repoRef) {
        const repo = await this._resolveRepo(repoRef);
        if (!repo) return "Repo belirtilmedi.";
        try {
            const res = await http.get(this.apiBase + "/repos/" + repo + "/readme",
                { headers: Object.assign({}, this.headers, { "Accept": "application/vnd.github.raw" }), timeout: 8000 });
            if (res.status >= 400) return repo + " reposunun README'si bulunamadı.";
            const text = res.body || "";
            const preview = text.length > 600 ? text.slice(0, 600) + "\n... (kırpıldı, tam: " + text.length + " karakter)" : text;
            return "📄 " + repo + " README:\n\n" + preview;
        } catch (e) {
            return "❌ README alınamadı: " + e.message;
        }
    }

    async _resolveRepo(ref) {
        if (!ref) return null;
        if (ref.includes("/")) return ref;
        try {
            const user = await http.getJson(this.apiBase + "/user",
                { headers: this.headers, timeout: 6000 });
            if (user && user.login) return user.login + "/" + ref;
        } catch {
        }
        return null;
    }

}

module.exports = new GithubApi();
