import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const AddProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Log Progress
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Take photos and add notes about your skin condition
      </Text>

      <Button mode="contained" style={styles.button}>
        Take Photo
      </Button>

      <Button mode="outlined" style={styles.button}>
        Choose from Gallery
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    marginBottom: 30,
  },
  button: {
    marginTop: 15,
  },
});

export default AddProgressScreen;
