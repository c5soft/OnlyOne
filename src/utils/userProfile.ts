import { base16Encode } from "./base16"

export class UserProfile {
    appName: string;
    logined: boolean;
    userName: string;
    userId: string;
    userRights: string;
    password: string;
    homePage: string;
    msg: string;
    defaultVoucherType: string;
    constructor(appName: string) {
        this.appName = appName;
        this.init();
    }
    init() {
        this.logined = false;
        this.userName = "";
        this.userId = "";
        this.password = "";
        this.homePage = "/";
        this.msg = "";
        this.userRights = "";
        this.defaultVoucherType = "02";
    }
    userRightCheck(operRight: string = ""): boolean {
        return operRight ? this.userRights.indexOf(operRight) >= 0 : true;
    }
    parseJson(json: string, forLogin: boolean = false): boolean {
        let self = this;
        function row2User(data: any): any {
            //console.log(JSON.stringify(data));
            self.msg = data.msg;
            let result: any = {};
            if (data.msg === "ok")
                data = data.data;
            if (data.rowCount) {
                result = { ...data.rowsObj[0], logined: true };
            } else {
                self.msg = "提供的资料无法通过系统认证,请重新输入！";
                result = {
                    logined: false,
                    userId: "",
                    userName: ""
                };
            }
            return result;
        }
        let result = false;
        if (json) {
            try {
                let profile: any = JSON.parse(json);
                if (forLogin) profile = row2User(profile);
                let keys = Object.keys(profile);
                for (let k of keys) {
                    this[k] = profile[k];
                }
                this.homePage = this.logined ? "/workloadoper" : "/";
            } catch (error) {
                this.msg = "登录失败，无法连接服务器";
                this.logined = false;
            }
            result = this.logined;
        }
        return result;
    }
    async load(): Promise<UserProfile> {
        let json = localStorage.getItem(this.appName + ".userProfile");
        //console.log(json);
        this.parseJson(json);
        return this;
    }
    async save(): Promise<boolean> {
        let json = JSON.stringify(this);
        localStorage.setItem(this.appName + ".userProfile", json);
        return true;
    }
    async login(userId: string, password: string, captcha: string): Promise<UserProfile> {
        let params = JSON.stringify({ userId, password, captcha });
        let qs = "ask=@login&params=" + base16Encode(params);
        let url = "/api/ask?" + qs;
        try {
            let response = await fetch(url);
            let json = await response.text();
            if (this.parseJson(json, true))
                await this.save()
            return this;
        } catch (error) {
            this.msg = "登录失败，无法连接服务器：" + error;
            this.logined = false;
            return this;
        }
    }
    async logout(): Promise<UserProfile> {
        this.init();
        await this.save()
        return this;
    }
    asHtml(displayDefaultVoucherType: boolean = true): string {
        return `<p>登录码:${this.userId} 姓名:${this.userName}` +
            (displayDefaultVoucherType ? " 默认凭证类型:" + this.defaultVoucherType : "")+"</p>";
    }
}
