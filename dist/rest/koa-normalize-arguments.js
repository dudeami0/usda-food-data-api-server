export function splitNumber(input) {
    input = split(input);
    return input.map((s) => Number(s)).filter((n) => !isNaN(n));
}
export function split(input) {
    if (input === undefined) {
        return [];
    }
    return [input]
        .flat()
        .map((s) => s.split(","))
        .flat()
        .map((s) => s.trim());
}
//# sourceMappingURL=koa-normalize-arguments.js.map