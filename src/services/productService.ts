import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getUserProducts as fetchUserProducts
} from './firebase/firestore';
import { uploadImage, deleteImage } from './firebase/storage';
import { Product } from '@types/product';

export interface CreateProductData {
  name: string;
  brand: string;
  category: Product['category'];
  ingredients?: string[];
  usage: Product['usage'];
  purchaseDate?: Date;
  expiryDate?: Date;
  notes?: string;
  imageUri?: string;
  rating?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  imageUri?: string;
}

/**
 * Create a new product for a user
 */
export const createProduct = async (
  userId: string,
  productData: CreateProductData
): Promise<string> => {
  let imageUrl: string | undefined;

  // Upload image if provided
  if (productData.imageUri) {
    const timestamp = Date.now();
    const filename = `product_${timestamp}.jpg`;
    imageUrl = await uploadImage(userId, 'products', productData.imageUri, filename);
  }

  // Prepare product document
  const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
    userId,
    name: productData.name,
    brand: productData.brand,
    category: productData.category,
    ingredients: productData.ingredients || [],
    usage: productData.usage,
    purchaseDate: productData.purchaseDate,
    expiryDate: productData.expiryDate,
    notes: productData.notes,
    imageUrl,
    rating: productData.rating,
  };

  // Create document in Firestore
  const productId = await createDocument(`users/${userId}/products`, product);
  return productId;
};

/**
 * Get all products for a user
 */
export const getUserProducts = async (userId: string): Promise<Product[]> => {
  return await fetchUserProducts(userId);
};

/**
 * Get a single product by ID
 */
export const getProductById = async (
  userId: string,
  productId: string
): Promise<Product | null> => {
  return await getDocument(`users/${userId}/products`, productId);
};

/**
 * Update an existing product
 */
export const updateProduct = async (
  userId: string,
  productId: string,
  updates: UpdateProductData
): Promise<void> => {
  let imageUrl: string | undefined;

  // Upload new image if provided
  if (updates.imageUri) {
    // Get existing product to delete old image
    const existingProduct = await getProductById(userId, productId);
    if (existingProduct?.imageUrl) {
      try {
        // Extract filename from imageUrl and delete old image
        const urlParts = existingProduct.imageUrl.split('/');
        const oldFilename = urlParts[urlParts.length - 1].split('?')[0];
        await deleteImage(userId, 'products', oldFilename);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Upload new image
    const timestamp = Date.now();
    const filename = `product_${timestamp}.jpg`;
    imageUrl = await uploadImage(userId, 'products', updates.imageUri, filename);
  }

  // Prepare update data
  const updateData: any = { ...updates };
  delete updateData.imageUri; // Remove imageUri from update data

  if (imageUrl) {
    updateData.imageUrl = imageUrl;
  }

  // Update document in Firestore
  await updateDocument(`users/${userId}/products`, productId, updateData);
};

/**
 * Delete a product
 */
export const deleteProduct = async (
  userId: string,
  productId: string
): Promise<void> => {
  // Get product to delete associated image
  const product = await getProductById(userId, productId);

  if (product?.imageUrl) {
    try {
      // Extract filename from imageUrl
      const urlParts = product.imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0];
      await deleteImage(userId, 'products', filename);
    } catch (error) {
      console.error('Error deleting product image:', error);
    }
  }

  // Delete document from Firestore
  await deleteDocument(`users/${userId}/products`, productId);
};
