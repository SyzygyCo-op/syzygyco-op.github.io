
export function randomRange(from: number, to: number): number {
    const range = to - from
    const amount = Math.random() * range
    return amount + from
}

export function random(amount: number, allowNegative: boolean = true, rounded: boolean = true): number {
    const sample = allowNegative ? randomRange(-amount, amount) : randomRange(0, amount)
    return rounded ? Math.round(sample) : sample
}