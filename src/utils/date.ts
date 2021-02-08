export const daysOfWeek = [
    ['星期日', '日'],
    ['星期一', '一'],
    ['星期二', '二'],
    ['星期三', '三'],
    ['星期四', '四'],
    ['星期五', '五'],
    ['星期六', '六']
];

export const monthsOfYear = [
    ['一月', 'Jan'],
    ['二月', 'Feb'],
    ['三月', 'Mar'],
    ['四月', 'Apr'],
    ['五月', 'May'],
    ['六月', 'Jun'],
    ['七月', 'Jul'],
    ['八月', 'Aug'],
    ['九月', 'Sep'],
    ['十月', 'Oct'],
    ['十一月', 'Nov'],
    ['十二月', 'Dec']
];

export function formatDate(date: Date, fmt: string) {
    const o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return fmt;
}
export function datePlusDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}