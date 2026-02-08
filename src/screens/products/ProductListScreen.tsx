import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Text, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'ProductList'>;

const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.emptyContainer}>
        <Text variant="titleLarge">No Products Yet</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Start adding your skincare products to track your collection
        </Text>
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct', {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ProductListScreen;
