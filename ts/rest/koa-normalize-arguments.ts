export function splitNumber(input: string[] | string | undefined) {
    input = split(input);
    return input.map((s) => Number(s)).filter((n) => !isNaN(n));
}

export function split(input: string[] | string | undefined) {
    if (input === undefined) {
        return [];
    }
    return [input]
        .flat()
        .map((s) => s.split(","))
        .flat()
        .map((s) => s.trim());
}
