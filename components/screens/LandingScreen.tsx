import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { globalStyles, colors, screenDimensions } from '../styles/globalStyles';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { animalList } from '../../assets/animalList';
import DailyDiscovery from '../helpers/DailyDiscovery';

type LandingScreenProps = StackScreenProps<RootStackParamList, 'Landing'>;

const LandingScreen: React.FC<LandingScreenProps> = ({ navigation, route }) => {

    return (
        <View style={globalStyles.container}>
            <DailyDiscovery navigation={navigation} route={route}/>
            <View 
                style={{           
                    flexDirection: 'row',
                }}
            >
                <View style={[globalStyles.buttonBackgrounds, { 
                    top: screenDimensions.screenHeight * 0.205, 
                    right: screenDimensions.screenWidth * 0.142,
                    transform: [{ rotate: '-12deg'}]
                }]}/>
                <TouchableOpacity
                    style={[globalStyles.landingButtons, { 
                        right: screenDimensions.screenWidth * 0.15, 
                        top: screenDimensions.screenHeight * 0.2 
                    }]}
                    onPress={() => navigation.navigate('Zoo')}
                >
                    <Ionicons name="paw-sharp" color={colors.green1} size={50} style={{ transform: [{ rotate: '-10deg' }]}}/> 
                    <Text style={globalStyles.buttonText}>ZOO</Text>
                </TouchableOpacity>
                <View style={[globalStyles.buttonBackgrounds, { 
                    left: screenDimensions.screenWidth * 0.09,
                    top: screenDimensions.screenHeight * 0.226, 
                    transform: [{ rotate: '12deg'}]
                }]}/>
                <TouchableOpacity
                    style={[globalStyles.landingButtons, { 
                        left: screenDimensions.screenWidth * 0.1, 
                        top: screenDimensions.screenHeight * 0.22
                    }]}
                    onPress={() => navigation.navigate('Play', { animal: animalList[0] })}
                >
                    <Ionicons name="play" color={colors.green1} size={50} />
                    <Text style={globalStyles.buttonText}>PLAY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default LandingScreen;