import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, Text, Card, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Routine } from '@types/routine';
import { getUserRoutines, setActiveRoutine, deleteRoutine } from '@services/routineService';
import { useAuth } from '@contexts/AuthContext';

type Props = NativeStackScreenProps<any, 'RoutineList'>;

const RoutineListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRoutines = async () => {
    if (!user) return;
    try {
      const fetchedRoutines = await getUserRoutines(user.uid);
      setRoutines(fetchedRoutines);
    } catch (error) {
      console.error('Error loading routines:', error);
      Alert.alert('Error', 'Failed to load routines');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [user]);

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRoutines();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRoutines();
  };

  const handleSetActive = async (routine: Routine) => {
    if (!user) return;
    try {
      await setActiveRoutine(user.uid, routine.id, routine.type);
      await loadRoutines();
      Alert.alert('Success', `${routine.name} is now your active ${routine.type} routine`);
    } catch (error) {
      console.error('Error setting active routine:', error);
      Alert.alert('Error', 'Failed to set active routine');
    }
  };

  const handleDelete = (routine: Routine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteRoutine(user.uid, routine.id);
              await loadRoutines();
              Alert.alert('Success', 'Routine deleted');
            } catch (error) {
              console.error('Error deleting routine:', error);
              Alert.alert('Error', 'Failed to delete routine');
            }
          },
        },
      ]
    );
  };

  const renderRoutineCard = ({ item }: { item: Routine }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('RoutineDetail', { routineId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text variant="titleMedium" style={styles.routineName}>
              {item.name}
            </Text>
            <View style={styles.chipContainer}>
              <Chip
                mode="outlined"
                style={[
                  styles.typeChip,
                  item.type === 'AM' ? styles.amChip : styles.pmChip,
                ]}
              >
                {item.type}
              </Chip>
              {item.isActive && (
                <Chip
                  mode="flat"
                  style={styles.activeChip}
                  textStyle={styles.activeChipText}
                >
                  Active
                </Chip>
              )}
            </View>
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item)}
          />
        </View>
        <Text variant="bodyMedium" style={styles.stepCount}>
          {item.steps.length} {item.steps.length === 1 ? 'step' : 'steps'}
        </Text>
        {!item.isActive && (
          <Card.Actions>
            <Text
              style={styles.setActiveButton}
              onPress={() => handleSetActive(item)}
            >
              Set as Active
            </Text>
          </Card.Actions>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (routines.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="titleLarge">No Routines Yet</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Create your AM and PM skincare routines
          </Text>
        </View>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('RoutineBuilder', {})}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={routines}
        renderItem={renderRoutineCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('RoutineBuilder', {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  routineName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    height: 28,
  },
  amChip: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFE5E5',
  },
  pmChip: {
    borderColor: '#4ECDC4',
    backgroundColor: '#E5F9F7',
  },
  activeChip: {
    height: 28,
    backgroundColor: '#4CAF50',
  },
  activeChipText: {
    color: '#fff',
  },
  stepCount: {
    color: '#666',
  },
  setActiveButton: {
    color: '#2196F3',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default RoutineListScreen;
