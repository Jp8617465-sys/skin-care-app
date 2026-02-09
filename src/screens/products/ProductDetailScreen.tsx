import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const ProductDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Product Details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default ProductDetailScreen;
