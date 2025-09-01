import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { globalStyles, colors, screenDimensions } from '../styles/globalStyles';
import { RootStackParamList } from '../../App';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import CharBoxes from '../helpers/CharBoxes';
import SearchComp from '../helpers/SearchComp';
import FilterModal from '../modals/FilterModal';

type PlayScreenProps = StackScreenProps<RootStackParamList, 'Play'>;

const PlayScreen: React.FC<PlayScreenProps> = ({ route, navigation }) => {
    const { animal } = route.params;
    const characteristics = ['Group', 'Size', 'Colors', 'Food', 'Movement', 'Home'];
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={[globalStyles.container, { backgroundColor: 'transparent' }]}>
                <SearchComp setModalVisible={setFilterModalVisible}/>
                <View style={{ marginTop: 5, paddingHorizontal: 18 }}>
                    {characteristics.map((characteristic, index) => (
                        <CharBoxes
                            key={index}
                            characteristic={characteristic}
                            animal={animal}
                            charIndex={index}
                        />
                    ))}
                </View>
                <FilterModal setModalVisible={setFilterModalVisible} modalVisible={filterModalVisible}/>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default PlayScreen;