import { formatMoney } from "./formatMoney";
interface IColumn {
    name: string;
    type: string;
}
export class Rowset {
    rowIsObj: boolean;
    columns: IColumn[];
    rows?: any[];
    rowsObj?: any[];
    rowCount: number;
    constructor(data: any) {
        this.rowIsObj = data.rowIsObj || false;
        this.columns = data.columns || [];
        this.rows = data.rows || [];
        if (this.rowIsObj) {
            this.rowsObj = data.rowsObj || [];
            this.rows = null;
        } else {
            this.rowsObj = null;
            this.rows = data.rows || [];
        }
        this.rowCount = data.rowCount || 0;
    }
    asHtml() {
        function format(val: any, type: string): any {
            let result = val;
            if (type === "money")
                result = formatMoney(result);
            return result;
        }
        let html = "";
        if (this.rowCount > 0) {
            let columns = this.columns.map(c => `<th class="${c.type}">${c.name}</th>`).join("");
            let rows = "";
            if (this.rowIsObj) {
                rows = this.rowsObj.map(obj => "<tr>" + this.columns.map(c => [format(obj[c.name], c.type), c.type])
                    .map(c => `<td class="${c[1]}">${c[0]}</td>`).join("") + "</tr>").join("");
            } else {
                rows = this.rows.map(row => "<tr>" + row.map((c, i) => [format(c, this.columns[i].type), this.columns[i].type])
                    .map(c => `<td class="${c[1]}">${c[0]}</td>`).join("") + "</tr>").join("");
            }
            html += `<table class="table is-bordered is-striped is-hoverable is-narrow"><tr>${columns}</tr>${rows}</table>`;
        }
        return html;
    }
}