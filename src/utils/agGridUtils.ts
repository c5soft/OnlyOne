import {formatMoney} from "./formatMoney";
import type {Rowset} from "./rowset";
import type {GridOptions, ValueFormatterParams} from "ag-grid-community";

export function rowset2AgGridOptions(rowset: Rowset): GridOptions {
    function currencyFormatter(params: ValueFormatterParams) {
        return formatMoney(params.value);
    }

    return rowset ? {
        enableRangeSelection: true,
        columnDefs: rowset.columns.map((c, i) => ({
            headerName: c.name,
            field: rowset.rowIsObj ? c.name : i.toString(),
            valueFormatter: c.type === "money" ? currencyFormatter : undefined,
            type: (c.type === "money") || (c.type === "int") ? "numericColumn" : undefined,
            resizable: true
        })),
        rowData: rowset.rowIsObj ? rowset.rowsObj : rowset.rows,
    } : null;
}