import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const RoutineBuilderScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Routine Builder</Text>
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

export default RoutineBuilderScreen;
