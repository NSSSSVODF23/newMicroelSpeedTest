import jwtDecode from "jwt-decode";

export function deepCopy(object: Object) {
    return JSON.parse(JSON.stringify(object));
}

export function reduceToStringObject(prev: { [key: string]: string | undefined }, curr: [string, string | undefined]) {
    prev[curr[0]] = curr[1]
    return prev;
}

export function decodeJWT(token: string) {
    return jwtDecode<any>(token);
}
