import { Animal } from "../types";

// Define MatchType for comparison results
type MatchType = 'full' | 'partial' | 'none';

// Comparison logic function for characteristics
const CompareLogic = (characteristic: string, guessedAnimal: Animal | undefined, correctAnimal: Animal): MatchType => {
    // Handle undefined guessedAnimal
    if (!guessedAnimal) {
        console.log(`${characteristic}: No guessed animal, returning 'none'`); // Log no guess
        return 'none';
    }

    const key = characteristic.toLowerCase(); // Normalize characteristic key
    const guessedValue = (guessedAnimal as any)[key]; // Get guessed value
    const correctValue = (correctAnimal as any)[key]; // Get correct value

    // console.log(`${characteristic}: Guessed = ${guessedValue}, Correct = ${correctValue}`); // Log values

    // Group comparison: exact match
    if (key === 'group') {
        return guessedValue === correctValue ? 'full' : 'none';
    }

    // Size comparison: full for exact, partial for adjacent, none otherwise
    if (key === 'size') {
        const sizes = ['Very Tiny', 'Tiny', 'Small', 'Medium', 'Big', 'Huge', 'Giant'];
        const guessedIndex = sizes.indexOf(guessedValue);
        const correctIndex = sizes.indexOf(correctValue);
        if (guessedIndex === correctIndex) return 'full';
        if (Math.abs(guessedIndex - correctIndex) === 1) return 'partial';
        return 'none';
    }

    // Colors, Food, Habitat comparison: full for exact set, partial for overlap, none for no overlap
    if (key === 'colors' || key === 'food' || key === 'habitat') {
        const guessedSet = new Set(guessedValue);
        const correctSet = new Set(correctValue);
        const intersection = new Set([...guessedSet].filter(x => correctSet.has(x)));

        if (intersection.size === correctSet.size && intersection.size === guessedSet.size) {
            return 'full';
        }
        if (intersection.size > 0) {
            return 'partial';
        }
        return 'none';
    }

    // Movement comparison: full for exact, partial if both include 'legs', none otherwise
    if (key === 'movement') {
        if (guessedValue === correctValue) return 'full';
        const bothHaveLegs = guessedValue.toLowerCase().includes('legs') && correctValue.toLowerCase().includes('legs');
        return bothHaveLegs ? 'partial' : 'none';
    }

    return 'none'; // Default case
};

export default CompareLogic;