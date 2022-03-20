export function countDecimals(input: string): number {
    if (input.indexOf(".") === -1) return 0;
    return (input && input.split(".")[1].length) || 0;
}
