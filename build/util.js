/**
 * 날자 한국 포맷 변경
 * @param date
 * @returns
 */
export function dateToString(date) {
    return (date.getFullYear() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        date.getDate().toString().padStart(2, "0"));
}
export function upDateToString(date) {
    if (date.getHours() >= 12) {
        return dateToString(date);
    }
    else {
        date.setDate(date.getDate() - 1);
        return dateToString(date);
    }
}
export function CalcNowDate(year, month, day) {
    const date = nowKrDate();
    date.setFullYear(date.getFullYear() + year, date.getMonth() + month, date.getDate() + day);
    return date;
}
export function nowKrDate() {
    // utc 시간
    const utc = new Date(); //curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    // kst 시간
    const kst = new Date(utc.getFullYear(), utc.getMonth(), utc.getDate(), utc.getHours(), utc.getMinutes(), utc.getSeconds());
    return utc;
}
export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
