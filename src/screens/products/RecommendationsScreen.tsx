import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { getUserProfile } from '@services/profileService';
import { getRecommendations, getRecommendationsByCategory } from '@services/recommendations';
import { createProduct } from '@services/productService';
import { UserProfile } from '@types/user';
import { ProductRecommendation, ProductCategory } from '@types/product';

type Props = NativeStackScreenProps<any, 'RecommendationsScreen'>;

const CATEGORIES: Array<{ label: string; value: ProductCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Cleanser', value: 'cleanser' },
  { label: 'Toner', value: 'toner' },
  { label: 'Serum', value: 'serum' },
  { label: 'Moisturizer', value: 'moisturizer' },
  { label: 'Sunscreen', value: 'sunscreen' },
  { label: 'Eye Cream', value: 'eye-cream' },
  { label: 'Mask', value: 'mask' },
  { label: 'Exfoliant', value: 'exfoliant' },
];

const RecommendationsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

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

  // Get recommendations based on selected category
  const recommendations = useMemo(() => {
    if (!profile || !profile.concerns || profile.concerns.length === 0) {
      return [];
    }

    if (selectedCategory === 'all') {
      return getRecommendations(profile.concerns, profile, undefined, 20);
    } else {
      return getRecommendationsByCategory(
        selectedCategory,
        profile.concerns,
        profile,
        undefined,
        10
      );
    }
  }, [profile, selectedCategory]);

  const handleAddToMyProducts = async (rec: ProductRecommendation) => {
    if (!user) return;

    try {
      setAddingProductId(rec.product.id);

      // Create product from recommendation
      await createProduct(user.uid, {
        name: rec.product.name,
        brand: rec.product.brand,
        category: rec.product.category,
        usage: rec.product.usage,
        ingredients: rec.product.ingredients,
        notes: `Added from recommendations (${rec.matchScore}% match)`,
      });

      // Navigate to products list
      navigation.navigate('ProductList');
    } catch (error: any) {
      console.error('Error adding product:', error);
    } finally {
      setAddingProductId(null);
    }
  };

  const formatLabel = (value: string): string => {
    return value
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderCategoryTab = (category: { label: string; value: ProductCategory | 'all' }) => (
    <Chip
      key={category.value}
      selected={selectedCategory === category.value}
      onPress={() => setSelectedCategory(category.value)}
      style={[
        styles.categoryChip,
        selectedCategory === category.value && styles.selectedCategoryChip,
      ]}
      textStyle={selectedCategory === category.value && styles.selectedCategoryText}
      mode={selectedCategory === category.value ? 'flat' : 'outlined'}
    >
      {category.label}
    </Chip>
  );

  const renderRecommendationItem = ({ item }: { item: ProductRecommendation }) => (
    <Card style={styles.card}>
      <Card.Content>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProductDetail', { productId: item.product.id })
          }
        >
          <View style={styles.cardHeader}>
            <View style={styles.productInfo}>
              <Text variant="titleMedium" style={styles.productName}>
                {item.product.name}
              </Text>
              <Text variant="bodyMedium" style={styles.brandName}>
                {item.product.brand}
              </Text>
              <Text variant="bodySmall" style={styles.category}>
                {formatLabel(item.product.category)}
              </Text>
            </View>
            <Chip mode="flat" style={styles.matchChip} compact>
              {item.matchScore}% Match
            </Chip>
          </View>

          {/* Match Reasons */}
          <View style={styles.reasonsContainer}>
            {item.matchReasons.slice(0, 4).map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <Text variant="bodySmall" style={styles.reasonText}>
                  • {reason}
                </Text>
              </View>
            ))}
          </View>

          {/* Key Ingredients */}
          {item.product.ingredients && item.product.ingredients.length > 0 && (
            <View style={styles.ingredientsContainer}>
              <Text variant="labelSmall" style={styles.ingredientsLabel}>
                Key Ingredients:
              </Text>
              <View style={styles.ingredientChips}>
                {item.product.ingredients.slice(0, 3).map((ingredient, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    compact
                    style={styles.ingredientChip}
                  >
                    {ingredient}
                  </Chip>
                ))}
                {item.product.ingredients.length > 3 && (
                  <Text variant="bodySmall" style={styles.moreIngredients}>
                    +{item.product.ingredients.length - 3} more
                  </Text>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Add to My Products Button */}
        <Button
          mode="contained"
          onPress={() => handleAddToMyProducts(item)}
          loading={addingProductId === item.product.id}
          disabled={addingProductId === item.product.id}
          style={styles.addButton}
          icon="plus"
        >
          Add to My Products
        </Button>
      </Card.Content>
    </Card>
  );

  // Empty state when no profile
  if (!loading && (!profile || !profile.concerns || profile.concerns.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Complete Your Profile
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Set up your skin profile to get personalized product recommendations
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ProfileTab', { screen: 'ProfileEditScreen' })}
          style={styles.setupButton}
          icon="pencil"
        >
          Set Up Profile
        </Button>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(renderCategoryTab)}
      </ScrollView>

      {/* Recommendations List */}
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Recommendations
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Try adjusting your profile or selecting a different category
            </Text>
          </View>
        }
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
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#6200ee',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
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
    marginBottom: 4,
  },
  category: {
    color: '#999',
    fontSize: 12,
  },
  matchChip: {
    backgroundColor: '#e3f2fd',
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonRow: {
    marginBottom: 4,
  },
  reasonText: {
    color: '#666',
    lineHeight: 20,
  },
  ingredientsContainer: {
    marginBottom: 12,
  },
  ingredientsLabel: {
    color: '#666',
    marginBottom: 8,
  },
  ingredientChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  ingredientChip: {
    marginBottom: 4,
  },
  moreIngredients: {
    color: '#666',
  },
  addButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyTitle: {
    marginBottom: 12,
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
});

export default RecommendationsScreen;
