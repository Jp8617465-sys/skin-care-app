import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, RadioButton, Checkbox } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { createUserProfile, getUserProfile, updateUserProfile } from '@services/profileService';
import { SkinType, SkinTone, AgeRange, Gender, SkinConcern } from '@types/user';
import { useAppStore } from '@services/store';

type Props = NativeStackScreenProps<any, 'ProfileEditScreen'>;

const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const SKIN_TONES: SkinTone[] = ['fair', 'light', 'medium', 'olive', 'tan', 'dark', 'deep'];
const AGE_RANGES: AgeRange[] = ['18-22', '23-27', '28-32', '33-35', '36+'];
const GENDERS: Gender[] = ['female', 'male', 'non-binary', 'prefer-not-to-say'];

const SKIN_CONCERNS: SkinConcern[] = [
  'acne', 'dark-spots', 'fine-lines', 'wrinkles', 'large-pores',
  'uneven-tone', 'dullness', 'dryness', 'oiliness', 'redness',
  'sensitivity', 'dark-circles', 'hyperpigmentation', 'texture',
  'blackheads', 'whiteheads', 'sun-damage', 'scarring', 'eczema',
  'rosacea', 'melasma'
];

const BUDGET_RANGES = ['budget', 'mid-range', 'premium', 'luxury'] as const;

const ProfileEditScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { setUserProfile } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<AgeRange>('23-27');
  const [gender, setGender] = useState<Gender>('prefer-not-to-say');
  const [skinType, setSkinType] = useState<SkinType>('normal');
  const [skinTone, setSkinTone] = useState<SkinTone>('medium');
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [allergies, setAllergies] = useState('');

  // Preferences
  const [budgetRange, setBudgetRange] = useState<typeof BUDGET_RANGES[number]>('mid-range');
  const [preferNatural, setPreferNatural] = useState(false);
  const [preferFragranceFree, setPreferFragranceFree] = useState(false);
  const [preferCrueltyFree, setPreferCrueltyFree] = useState(false);
  const [preferVegan, setPreferVegan] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoadingProfile(true);
      const profile = await getUserProfile(user.uid);

      if (profile) {
        setName(profile.name || '');
        setAge(profile.age || '23-27');
        setGender(profile.gender || 'prefer-not-to-say');
        setSkinType(profile.skinType || 'normal');
        setSkinTone(profile.skinTone || 'medium');
        setConcerns(profile.concerns || []);
        setAllergies(profile.allergies?.join(', ') || '');
        setBudgetRange(profile.preferences?.budgetRange || 'mid-range');
        setPreferNatural(profile.preferences?.preferNatural || false);
        setPreferFragranceFree(profile.preferences?.preferFragranceFree || false);
        setPreferCrueltyFree(profile.preferences?.preferCrueltyFree || false);
        setPreferVegan(profile.preferences?.preferVegan || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const toggleConcern = (concern: SkinConcern) => {
    setConcerns(prev =>
      prev.includes(concern)
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    if (concerns.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one skin concern');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        id: user.uid,
        name: name.trim(),
        age,
        gender,
        skinType,
        skinTone,
        concerns,
        allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
        preferences: {
          budgetRange,
          preferNatural,
          preferFragranceFree,
          preferCrueltyFree,
          preferVegan,
          stylePreferences: [],
          skinGoals: [],
        },
      };

      await updateUserProfile(user.uid, profileData);
      setUserProfile(profileData as any);

      Alert.alert('Success', 'Profile saved successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Edit Profile
      </Text>

      {/* Basic Info */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Basic Information
      </Text>

      <TextInput
        label="Name *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Email (from account)"
        value={user?.email || ''}
        mode="outlined"
        disabled
        style={styles.input}
      />

      {/* Age Range */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Age Range *
      </Text>
      <RadioButton.Group onValueChange={value => setAge(value as AgeRange)} value={age}>
        {AGE_RANGES.map(range => (
          <RadioButton.Item key={range} label={range} value={range} />
        ))}
      </RadioButton.Group>

      {/* Gender */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Gender *
      </Text>
      <RadioButton.Group onValueChange={value => setGender(value as Gender)} value={gender}>
        <RadioButton.Item label="Female" value="female" />
        <RadioButton.Item label="Male" value="male" />
        <RadioButton.Item label="Non-binary" value="non-binary" />
        <RadioButton.Item label="Prefer not to say" value="prefer-not-to-say" />
      </RadioButton.Group>

      {/* Skin Profile */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Skin Profile
      </Text>

      {/* Skin Type */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Skin Type *
      </Text>
      <RadioButton.Group onValueChange={value => setSkinType(value as SkinType)} value={skinType}>
        <RadioButton.Item label="Oily" value="oily" />
        <RadioButton.Item label="Dry" value="dry" />
        <RadioButton.Item label="Combination" value="combination" />
        <RadioButton.Item label="Normal" value="normal" />
        <RadioButton.Item label="Sensitive" value="sensitive" />
      </RadioButton.Group>

      {/* Skin Tone */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Skin Tone *
      </Text>
      <RadioButton.Group onValueChange={value => setSkinTone(value as SkinTone)} value={skinTone}>
        {SKIN_TONES.map(tone => (
          <RadioButton.Item
            key={tone}
            label={tone.charAt(0).toUpperCase() + tone.slice(1)}
            value={tone}
          />
        ))}
      </RadioButton.Group>

      {/* Skin Concerns */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Skin Concerns * (Select all that apply)
      </Text>
      <View style={styles.concernsContainer}>
        {SKIN_CONCERNS.map(concern => (
          <View key={concern} style={styles.checkboxRow}>
            <Checkbox
              status={concerns.includes(concern) ? 'checked' : 'unchecked'}
              onPress={() => toggleConcern(concern)}
            />
            <Text
              style={styles.checkboxLabel}
              onPress={() => toggleConcern(concern)}
            >
              {concern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </View>
        ))}
      </View>

      {/* Preferences */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Preferences
      </Text>

      {/* Budget Range */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Budget Range
      </Text>
      <RadioButton.Group
        onValueChange={value => setBudgetRange(value as typeof BUDGET_RANGES[number])}
        value={budgetRange}
      >
        <RadioButton.Item label="Budget (Under $25)" value="budget" />
        <RadioButton.Item label="Mid-Range ($25-$60)" value="mid-range" />
        <RadioButton.Item label="Premium ($60-$120)" value="premium" />
        <RadioButton.Item label="Luxury ($120+)" value="luxury" />
      </RadioButton.Group>

      {/* Preference Checkboxes */}
      <View style={styles.preferenceRow}>
        <Checkbox
          status={preferNatural ? 'checked' : 'unchecked'}
          onPress={() => setPreferNatural(!preferNatural)}
        />
        <Text style={styles.checkboxLabel} onPress={() => setPreferNatural(!preferNatural)}>
          Prefer Natural Products
        </Text>
      </View>

      <View style={styles.preferenceRow}>
        <Checkbox
          status={preferFragranceFree ? 'checked' : 'unchecked'}
          onPress={() => setPreferFragranceFree(!preferFragranceFree)}
        />
        <Text
          style={styles.checkboxLabel}
          onPress={() => setPreferFragranceFree(!preferFragranceFree)}
        >
          Prefer Fragrance-Free
        </Text>
      </View>

      <View style={styles.preferenceRow}>
        <Checkbox
          status={preferCrueltyFree ? 'checked' : 'unchecked'}
          onPress={() => setPreferCrueltyFree(!preferCrueltyFree)}
        />
        <Text
          style={styles.checkboxLabel}
          onPress={() => setPreferCrueltyFree(!preferCrueltyFree)}
        >
          Prefer Cruelty-Free
        </Text>
      </View>

      <View style={styles.preferenceRow}>
        <Checkbox
          status={preferVegan ? 'checked' : 'unchecked'}
          onPress={() => setPreferVegan(!preferVegan)}
        />
        <Text style={styles.checkboxLabel} onPress={() => setPreferVegan(!preferVegan)}>
          Prefer Vegan
        </Text>
      </View>

      {/* Allergies */}
      <TextInput
        label="Known Allergies (comma-separated)"
        value={allergies}
        onChangeText={setAllergies}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholder="e.g., Nuts, Fragrance, Vitamin C"
      />

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        style={styles.saveButton}
      >
        Save Profile
      </Button>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    fontWeight: '600',
  },
  sectionLabel: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  concernsContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileEditScreen;
