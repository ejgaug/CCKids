import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles, colors, screenDimensions, appFont } from '../styles/globalStyles';
import { RFValue } from 'react-native-responsive-fontsize';

interface CharBoxesProps {
    characteristic: string;
    animal: {
        group: string;
        size: string;
        colors: string[];
        food: string[];
        movement: string;
        home: string[];
    };
    charIndex: number;
}

const CharBoxes: React.FC<CharBoxesProps> = ({ characteristic, animal, charIndex }) => {
    
    const getCharacteristicsValue = (trait: string) => {
        const key = trait.toLowerCase();
        const value = (animal as any)[key];
        return Array.isArray(value) ? value.join(', ') : value || 'N/A';
    }

    return (
        <TouchableOpacity
            style={{
                flex: 1,
                height: screenDimensions.screenHeight * 0.08,
                width: screenDimensions.screenWidth * 0.78,
                backgroundColor: colors.tan,
                borderRadius: 20,
                padding: 8,
                marginBottom: 10,
                borderWidth: 3,
                borderColor: colors.green1,
                justifyContent: 'center',
                alignItems: 'center',
            }}	
            onPress={() => console.log(`${characteristic} clicked`)}
        >
            <Text
                style={{
                    fontFamily: appFont,
                    fontSize: 24,
                    color: colors.green1,
                    textAlign: 'center'
                }}
                numberOfLines={2}
                adjustsFontSizeToFit
            >
                {characteristic}: {getCharacteristicsValue(characteristic)}
            </Text>

        </TouchableOpacity>
    );
};

export default CharBoxes;