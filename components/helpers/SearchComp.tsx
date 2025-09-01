import { TextInput, TouchableOpacity, View } from "react-native"
import { colors, screenDimensions } from "../styles/globalStyles"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchCompProps {
    setModalVisible: (newValue: boolean) => void;
}

const SearchComp: React.FC<SearchCompProps> = ({ setModalVisible }) => {


    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'absolute',
                top: 10
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tan, borderRadius: 16 }}>
                <TextInput
                    style={{
                        width: screenDimensions.screenWidth * 0.8,
                        height: 46,
                        paddingLeft: 14,
                        paddingRight: 35, // Space for icon
                        fontSize: 26,
                        color: colors.green1,
                        fontFamily: 'WalterTurncoat_400Regular',
                        borderWidth: 2,
                        borderColor: colors.green1,
                        borderRadius: 16,
                    }}
                    autoCorrect={false}
                    placeholder="Guess Here..."
                    placeholderTextColor={colors.green1}
                    returnKeyLabel="go"
                />
                <Ionicons
                    name="search-sharp"
                    color={colors.green1}
                    size={35}
                    style={{
                        position: 'absolute',
                        right: 8,
                        opacity: 0.3
                    }}
                />
            </View>
            <TouchableOpacity
                style={{
                    backgroundColor: colors.tan,
                    borderRadius: 16,
                    width: 46,
                    height: 46,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: colors.green1,
                    borderWidth: 2
                }}
            >
                <MaterialCommunityIcons 
                    name="filter-outline" 
                    color={colors.green1} 
                    size={35} 
                    onPress={() => setModalVisible(true)}    
                />
            </TouchableOpacity>
        </View>
    );
};

export default SearchComp;