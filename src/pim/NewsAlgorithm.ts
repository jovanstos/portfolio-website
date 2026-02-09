export function generateNewsValue(): number {
    // Define the possible outcomes
    const values = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

    // Define weights
    const weights = [1, 2, 4, 6, 14, 6, 4, 2, 1];

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < values.length; i++) {
        if (random < weights[i]) {
            return values[i];
        }
        random -= weights[i];
    }

    // Fallback
    return 0;
}
