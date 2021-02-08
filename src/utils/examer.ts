import { base16Encode } from "./base16"
import { Rowset } from "../utils/rowset";
import { rowset2AgGridOptions } from "./agGridUtils";
import { fetchAskData } from "./tools";
import type { GridOptions } from "ag-grid-community";
let caches = {};

async function sleep(s: number) {
    return new Promise((resolve) => setTimeout(resolve, s * 1000));
}
export class OpenedVoucher {
    id: string;
    loaded: boolean;
    options: GridOptions;
    msg: string;
    rowCount: number;
    constructor(id: string) {
        this.id = id;
        this.loaded = false;
        this.options = null;
        this.rowCount = 0;
        this.msg = "稍后...";
    }
    async load() {
        let rowset: Rowset;
        this.loaded = false;
        const cached = caches[this.id];
        if (cached) {
            rowset = cached
        } else {
            let voucher = this.id;
            let queryParams = { voucher };
            let json = await fetchAskData("voucher", queryParams);
            if (json.msg === "ok") {
                rowset = new Rowset(json.data);
                caches[this.id] = rowset;
                this.msg = "";
            } else {
                rowset = null;
                this.msg = json.msg;
            }
        }
        if (rowset) {
            this.rowCount = rowset.rowCount;
            this.options = rowset2AgGridOptions(rowset);
            this.loaded = true;
        }
    }
    style() {
        let style = "";
        let rows = this.rowCount;
        if (rows > 20) rows = 20;
        if (rows > 0)
            style = "height:" + (rows + 3) * 25 + "px";
        return style;

    }
}
export class AboutVoucher {
    id: string;
    zdr?: string; //制单
    fhr?: string; //复核
    cn?: string;  //出纳
    pzrq?: string; //凭证日期
    pzh?: string;  //凭证号
    de?: number;    //大额
    fx?: number;    //付现
    jcjg: string;   //检查结果
    loaded: boolean;
    msg: string;
    myName: string;
    constructor(id: string, myName: string) {
        this.id = id;
        this.myName = myName;
        this.loaded = false;
        this.jcjg = "";
        this.msg = "...";
    }
    isExamed(): boolean {
        return this.fhr && this.fhr.length > 0
    }
    isSelfExamed(): boolean {
        let fhr = this.fhr || "";
        return fhr === this.myName;
    }
    isDisabled():boolean {
        return (this.isExamed() && !this.isSelfExamed()) || this.jcjg.length>0
    }
    isCashed(): boolean {
        return this.cn && this.cn.length > 0;
    }
    shouldBeDeleted(): boolean {
        return this.msg === "凭证号无效"
    }
    tooltipMsg() {
        return this.pzrq + (this.fhr ? " 复核:" + this.fhr : "") +
            (this.cn ? " 出纳:" + this.cn : "") + (this.jcjg ? " 问题:" + this.jcjg : "")

    }
    tooltipClass() {
        return "has-tooltip-arrow" + (this.jcjg ? " has-tooltip-danger" : " has-tooltip-info");
    }
    asHtml() {
        if (this.loaded)
            return `
            <span>${this.pzh}</span>
            <span>${this.zdr}</span>
        `;
        else
            return `
        <span>${this.id}</span>
        <span>${this.msg}</span>
        `;
    }
    parseJson(json: string): boolean {
        let self = this;
        function row2Voucher(data: any): any {
            //console.log(JSON.stringify(data));
            self.msg = data.msg;
            let result = {};
            if (data.msg === "ok")
                data = data.data;
            if (data.rowCount) {
                result = { ...data.rowsObj[0], loaded: true };
                //console.log(result);
            } else {
                self.msg = "凭证号无效";
                result = { loaded: false };
            }
            return result;
        }
        let result = false;
        if (json) {
            try {
                let voucher = row2Voucher(JSON.parse(json));
                let keys = Object.keys(voucher);
                for (let k of keys) {
                    this[k] = voucher[k];
                }
                // console.log(keys);
                // console.log(voucher);
                // console.log(this);
                this.loaded = voucher.loaded;
                if (this.loaded)
                    this.msg = "";
            } catch (error) {
                this.msg = "获取凭证信息失败，无法连接服务器";
            }
            result = this.loaded;
        }
        return result;
    }
    async getAbout() {
        let params = JSON.stringify({ pznm: this.id });
        let qs = "ask=@aboutvoucher&params=" + base16Encode(params);
        let url = "/api/ask?" + qs;
        try {
            let response = await fetch(url);
            let json = await response.text();
            this.parseJson(json);
            return this;
        } catch (error) {
            this.msg = JSON.stringify(error);
        }
        return this;
    }

}