import { TouchableOpacity, View, Text } from "react-native";
import Modal from "react-native-modal";
import { colors, screenDimensions } from "../styles/globalStyles";
import { Ionicons } from '@expo/vector-icons';

interface FilterModalProps {
    setModalVisible: (newValue: boolean) => void;
    modalVisible: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({ setModalVisible, modalVisible }) => {
    return (
        <Modal 
            isVisible={modalVisible}
            animationIn={"pulse"}   
            animationOut={"pulse"}
            backdropOpacity={0.2}
            style={{
                justifyContent: 'center',
                alignItems: 'center'
            }} 
        >
            <View
                style={{
                    backgroundColor: colors.tan,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: colors.green1,
                    width: screenDimensions.screenWidth * 0.8,
                    height: screenDimensions.screenHeight * 0.4,
                    padding: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 6,
                        right: 7,
                    }}
                    onPress={() => setModalVisible(false)}
                >
                    <Ionicons name="close" size={30} color={colors.green1} />
                </TouchableOpacity>
                <Text>
                    Hello World
                </Text>
            </View>
        </Modal> 
    );
}

export default FilterModal;