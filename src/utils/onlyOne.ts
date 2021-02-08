
export class DocItem {
    private title: string;
    private contents?: string[];
    private isUL: boolean;
    constructor(title: string, contents: string[]) {
        this.title = title;
        this.isUL = false;
        if (contents) this.contents = [...contents];
        this.isUL = this.contents && this.contents.filter(c => c.slice(0, 2) === "- ").length === this.contents.length;
        if (this.isUL)
            this.contents = this.contents.map(c => c.slice(2));
    }
    asHtml(find?: string, findClass = "find"): string {
        let title = this.title;
        let html: string = "";
        let findRE = find ? new RegExp(find, "g") : null;
        let findInTitle = false;
        let mb = this.isUL ? "<li>" : `<p class="mb-0">`;
        let me = this.isUL ? "</li>" : "</p>";

        if (findRE) {
            //if (title.indexOf(find) !== -1) {
            if (findRE.test(title)) {
                title = title.replace(findRE, "<span class='" + findClass + "'>$&</span>");
                findInTitle = true;
            }
            if (findInTitle)
                html = this.contents.map(c => mb + c.replace(findRE, "<span class='" + findClass + "'>$&</span>") + me).join("");
            else
                html = this.contents.filter(c => findRE.test(c) /* c.indexOf(find) !== -1*/).map(c => mb + c.replace(findRE, "<span class='" + findClass + "'>$&</span>") + me).join("");

        } else if (this.contents) {
            html = this.contents.map(c => mb + c + me).join("");
        }
        if (html) {
            title = "<div class='is-size-4'>" + title + "</div>";
            if (this.isUL) html = "<ul>" + html + "</ul>";
            return `<div>${title}<div class="items">${html}</div></div>`
        } else
            return "";
    }
}

export class ClaimDetail {
    private claimNo: number;
    private claimName: string;
    private claimCode: string;
    private claimType: string;
    private claimNeeds: string[];
    private claimNotes: string[];
    constructor(no: number, name: string, code: string, type: string, needs: string[], notes: string[]) {
        this.claimNo = no;
        this.claimName = name;
        this.claimCode = code;
        this.claimType = type;
        this.claimNeeds = [...needs];
        this.claimNotes = [...notes];
    }
    asHtml(find?: string, findClass = "find"): string {
        let findRE = find ? new RegExp(find, "g") : null;
        let getMatch = function (info: string): [boolean, string] {
            if (findRE) {
                //if (info.indexOf(find) !== -1)
                if (findRE.test(info))
                    return [true, info.replace(findRE, "<span class='" + findClass + "'>$&</span>")];
                else
                    return [false, info];
            } else
                return [true, info];
        };
        let getMatchs = function (infos: string[]): [boolean, string] {
            let result = "", found = false;
            infos.forEach(info => {
                let match = getMatch(info);
                if (match[0]) {
                    found = true;
                }
                result += `<p class="mb-0">${match[1]}</p>`;
            });
            return [found, result];
        };
        let matchName = this.claimCode ? getMatch(this.claimName + '<br/>' + this.claimCode) : getMatch(this.claimName);
        let matchType = getMatch(this.claimType);
        let matchNeeds = getMatchs(this.claimNeeds);
        let matchNotes = getMatchs(this.claimNotes);
        let matched = matchName[0] || matchType[0] || matchNeeds[0] || matchNotes[0];
        let html = "";
        if (matched)
            html = `<tr><td>${matchType[1]}</td><td>${this.claimNo}</td><td>${matchName[1]}</td><td>${matchNeeds[1]}</td><td>${matchNotes[1]}</td></tr>`;
        return html;
    }
}


export class OnlyOne {
    private docItems: DocItem[];
    private devKeyWords: string[]; //开发阶段用于生成keyWords
    private keyWords: string[][];
    private claimDetails: ClaimDetail[];
    private fileName: string;
    constructor(fileName: string) {
        this.fileName = fileName;
        this.docItems = [];
        this.devKeyWords = [];
        this.keyWords = [];
        this.claimDetails = [];
    }
    async load(): Promise<OnlyOne> {
        let resp = null;
        this.docItems = [];
        this.devKeyWords = [];
        this.claimDetails = [];

        //Load MarkDown
        resp = await fetch("/doc/" + this.fileName + ".md");
        let lines = (await resp.text()).split("\r\n");
        let title = "";
        let i = lines.length - 1;
        let contents: string[] = [];
        while (i >= 0) {
            let line = lines[i];
            if (line.length > 0) {
                if (line.slice(0, 3) === "## ") {
                    title = line.slice(3);
                    contents.reverse();
                    this.docItems.push(new DocItem(title, contents));
                    title = "";
                    contents = [];
                } else if (line.slice(0, 2) === ">>") {
                    this.devKeyWords.push(line.slice(2));
                } else if (line.slice(0, 2) !== "# ") contents.push(line);
            }
            i--;
        }
        this.docItems.reverse();

        //Load Json
        resp = await fetch("/doc/" + this.fileName + ".json");
        let json: any = await resp.json();
        let items: any[] = json["报销业务所需材料与注意事项"];
        items.forEach(e => {
            let claimDetail = new ClaimDetail(e["序号"],
                e["事项"], e["经济分类"], e["业务类别"], e["所需材料"], e["注意事项"]);
            this.devKeyWords.push(e["事项"]);
            this.claimDetails.push(claimDetail);
        });
        this.keyWords = json["keyWords"] || [];
        if (this.keyWords.length > 0)
            this.keyWords.sort((a, b) => a[0] < b[0] ? -1 : (a[0] === b[0] ? 0 : -1));
        //console.dir(this.keyWords);
        return this;
    }
    showClaimDetails(find?: string): string {
        localStorage.setItem("find", find);
        let html: string = "";
        this.claimDetails.forEach((cd) => {
            html += cd.asHtml(find);
        });
        if (html.length > 0)
            html = `
                <div class="is-size-4">七、报销业务所需材料与注意事项</div>
                <table class="table is-bordered is-striped is-hoverable is-narrow">
                <tr><th>业务类别</th><th>序号</th><th>事项</th><th>所需材料</th><th>注意事项</th></tr>
                ${html}
                </table>`;
        return html;
    }
    asHtml(find?: string, findClass = "find"): string {
        return this.docItems.map(doc => doc.asHtml(find, findClass)).join("\r") + this.showClaimDetails(find); 
            //+"<p>" + this.devKeyWords.join("、") + "</p>";
    }
    async py2Words(py: string): Promise<string[]> {
        let result = [];
        if (py) {
            let findRE = new RegExp('^' + py, "i");
            result = this.keyWords.filter(k => k[0].match(findRE)).map(k => k[1]);
        }
        return result;
    }
}

