
    
export function similarity(
    a: string,
    b: string,
    caseSensitive: boolean = false,
): number {
    if (caseSensitive) {
        return jaroWinkler(a, b);
    } else {
        return jaroWinkler(a.toLocaleLowerCase(), b.toLocaleLowerCase());
    }
}

/**
 * https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 */
function jaro(a: string, b: string): number {
    if (a === b) return 1.0;
    const maxDist = Math.floor(Math.max(a.length, b.length) / 2.0) - 1;
    let match = 0;
    const hashA = Array(a.length).fill(0);
    const hashB = Array(b.length).fill(0);
    for (let i = 0; i < a.length; i++) {
        for (
            let j = Math.max(0, i - maxDist);
            j < Math.min(b.length, i + maxDist + 1);
            j++
        ) {
            if (a[i] === b[j] && hashB[j] === 0) {
                hashA[i] = 1;
                hashB[j] = 1;
                match++;
                break;
            }
        }
    }
    if (match === 0) {
        return 0;
    }

    let transpositions = 0;
    let point = 0;
    for (let i = 0; i < a.length; i++) {
        if (hashA[i]) {
            while (hashB[point] === 0) {
                point++;
            }
            if (a[i] !== b[point++]) {
                transpositions++;
            }
        }
    }
    transpositions /= 2.0;
    return (
        (match / a.length +
            match / b.length +
            (match - transpositions) / match) /
        3.0
    );
}

/**
 * https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 */
function jaroWinkler(a: string, b: string): number {
    let distance = jaro(a, b);
    if (distance > 0.7) {
        let prefix = 0;
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] === b[i]) {
                prefix++;
            } else {
                break;
            }
        }

        prefix = Math.min(4, prefix);
        distance += 0.1 * prefix * (1 - distance);
    }
    return distance;
}