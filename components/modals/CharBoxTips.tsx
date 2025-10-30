import React from 'react';
import { View, Text } from 'react-native';
import { colors, appFont } from '../styles/globalStyles';
import { Animal } from '../types';

// Define props interface for CharBoxTips component
interface CharBoxTipsProps {
    characteristic: string; // The characteristic to display (e.g., 'Group', 'Size')
    animal: Animal; // Correct animal object
    charIndex: number; // Index of characteristic for rendering
    hasGuess: boolean; // Whether a guess exists for the current page
    displayValue: string | string[]; // The display value (either characteristic or actual value)
}

// CharBoxTips component provides tooltip content for CharBoxes
const CharBoxTips: React.FC<CharBoxTipsProps> = ({ characteristic, animal, charIndex, hasGuess, displayValue }) => {
    // Get description for group of animal
    const getGroupDescription = (displayVal: string) => {
        switch (displayVal) {
            case 'Mammal':
                return 'This is a warm-blooded animal with hair or fur. Their young get nutrients from their mothers milk. All give birth to live young, except Platypuses and Echidnas.';
            case 'Invertebrate':
                return 'This is a cold-blooded animal that does not have a backbone. Most invertebrates lay eggs. Some examples are insects, snails, octopus, starfish, and worms.';
            case 'Fish':
                return 'This is a cold-blooded animal that lives completely in the water. Fish have gills and fins and most species lay eggs.';
            case 'Bird':
                return 'This is a warm-blooded animal with feathers, wings, and a beak. Most birds can fly and all lay eggs.';
            case 'Reptile':
                return 'This is a cold-blooded animal with scaly skin. Most reptiles lay soft-shelled eggs on land. Snakes, Lizards, Crocodilians, Turtles, and Tortoises are all reptiles.';
            case 'Amphibian':
                return 'This is a cold-blooded animal with permeable skin. Most amphibians have a gill-breathing, water-living larval stage followed by a lung-breathing adult stage. Frogs, Toads, Newts, and Salamanders are all amphibians.';
            default:
                return characteristic; // Fallback
        }
    }

    // Get description for size of animal
    const getSizeDescription = (displayVal: string) => {
        switch (displayVal) {
            case 'Very Tiny':
                return 'Animals like Ladybugs, Flies, and Bees are considered very tiny.';
            case 'Tiny':
                return 'Animals like Mice, Spiders, and Frogs are considered tiny.';
            case 'Small':
                return 'Animals like Cats, Ravens, and Chameleons are considered small.';
            case 'Medium':
                return 'Animals like Dogs, Pelicans, and Baboons are considered medium.';
            case 'Big':
                return 'Animals like Tigers, Komodo Dragons, and Emus are considered big.';
            case 'Huge':
                return 'Animals like Cows, Crocodiles, and Orcas are considered huge.';
            case 'Giant':
                return 'Animals like Elephants, Whale Sharks, and Hippopotamuses are considered giant.';
            default:
                return characteristic; // Fallback
        }
    }

    // Get description for movement of animal
    const getMovementDescription = (displayVal: string) => {
        switch (displayVal) {
            case '0 Legs':
                return 'This animal has no legs. It either slithers like a snake, crawls like a worm, or has a foot like a clam or slug.';
            case '2 Legs':
                return 'This animal primarily walks on 2 legs.';
            case '4 Legs':
                return 'This animal walks on 4 legs.';
            case '5-6 Legs':
                return 'This animal moves using 5 legs like a starfish or 6 legs like an insect.';
            case '8 Legs':
                return 'This animal moves using 8 limbs like octopuses and arachnids.';
            case '10+ Legs':
                return 'This animal moves using 10 or more limbs like centipededs and squids.';
            case 'Wings':
                return 'This animal primarily uses their wings to move by flying or swimming (like a penguin).';
            case 'Fins/Flippers':
                return 'This animal moves using fins like a fish or flippers like a marine mammal.';
            default:
                return characteristic; // Fallback
        }
    }
    
    // Define tooltip content for each characteristic and its value
    const getTooltipContent = () => {
        const key = characteristic.toLowerCase();
        const formattedValue = Array.isArray(displayValue) ? displayValue.join(', ') : displayValue;

        const tooltipText: { [key: string]: { title: string; description: string } } = {
            Group: {
                title: 'Group',
                description: 'This tells us what kind of animal it is. The options are mammal, reptile, bird, invertebrate, fish, or amphibian.'
            },
            'Group Characteristics': {
                title: `Group: ${formattedValue}`,
                description: getGroupDescription(displayValue.toString())
            },
            Size: {
                title: 'Size',
                description: 'This describes how big the animal is.\nScale: Very Tiny, Tiny, Small, Medium, Big, Huge, Giant'
            },
            'Size Characteristics': {
                title: `Size: ${formattedValue}`,
                description: getSizeDescription(displayValue.toString())
            },
            Colors: {
                title: 'Colors',
                description: 'This is the color of the animal, like red, blue, green, or many colors mixed together.'
            },
            'Colors Characteristics': {
                title: `Colors: ${formattedValue}`,
                description: `The animal has the color(s): ${formattedValue}.`
            },
            Food: {
                title: 'Food',
                description: 'This tells us what the animal eats. The options are meat, plants, plankton, or nectar. Some eat both meat and plants!'
            },
            'Food Characteristics': {
                title: `Food: ${formattedValue}`,
                description: `The animal eats ${formattedValue}.`
            },
            Movement: {
                title: 'Movement',
                description: 'This shows how the animal moves, like walking with 2 legs, 5-6 legs, flying with wings, swimming with fins, or even no legs at all!'
            },
            'Movement Characteristics': {
                title: `Movement: ${formattedValue}`,
                description: getMovementDescription(displayValue.toString())
            },
            Habitat: {
                title: 'Habitat',
                description: 'This is where the animal lives, like jungles, wetlands (lakes and rivers), deserts, cities (near people), etc.'
            },
            'Habitat Characteristics': {
                title: `Habitat: ${formattedValue}`,
                description: `The animal lives ${formattedValue}.`
            }
        };

        const contentKey = hasGuess ? `${characteristic} Characteristics` : characteristic;
        const { title, description } = tooltipText[contentKey] || { title: characteristic, description: 'No description available.' };

        return (
            <View>
                <Text style={{ color: colors.green1, fontFamily: appFont, fontSize: 22, fontWeight: 'bold' }}>{title}</Text>
                <Text style={{ color: colors.green1, fontFamily: appFont, fontSize: 20 }}>{description}</Text>
            </View>
        );
    };

    return getTooltipContent();
};

export default CharBoxTips;