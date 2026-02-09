import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';

type Props = NativeStackScreenProps<any, 'ProfileScreen'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Profile</Text>
          <Text variant="bodyLarge" style={styles.info}>
            {user?.displayName || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.info}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Settings</Text>
          <Text variant="bodyMedium" style={styles.settingsText}>
            App settings and preferences coming soon
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('ProfileEditScreen')}
        style={styles.editButton}
        icon="pencil"
      >
        Edit Profile
      </Button>

      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOutButton}
        textColor="#d32f2f"
      >
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 15,
  },
  info: {
    marginTop: 10,
  },
  settingsText: {
    marginTop: 10,
    color: '#666',
  },
  editButton: {
    marginTop: 20,
  },
  signOutButton: {
    marginTop: 12,
  },
});

export default ProfileScreen;
