import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { FAB, Text, Card, Chip, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { getUserProducts } from '@services/productService';
import { Product } from '@types/product';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<any, 'ProductList'>;

const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load products when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [user])
  );

  const loadProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedProducts = await getUserProducts(user.uid);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.productInfo}>
              <Text variant="titleMedium" style={styles.productName}>
                {item.name}
              </Text>
              <Text variant="bodyMedium" style={styles.brandName}>
                {item.brand}
              </Text>
            </View>
            <Chip mode="outlined" compact>
              {item.category}
            </Chip>
          </View>

          <View style={styles.cardFooter}>
            <Chip
              mode="flat"
              compact
              style={[
                styles.usageChip,
                item.usage === 'AM' && styles.amChip,
                item.usage === 'PM' && styles.pmChip,
              ]}
            >
              {item.usage}
            </Chip>
            {item.rating && (
              <Text variant="bodySmall" style={styles.rating}>
                ⭐ {item.rating.toFixed(1)}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No Products Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Start adding your skincare products to track your routine
      </Text>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Recommendations Button */}
      <Button
        mode="outlined"
        icon="star"
        onPress={() => navigation.navigate('RecommendationsScreen')}
        style={styles.recommendationsButton}
      >
        View Recommendations
      </Button>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={products.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      />
    </View>
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
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  brandName: {
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  rating: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  recommendationsButton: {
    margin: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ProductListScreen;
