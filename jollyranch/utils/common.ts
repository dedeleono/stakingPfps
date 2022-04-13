export function chunks<T>(array: T[], size: number): T[][] {
    return Array.apply(
        0,
        new Array(Math.ceil(array.length / size))
    ).map((_, index) => array.slice(index * size, (index + 1) * size));
}

export function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
