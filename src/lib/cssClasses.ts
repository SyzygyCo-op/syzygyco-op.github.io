export function combineClasses(
    ...classes: (string | null | undefined)[]
): string {
    return classes.filter(str => str && str.length > 0).join(' ')
}