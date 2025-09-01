import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage }) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalPages }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            backgroundColor: index === currentPage ? colors.green1 : 'transparent',
                            width: index === currentPage ? 18 : 10,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 12,
        height: 10,
        borderRadius: 10,
        marginHorizontal: 2,
        borderColor: colors.green1,
        borderWidth: 1
    },
});

export default Pagination;