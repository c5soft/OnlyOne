class FeeStdItem {
    sn: string;
    city: string;
    currency: string;
    hotel: number;
    eating: number;
    other: number;
    constructor(sn: string, city: string, currency: string, hotel: number, eating: number, other: number) {
        this.sn = sn;
        this.city = city;
        this.currency = currency;
        this.hotel = hotel;
        this.eating = eating;
        this.other = other;
    }
}


class GlobalFeeItem {
    contry: string;
    continent: string;
    feeStds: FeeStdItem[];
    constructor(contry: string, continent: string, feeStds: FeeStdItem[]) {
        this.contry = contry;
        this.continent = continent;
        this.feeStds = [...feeStds];
    }
    fineContinent(){
        if (this.contry===this.continent && this.feeStds.length===1) {
            this.contry=this.feeStds[0].sn+'、'+this.contry;
            this.feeStds[0].sn="";
        } 
    }
}


export class GlobalFeeStd {
    private fees: GlobalFeeItem[];
    private keyWords: string[][];
    constructor(feeList: any[], keywords: any[]) {
        this.fees = [];
        feeList.forEach(f => {
            let fee = new GlobalFeeItem(f["国家和地区"], f["洲"], []);
            f["开支标准"].forEach(s => {
                let std = new FeeStdItem(s["序号"], s["城市"], s["币别"], s["住宿费"], s["伙食费"], s["公杂费"]);
                fee.feeStds.push(std);
            })
            fee.fineContinent();
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


        let getMatchFeeStds = function (feeStds: FeeStdItem[]): [boolean, string] {
            let result = "", found = false, isFirst = true, leftPad = "";
            if (feeStds.length > 0) {
                feeStds.forEach(feeStd => {
                    let matchCity = getMatch(feeStd.city);
                    if (matchCity[0]) {
                        found = true;
                    }
                    if (isFirst) {
                        leftPad = ""
                        isFirst = false;
                    } else
                        leftPad = "<tr>";
                    result += leftPad + `<td>${feeStd.sn}</td><td>${matchCity[1]}</td><td>${feeStd.currency}</td><td>${feeStd.hotel||""}</td><td>${feeStd.eating||""}</td><td>${feeStd.other||""}</td></tr>`;
                });
                //result = `<table><tr><th>市县</th><th>一类</th><th>二类</th><th>三类</th><th>旺季标准</th></tr>${result}</table>`;
            }
            return [found, result];
        };
        let html = "";
        let matched = false;
        this.fees.forEach(f => {
            let continentMatch=getMatch(f.continent);
            let contryMatch = getMatch(f.contry);
            let cityMatch = getMatchFeeStds(f.feeStds);
            if (continentMatch[0] || contryMatch[0] || cityMatch[0]) {
                matched = true;
                html = html + `<tr><td rowspan="${f.feeStds.length}">${contryMatch[1]}</td>${cityMatch[1]}`;
            }
        });
        if (matched)
            html = `<table class="table is-bordered is-striped is-hoverable is-narrow"><tr><th>国家和地区</th><th>序号</th><th>城市</th><th>币种</th><th>住宿费</th><th>伙食费</th><th>公杂费</th></tr>${html}</table>`;
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


export async function getJson(fileName: string): Promise<GlobalFeeStd> {
    let resp = await fetch("/doc/" + fileName);
    let json: any = await resp.json();
    let feeList: any[] = json["住宿费伙食费公杂费开支标准"];
    let GlobalFee = new GlobalFeeStd(feeList, json.keyWords);
    return GlobalFee;
}