import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import { Text, Button, TextInput, RadioButton, Menu } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { createProduct, updateProduct, getProductById } from '@services/productService';
import { Product } from '@types/product';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<any, 'AddProduct'>;

const CATEGORIES = [
  { label: 'Cleanser', value: 'cleanser' },
  { label: 'Toner', value: 'toner' },
  { label: 'Serum', value: 'serum' },
  { label: 'Moisturizer', value: 'moisturizer' },
  { label: 'Sunscreen', value: 'sunscreen' },
  { label: 'Treatment', value: 'treatment' },
  { label: 'Other', value: 'other' },
];

const AddProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const productId = route.params?.productId;
  const isEditMode = !!productId;

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Product['category']>('other');
  const [usage, setUsage] = useState<Product['usage']>('Both');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [rating, setRating] = useState<string>('');

  // Load product for editing
  useEffect(() => {
    if (isEditMode && user) {
      loadProduct();
    }
  }, [isEditMode, productId, user]);

  const loadProduct = async () => {
    if (!user || !productId) return;

    try {
      const product = await getProductById(user.uid, productId);
      if (product) {
        setName(product.name);
        setBrand(product.brand);
        setCategory(product.category);
        setUsage(product.usage);
        setNotes(product.notes || '');
        setImageUri(product.imageUrl);
        setRating(product.rating?.toString() || '');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoadingProduct(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter product name');
      return false;
    }
    if (!brand.trim()) {
      Alert.alert('Validation Error', 'Please enter brand name');
      return false;
    }
    if (rating && (isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
      Alert.alert('Validation Error', 'Rating must be between 0 and 5');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const productData = {
        name: name.trim(),
        brand: brand.trim(),
        category,
        usage,
        notes: notes.trim(),
        imageUri,
        rating: rating ? Number(rating) : undefined,
      };

      if (isEditMode && productId) {
        await updateProduct(user.uid, productId, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await createProduct(user.uid, productData);
        Alert.alert('Success', 'Product added successfully');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {isEditMode ? 'Edit Product' : 'Add Product'}
      </Text>

      {/* Image Picker */}
      <View style={styles.imageSection}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text variant="bodyMedium" style={styles.placeholderText}>
              No image selected
            </Text>
          </View>
        )}
        <View style={styles.imageButtons}>
          <Button mode="outlined" onPress={pickImage} style={styles.imageButton}>
            Choose Photo
          </Button>
          {Platform.OS !== 'web' && (
            <Button mode="outlined" onPress={takePhoto} style={styles.imageButton}>
              Take Photo
            </Button>
          )}
        </View>
      </View>

      {/* Product Name */}
      <TextInput
        label="Product Name *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      {/* Brand */}
      <TextInput
        label="Brand *"
        value={brand}
        onChangeText={setBrand}
        mode="outlined"
        style={styles.input}
      />

      {/* Category Dropdown */}
      <Menu
        visible={categoryMenuVisible}
        onDismiss={() => setCategoryMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setCategoryMenuVisible(true)}
            style={styles.dropdownButton}
            contentStyle={styles.dropdownContent}
          >
            {CATEGORIES.find(c => c.value === category)?.label || 'Select Category'}
          </Button>
        }
      >
        {CATEGORIES.map(cat => (
          <Menu.Item
            key={cat.value}
            onPress={() => {
              setCategory(cat.value as Product['category']);
              setCategoryMenuVisible(false);
            }}
            title={cat.label}
          />
        ))}
      </Menu>

      {/* Usage Radio Buttons - FIXED */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Usage *
      </Text>
      <RadioButton.Group onValueChange={value => setUsage(value as Product['usage'])} value={usage}>
        <RadioButton.Item label="AM" value="AM" />
        <RadioButton.Item label="PM" value="PM" />
        <RadioButton.Item label="Both" value="Both" />
      </RadioButton.Group>

      {/* Rating */}
      <TextInput
        label="Rating (0-5)"
        value={rating}
        onChangeText={setRating}
        mode="outlined"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      {/* Notes */}
      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        style={styles.saveButton}
      >
        {isEditMode ? 'Update Product' : 'Add Product'}
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
  imageSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#999',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    minWidth: 120,
  },
  input: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  dropdownButton: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  dropdownContent: {
    justifyContent: 'flex-start',
  },
  sectionLabel: {
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AddProductScreen;
