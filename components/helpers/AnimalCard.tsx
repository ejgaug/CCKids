import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Text, TouchableOpacity } from "react-native";
import { RootStackParamList } from "../../App";
import { appFont, colors, screenDimensions } from "../styles/globalStyles";

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

interface AnimalCardProps {
    animal: Animal;
    onPress: () => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ onPress }) => {
    const blurryImage = require('../../assets/blurredPic.png')

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: screenDimensions.screenWidth * 0.35,
                height: 100,
                marginHorizontal: 12,
                marginVertical: 8,
                borderRadius: 18,
                borderWidth: 4,
                borderColor: colors.green1,
                backgroundColor: colors.green2,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={{ fontFamily: appFont, fontSize: 60, color: colors.green3 }}>?</Text>
        </TouchableOpacity>
    );
};

export default AnimalCard;