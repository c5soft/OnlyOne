import {strToUtf8,utf8ToStr} from "../utils/base16"
let str="{汉字}",bytes="8268521a764e1984"
console.log(str,"=>",strToUtf8(str))
console.log(bytes,"=>",utf8ToStr(bytes))