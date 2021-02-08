class FeeStdBase {
    city: string;
    class1: number;
    class2: number;
    class3: number;
    constructor(city: string, class1: number, class2: number, class3: number) {
        this.city = city;
        this.class1 = class1;
        this.class2 = class2;
        this.class3 = class3;
    }
}

class FeeStdHot extends FeeStdBase {
    period: string;
    constructor(city: string, period: string, class1: number, class2: number, class3: number) {
        super(city, class1, class2, class3);
        this.period = period;
    }
}

class FeeStd extends FeeStdBase {
    hots: FeeStdHot[];
    constructor(city: string, class1: number, class2: number, class3: number, hots: FeeStdHot[]) {
        super(city, class1, class2, class3);
        this.hots = [...hots];
    }
}

class HotelFeeItem {
    no: number;
    area: string;
    feeStds: FeeStd[];
    constructor(no: number, area: string, feeStds: FeeStd[]) {
        this.no = no;
        this.area = area;
        this.feeStds = [...feeStds];
    }
}


export class HotelFeeStd {
    private fees: HotelFeeItem[];
    private keyWords: string[][];
    constructor(feeList: any[], keywords: any[]) {
        this.fees = [];
        feeList.forEach(f => {
            let fee = new HotelFeeItem(f["序号"], f["地区"], []);
            f["住宿标准"].forEach(s => {
                let std = new FeeStd(s["市县"], s["一类"], s["二类"], s["三类"], []);
                s["旺季标准"].forEach(h => {
                    let hot = new FeeStdHot(h["市县"], h["期间"], h["一类"], h["二类"], h["三类"]);
                    std.hots.push(hot);
                });
                fee.feeStds.push(std);
            })
            this.fees.push(fee);
        });
        this.keyWords = [...keywords];
    }
    asHtml(find?: string, findClass = "find"): string {
        let findRE = find ? new RegExp(find, "g") : null;
        let getMatch = function (info: string): [boolean, string] {
            if (findRE) {
                if (findRE.test(info))
                    return [true, info.replace(findRE, "<span class='" + findClass + "'>$&</span>")];
                else
                    return [false, info];
            } else
                return [true, info];
        };

        let getMatchHotStds = function (hots: FeeStdHot[]): [boolean, string] {
            let result = "", found = false;
            if (hots.length > 0) {
                hots.forEach(hotStd => {
                    let match = getMatch(hotStd.city);
                    if (match[0]) found = true;
                    result += `<tr><td>${match[1]}</td><td>${hotStd.period}</td><td>${hotStd.class1}</td><td>${hotStd.class2}</td><td>${hotStd.class3}</td></tr>`;
                });
                result = `<table class="table is-bordered is-striped is-hoverable is-narrow"><tr><th>市县</th><th>期间</th><th>一类</th><th>二类</th><th>三类</th></tr>${result}</table>`;
            }
            return [found, result];
        };

        let getMatchFeeStds = function (feeStds: FeeStd[]): [boolean, string] {
            let result = "", found = false, isFirst = true, leftPad = "";
            if (feeStds.length > 0) {
                feeStds.forEach(feeStd => {
                    let matchHot = getMatchHotStds(feeStd.hots);
                    let matchCity = getMatch(feeStd.city);
                    if (matchCity[0] || matchHot[0]) {
                        found = true;
                    }
                    if (isFirst) {
                        leftPad = ""
                        isFirst = false;
                    } else
                        leftPad = "<tr>";
                    result += leftPad + `<td style="max-width:400px">${matchCity[1]}</td><td>${feeStd.class1}</td><td>${feeStd.class2}</td><td>${feeStd.class3}</td><td>${matchHot[1]}</td></tr>`;
                });
                //result = `<table><tr><th>市县</th><th>一类</th><th>二类</th><th>三类</th><th>旺季标准</th></tr>${result}</table>`;
            }
            return [found, result];
        };
        let html = "";
        let matched = false;
        this.fees.forEach(f => {
            let areaMatch = getMatch(f.area);
            let cityMatch = getMatchFeeStds(f.feeStds);
            if (areaMatch[0] || cityMatch[0]) {
                matched = true;
                html = html + `<tr><td rowspan="${f.feeStds.length}">${f.no}</td><td rowspan="${f.feeStds.length}">${areaMatch[1]}</td>${cityMatch[1]}`;
            }
        });
        if (matched)
            html = `<table class="table is-bordered is-striped is-hoverable is-narrow"><tr><th>序号</th><th>地区</th><th>市县</th><th>一类</th><th>二类</th><th>三类</th><th>旺季标准</th></tr>${html}</table>`;
        else
            html = "";
        return html;
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


export async function getJson(fileName: string): Promise<HotelFeeStd> {
    let resp = await fetch("/doc/" + fileName);
    let json: any = await resp.json();
    let feeList: any[] = json["差旅住宿费标准明细表"];
    let hotelFee = new HotelFeeStd(feeList, json.keyWords);
    return hotelFee;
}