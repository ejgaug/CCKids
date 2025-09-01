import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { RootStackParamList } from '../../App';
import { animalList } from '../../assets/animalList';
import { StackScreenProps } from '@react-navigation/stack';
import AnimalCard from '../helpers/AnimalCard';
import { FlatList } from 'react-native-gesture-handler';

interface Animal {
  name: string;
  wiki_page: string;
  fun_fact: string;
  home: string[];
  food: string[];
  alt_name: string;
  group: string;
  colors: string[];
  size: string;
  movement: string;
  sound: string;
}

type Props = StackScreenProps<RootStackParamList, 'Zoo'>;

const ZooScreen: React.FC<Props> = ({ navigation }) => {

    const handleCardPress = (animal: Animal) => {
        navigation.navigate('Play', { animal })
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: 'transparent' }]}>
            <FlatList
                data={animalList}
                renderItem={({ item }) => <AnimalCard animal={item} onPress={() => handleCardPress(item)} />}
                keyExtractor={(item) => item.name}
                numColumns={2}
                contentContainerStyle={{ padding: 10 }}
                initialNumToRender={20}
                indicatorStyle='white'
            />
        </View>
    );
};

export default ZooScreen;