/**
 * Utility for generating formal Order IDs
 * 
 * Format: PREFIX + YYMMDD + 4-Digit Random
 * Example: SPT2401284932
 */

export function generateOrderId(prefix: string = 'SPT'): string {
    // 1. Get current date
    const now = new Date();

    // 2. Format Year (YY)
    // slice(-2) takes the last 2 digits of the year (e.g., 2024 -> 24)
    const year = now.getFullYear().toString().slice(-2);

    // 3. Format Month (MM)
    // getMonth() returns 0-11, so we add 1. 
    // padStart(2, '0') ensures it's always 2 digits (e.g., 5 -> 05)
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // 4. Format Day (DD)
    const day = now.getDate().toString().padStart(2, '0');

    // 5. Generate Random Sequence (4 Digits)
    // Math.random() generates 0.0 to 1.0
    // We multiply by 10000 to get a number between 0 and 9999
    // Math.floor rounds down
    // padStart(4, '0') ensures 0 -> 0000, 123 -> 0123
    const randomSequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // 6. Assemble the ID
    return `${prefix}${year}${month}${day}${randomSequence}`;
}
