import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import DropDownPicker from "react-native-dropdown-picker";
import { colors, screenDimensions } from "../styles/globalStyles";
import { Ionicons } from '@expo/vector-icons';
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { Animal } from "../types";

interface FilterModalProps {
    setModalVisible: (newValue: boolean) => void;
    modalVisible: boolean;
    onApplyFilters: (filters: { [key: string]: string[] | string | null }) => void;
    correctAnimal: Animal
    currentFilters: { [key: string]: string[] | string | null }
}

const FilterModal: React.FC<FilterModalProps> = ({ setModalVisible, modalVisible, onApplyFilters, correctAnimal, currentFilters }) => {
    const characteristics = ['Group', 'Size', 'Colors', 'Food', 'Movement', 'Habitat'];

    // State to manage open/closed state for each dropdown
    const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>(
        characteristics.reduce((acc, char) => ({ ...acc, [char]: false }), {})
    );
    // State to manage selected values for each dropdown
    const [values, setValues] = useState<{ [key: string]: string[] | string | null }>(currentFilters);

    // set filter values 
    useEffect(() => {
        setValues(currentFilters);
    }, [modalVisible, currentFilters]);

    // clear filters when the correct animal changes
    useEffect(() => {
        handleClearFilters();
    }, [correctAnimal])

    // Close all dropdowns
    const closeAllDropdowns = () => {
        setOpenStates(characteristics.reduce((acc, char) => ({ ...acc, [char]: false }), {}));
    };

    const dropdownOptions = (characteristic: string): { label: string; value: string }[] => {
        const optionsMap: { [key: string]: string[] } = {
            Group: ['Mammal', 'Invertebrate', 'Fish', 'Bird', 'Reptile', 'Amphibian'],
            Size: ['Very Tiny', 'Tiny', 'Small', 'Medium', 'Big', 'Huge', 'Giant'],
            Colors: ['Brown', 'Black', 'White', 'Gray', 'Green', 'Red', 'Yellow', 'Blue', 'Pink', 'Orange', 'Tan', 'Silver', 'Purple', 'Spotted'],
            Food: ['Meat', 'Plants', 'Plankton', 'Nectar'],
            Movement: ['1 Foot', '0 Legs', '2 Legs', '4 Legs', '5-6 Legs', '8 Legs', '10+ Legs', 'Wings', 'Fins/Flippers'],
            Habitat: ['in forests', 'in grasslands', 'in oceans', 'in wetlands', 'in jungles', 'in cities', 'in deserts', 'on mountains', 'on farms', 'in snowy areas'],
        };
        return (optionsMap[characteristic] || []).map((option) => ({
            label: option,
            value: option,
        }));
    };

    // Handle opening/closing dropdowns with explicit Dispatch type
    const handleSetOpen = (characteristic: string): Dispatch<SetStateAction<boolean>> => {
        return (value) => {
            setOpenStates((prev) => ({
                ...characteristics.reduce((acc, char) => ({ ...acc, [char]: false }), {}),
                [characteristic]: typeof value === 'function' ? value(prev[characteristic]) : value,
            }));
        };
    };

    // Handle applying filters
    const handleApplyFilters = () => {
        onApplyFilters(values);
        setModalVisible(false);
        closeAllDropdowns();
    };

    // Handle clearing filters
    const handleClearFilters = () => {
        const clearedValues = characteristics.reduce((acc, char) => ({
            ...acc,
            [char]: char === 'Colors' || char === 'Food' || char === 'Habitat' ? [] : null
        }), {});
        setValues(clearedValues);
        onApplyFilters(clearedValues);
        closeAllDropdowns();
    };

    // Compute display text for multi-select dropdowns
    const getMultipleText = (selectedItems: string[]) => {
        if (!selectedItems || selectedItems.length === 0) return "Select options";
        const maxWidth = screenDimensions.screenWidth * 0.65 * 0.7; // Approximate width for text
        const charWidth = 10; // Average character width in pixels (adjust based on font)
        let displayText = "";
        let currentLength = 0;
        const ellipsis = ", ...";

        for (let i = 0; i < selectedItems.length; i++) {
            const item = selectedItems[i];
            const itemLength = item.length * charWidth;
            const separatorLength = i > 0 ? 2 * charWidth : 0; // ", " for subsequent items

            if (currentLength + itemLength + separatorLength + (i < selectedItems.length - 1 ? ellipsis.length * charWidth : 0) > maxWidth) {
                return displayText + ellipsis;
            }

            displayText += (i > 0 ? ", " : "") + item;
            currentLength += itemLength + separatorLength;
        }
        return displayText;
    };

    return (
        <Modal 
            isVisible={modalVisible}
            animationIn={"pulse"}   
            animationOut={"pulse"}
            backdropOpacity={0.2}
            style={styles.modal}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Animal Filter</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => {
                            setModalVisible(false);
                            closeAllDropdowns();
                        }}
                    >
                        <Ionicons name="close" size={30} color={colors.green1} />
                    </TouchableOpacity>
                </View>
                <View style={styles.separator} />
                <View style={styles.content}>
                    {characteristics.map((characteristic, index) => {
                        const isMultiSelect = characteristic === 'Colors' || characteristic === 'Food' || characteristic === 'Habitat';
                        return (
                            <View key={characteristic} style={styles.row}>
                                <Text style={styles.label}>{`${characteristic}: `}</Text>
                                {isMultiSelect ? (
                                    <DropDownPicker
                                        open={openStates[characteristic]}
                                        value={values[characteristic] as string[]}
                                        items={dropdownOptions(characteristic)}
                                        setOpen={handleSetOpen(characteristic)}
                                        setValue={(callback) => {
                                            setValues((prev) => {
                                                const newValue = callback(prev[characteristic] as string[]);
                                                return {
                                                    ...prev,
                                                    [characteristic]: newValue || [],
                                                };
                                            });
                                            console.log(`${characteristic}: ${values[characteristic]}`);
                                        }}
                                        setItems={() => {}} // No-op for static items
                                        style={styles.dropdown}
                                        textStyle={styles.dropdownText}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        placeholder="Select options"
                                        ArrowDownIconComponent={({ style }) => (
                                            <Ionicons name="chevron-down" size={20} color={colors.green1} style={style} />
                                        )}
                                        ArrowUpIconComponent={({ style }) => (
                                            <Ionicons name="chevron-up" size={20} color={colors.green1} style={style} />
                                        )}
                                        zIndex={10000 - (index * 100)} // Higher zIndex for top dropdowns
                                        zIndexInverse={1000 + (index * 100)} // Lower inverse for bottom dropdowns
                                        multiple={true}
                                        multipleText={getMultipleText(values[characteristic] as string[])}
                                        min={0}
                                    />
                                ) : (
                                    <DropDownPicker
                                        open={openStates[characteristic]}
                                        value={values[characteristic] as string | null}
                                        items={dropdownOptions(characteristic)}
                                        setOpen={handleSetOpen(characteristic)}
                                        setValue={(callback) => {
                                            setValues((prev) => {
                                                const newValue = callback(prev[characteristic] as string | null);
                                                return {
                                                    ...prev,
                                                    [characteristic]: newValue,
                                                };
                                            });
                                            console.log(`${characteristic}: ${values[characteristic]}`);
                                        }}
                                        setItems={() => {}} // No-op for static items
                                        style={styles.dropdown}
                                        textStyle={styles.dropdownText}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        placeholder="Select an option"
                                        ArrowDownIconComponent={({ style }) => (
                                            <Ionicons name="chevron-down" size={20} color={colors.green1} style={style} />
                                        )}
                                        ArrowUpIconComponent={({ style }) => (
                                            <Ionicons name="chevron-up" size={20} color={colors.green1} style={style} />
                                        )}
                                        zIndex={10000 - (index * 100)} // Higher zIndex for top dropdowns
                                        zIndexInverse={1000 + (index * 100)} // Lower inverse for bottom dropdowns
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearFilters}
                    >
                        <Text style={styles.buttonText}>Clear Filters</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApplyFilters}
                    >
                        <Text style={styles.buttonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal> 
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.tan,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.green1,
        width: screenDimensions.screenWidth * 0.85,
        height: screenDimensions.screenHeight * 0.55,
        padding: 16,
        paddingTop: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.green1,
    },
    closeButton: {
        padding: 5,
    },
    separator: {
        height: 2,
        backgroundColor: colors.green1,
        opacity: 0.6,
        marginBottom: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginVertical: 4,
    },
    label: {
        fontSize: 17,
        color: colors.green1,
        width: '35%',
        fontWeight: '500',
    },
    dropdown: {
        flex: 1,
        borderColor: colors.green1,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: colors.tan,
        width: '65%',
        paddingLeft: 4,
    },
    dropdownText: {
        color: colors.green1,
        fontSize: 17,
        fontWeight: '500',
    },
    dropdownContainer: {
        borderColor: colors.green1,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: colors.tan,
        width: '65%',
    },
    applyButton: {
        backgroundColor: colors.green1, // Dark green
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 10,
        alignSelf: 'center',
    },
    clearButton: {
        backgroundColor: colors.green1, // Dark green
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: colors.tan, // Tan text
        fontSize: 18,
        fontFamily: 'WalterTurncoat_400Regular',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default FilterModal;