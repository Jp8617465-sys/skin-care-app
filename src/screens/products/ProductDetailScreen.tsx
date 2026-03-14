import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { getProductById, deleteProduct } from '@services/productService';
import { Product } from '@types/product';

type Props = NativeStackScreenProps<any, 'ProductDetail'>;

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedProduct = await getProductById(user.uid, productId);
      setProduct(fetchedProduct);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddProduct', { productId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      await deleteProduct(user.uid, productId);
      Alert.alert('Success', 'Product deleted successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Product not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      {product.imageUrl && (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      )}

      {/* Product Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.productName}>
            {product.name}
          </Text>
          <Text variant="titleMedium" style={styles.brandName}>
            {product.brand}
          </Text>

          <View style={styles.chipContainer}>
            <Chip mode="outlined">{product.category}</Chip>
            <Chip
              mode="flat"
              style={[
                styles.usageChip,
                product.usage === 'AM' && styles.amChip,
                product.usage === 'PM' && styles.pmChip,
              ]}
            >
              {product.usage}
            </Chip>
            {product.rating && (
              <Chip mode="outlined">⭐ {product.rating.toFixed(1)}</Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Details Card */}
      {product.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notes
            </Text>
            <Text variant="bodyMedium" style={styles.notes}>
              {product.notes}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Ingredients Card */}
      {product.ingredients && product.ingredients.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ingredients
            </Text>
            <View style={styles.ingredientsList}>
              {product.ingredients.map((ingredient, index) => (
                <Chip key={index} mode="outlined" style={styles.ingredientChip}>
                  {ingredient}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Dates Card */}
      {(product.purchaseDate || product.expiryDate) && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Dates
            </Text>
            {product.purchaseDate && (
              <View style={styles.dateRow}>
                <Text variant="labelLarge">Purchase Date:</Text>
                <Text variant="bodyMedium">{new Date(product.purchaseDate).toLocaleDateString()}</Text>
              </View>
            )}
            {product.expiryDate && (
              <View style={styles.dateRow}>
                <Text variant="labelLarge">Expiry Date:</Text>
                <Text variant="bodyMedium">{new Date(product.expiryDate).toLocaleDateString()}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleEdit}
          icon="pencil"
          style={styles.editButton}
        >
          Edit Product
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          icon="delete"
          loading={deleting}
          disabled={deleting}
          style={styles.deleteButton}
          textColor="#d32f2f"
        >
          Delete
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  productName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  brandName: {
    color: '#666',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  usageChip: {
    backgroundColor: '#e3f2fd',
  },
  amChip: {
    backgroundColor: '#fff3e0',
  },
  pmChip: {
    backgroundColor: '#e8eaf6',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  notes: {
    lineHeight: 22,
    color: '#333',
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buttonContainer: {
    margin: 16,
    gap: 12,
  },
  editButton: {
    paddingVertical: 8,
  },
  deleteButton: {
    paddingVertical: 8,
    borderColor: '#d32f2f',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProductDetailScreen;
