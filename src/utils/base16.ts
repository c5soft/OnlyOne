function stringToBytes(info: string): Uint8Array {
    let result: number[] = [];
    let size = info.length;

    for (let index = 0; index < size; index++) {
        let point = info.charCodeAt(index)

        if (point >= 0xD800 && point <= 0xDBFF && size > index + 1) {
            let second = info.charCodeAt(index + 1)

            if (second >= 0xDC00 && second <= 0xDFFF) {
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                point = (point - 0xD800) * 0x400 + second - 0xDC00 + 0x10000
                index += 1
            }
        }

        // US-ASCII
        if (point < 0x80) {
            result.push(point)
            continue
        }

        // 2-byte UTF-8
        if (point < 0x800) {
            result.push((point >> 6) | 192)
            result.push((point & 63) | 128)
            continue
        }

        // 3-byte UTF-8
        if (point < 0xD800 || (point >= 0xE000 && point < 0x10000)) {
            result.push((point >> 12) | 224)
            result.push(((point >> 6) & 63) | 128)
            result.push((point & 63) | 128)
            continue
        }

        // 4-byte UTF-8
        if (point >= 0x10000 && point <= 0x10FFFF) {
            result.push((point >> 18) | 240)
            result.push(((point >> 12) & 63) | 128)
            result.push(((point >> 6) & 63) | 128)
            result.push((point & 63) | 128)
            continue
        }

        // Invalid character
        result.push(0xEF, 0xBF, 0xBD)
    }
    return new Uint8Array(result);
}

function bytesToString(bytes: Uint8Array): string {
    const size = bytes.length

    let result = ''

    for (let index = 0; index < size; index++) {
        let byte1 = bytes[index]

        // US-ASCII
        if (byte1 < 0x80) {
            result += String.fromCodePoint(byte1)
            continue
        }

        // 2-byte UTF-8
        if ((byte1 & 0xE0) === 0xC0) {
            let byte2 = (bytes[++index] & 0x3F)
            result += String.fromCodePoint(((byte1 & 0x1F) << 6) | byte2)
            continue
        }

        if ((byte1 & 0xF0) === 0xE0) {
            let byte2 = (bytes[++index] & 0x3F)
            let byte3 = (bytes[++index] & 0x3F)
            result += String.fromCodePoint(((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3)
            continue
        }

        if ((byte1 & 0xF8) === 0xF0) {
            let byte2 = (bytes[++index] & 0x3F)
            let byte3 = (bytes[++index] & 0x3F)
            let byte4 = (bytes[++index] & 0x3F)
            result += String.fromCodePoint(((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4)
            continue
        }
    }
    return result
}

export function base16Encode(input: string): string {
    let result = "";
    let num: number;
    let hex = "";
    let bytes = stringToBytes(input);
    bytes = bytes.reverse() //***encrypt by reverse
    for (let i = 0; i < bytes.length; i++) {
        num = 0xff - bytes[i]; //***encrypt by bit not
        hex = num.toString(16);
        if (hex.length !== 2) hex = ('0' + hex).slice(-2)
        result += hex;
    }
    return result;
}


export function base16Decode(input: string): string {
    let result = "";
    let bytes: number[] = [];
    for (let i = 0; i < input.length; i += 2) {
        let hex = input.slice(i, i + 2);
        let num = 255 - parseInt(hex, 16); //***decrypt by bit not   
        bytes.push(num)
    }
    bytes.reverse() //***decrypt by reverse
    result = bytesToString(new Uint8Array(bytes));
    return result;
}

export const strToUtf8 = base16Encode;
export const utf8ToStr = base16Decode;


