import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuth } from '@hooks/useAuth';

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">
          Welcome{user?.displayName ? `, ${user.displayName}` : ''}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your skincare journey
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Today's Routine</Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            No routine set for today. Create one in the Routines tab.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Your Products</Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Start adding your skincare products to track your collection.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Progress Tracking</Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Log your skin's progress with photos and notes.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#666',
    marginTop: 5,
  },
  card: {
    margin: 15,
    marginBottom: 0,
  },
  cardText: {
    marginTop: 10,
    color: '#666',
  },
});

export default HomeScreen;
