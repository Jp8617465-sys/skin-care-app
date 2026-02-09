import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { getUserProfile } from '@services/profileService';
import { getRecommendations } from '@services/recommendations';
import { UserProfile } from '@types/user';
import { ProductRecommendation } from '@types/product';

type Props = NativeStackScreenProps<any, 'ProfileScreen'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [user])
  );

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get top 3 recommendations based on profile
  const recommendations = useMemo(() => {
    console.log('ProfileScreen - Calculating recommendations');
    console.log('Profile:', profile);
    console.log('Concerns:', profile?.concerns);

    if (!profile || !profile.concerns || profile.concerns.length === 0) {
      console.log('No profile or concerns, returning empty recommendations');
      return [];
    }

    const recs = getRecommendations(profile.concerns, profile, undefined, 3);
    console.log('Generated recommendations:', recs.length, recs);
    return recs;
  }, [profile]);

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

  const formatLabel = (value: string): string => {
    return value
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Basic Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Profile</Text>
          <Text variant="bodyLarge" style={styles.info}>
            {profile?.name || user?.displayName || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.info}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      {/* Profile Summary Card */}
      {profile && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">Skin Profile</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('ProfileEditScreen')}
                compact
              >
                Edit
              </Button>
            </View>

            <View style={styles.profileRow}>
              <Text variant="labelLarge" style={styles.label}>Skin Type:</Text>
              <Text variant="bodyMedium">{formatLabel(profile.skinType)}</Text>
            </View>

            <View style={styles.profileRow}>
              <Text variant="labelLarge" style={styles.label}>Skin Tone:</Text>
              <Text variant="bodyMedium">{formatLabel(profile.skinTone)}</Text>
            </View>

            <View style={styles.profileRow}>
              <Text variant="labelLarge" style={styles.label}>Age Range:</Text>
              <Text variant="bodyMedium">{profile.age}</Text>
            </View>

            {profile.concerns && profile.concerns.length > 0 && (
              <View style={styles.concernsSection}>
                <Text variant="labelLarge" style={styles.label}>Concerns:</Text>
                <View style={styles.chipContainer}>
                  {profile.concerns.slice(0, 6).map((concern, index) => (
                    <Chip key={index} mode="outlined" style={styles.chip} compact>
                      {formatLabel(concern)}
                    </Chip>
                  ))}
                  {profile.concerns.length > 6 && (
                    <Chip mode="outlined" style={styles.chip} compact>
                      +{profile.concerns.length - 6} more
                    </Chip>
                  )}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Preferences Card */}
      {profile?.preferences && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.profileRow}>
              <Text variant="labelLarge" style={styles.label}>Budget:</Text>
              <Text variant="bodyMedium">{formatLabel(profile.preferences.budgetRange)}</Text>
            </View>

            <View style={styles.chipContainer}>
              {profile.preferences.preferNatural && (
                <Chip mode="flat" style={styles.preferenceChip} compact>🌿 Natural</Chip>
              )}
              {profile.preferences.preferFragranceFree && (
                <Chip mode="flat" style={styles.preferenceChip} compact>🚫 Fragrance-Free</Chip>
              )}
              {profile.preferences.preferCrueltyFree && (
                <Chip mode="flat" style={styles.preferenceChip} compact>🐰 Cruelty-Free</Chip>
              )}
              {profile.preferences.preferVegan && (
                <Chip mode="flat" style={styles.preferenceChip} compact>🌱 Vegan</Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recommendations Preview */}
      {recommendations.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">Recommended for You</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('ProductsTab', { screen: 'RecommendationsScreen' })}
                compact
              >
                See All
              </Button>
            </View>

            {recommendations.map((rec, index) => (
              <TouchableOpacity
                key={rec.product.id}
                style={styles.recommendationItem}
                onPress={() => navigation.navigate('ProductsTab', {
                  screen: 'ProductDetail',
                  params: { productId: rec.product.id }
                })}
              >
                <View style={styles.recommendationContent}>
                  <Text variant="titleSmall" style={styles.productName}>
                    {rec.product.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.brandName}>
                    {rec.product.brand} • {rec.product.category}
                  </Text>
                  <View style={styles.matchRow}>
                    <Chip mode="flat" compact style={styles.matchChip}>
                      {rec.matchScore}% Match
                    </Chip>
                    {rec.matchReasons.slice(0, 2).map((reason, idx) => (
                      <Text key={idx} variant="bodySmall" style={styles.matchReason}>
                        • {reason}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* No Profile Message */}
      {!loading && !profile && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Complete Your Profile
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Set up your skin profile to get personalized product recommendations
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ProfileEditScreen')}
              style={styles.setupButton}
              icon="pencil"
            >
              Set Up Profile
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOutButton}
        textColor="#d32f2f"
      >
        Sign Out
      </Button>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    minWidth: 100,
    color: '#666',
  },
  concernsSection: {
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginBottom: 4,
  },
  preferenceChip: {
    backgroundColor: '#e8f5e9',
    marginBottom: 4,
  },
  recommendationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recommendationContent: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  brandName: {
    color: '#666',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchChip: {
    backgroundColor: '#e3f2fd',
  },
  matchReason: {
    color: '#666',
    fontSize: 12,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  setupButton: {
    marginTop: 8,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;
