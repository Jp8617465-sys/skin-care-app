import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList } from './types';
import HomeScreen from '@screens/home/HomeScreen';
import ProductListScreen from '@screens/products/ProductListScreen';
import ProductDetailScreen from '@screens/products/ProductDetailScreen';
import AddProductScreen from '@screens/products/AddProductScreen';
import RoutineListScreen from '@screens/routines/RoutineListScreen';
import RoutineBuilderScreen from '@screens/routines/RoutineBuilderScreen';
import RoutineDetailScreen from '@screens/routines/RoutineDetailScreen';
import ProgressTrackerScreen from '@screens/progress/ProgressTrackerScreen';
import ProgressDetailScreen from '@screens/progress/ProgressDetailScreen';
import AddProgressScreen from '@screens/progress/AddProgressScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';
import ProfileEditScreen from '@screens/profile/ProfileEditScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();
const RoutinesStack = createNativeStackNavigator();
const ProgressStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
    </HomeStack.Navigator>
  );
}

function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator>
      <ProductsStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: 'Products' }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <ProductsStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />
    </ProductsStack.Navigator>
  );
}

function RoutinesStackNavigator() {
  return (
    <RoutinesStack.Navigator>
      <RoutinesStack.Screen
        name="RoutineList"
        component={RoutineListScreen}
        options={{ title: 'Routines' }}
      />
      <RoutinesStack.Screen
        name="RoutineBuilder"
        component={RoutineBuilderScreen}
        options={{ title: 'Build Routine' }}
      />
      <RoutinesStack.Screen
        name="RoutineDetail"
        component={RoutineDetailScreen}
        options={{ title: 'Routine Details' }}
      />
    </RoutinesStack.Navigator>
  );
}

function ProgressStackNavigator() {
  return (
    <ProgressStack.Navigator>
      <ProgressStack.Screen
        name="ProgressTracker"
        component={ProgressTrackerScreen}
        options={{ title: 'Progress' }}
      />
      <ProgressStack.Screen
        name="ProgressDetail"
        component={ProgressDetailScreen}
        options={{ title: 'Progress Details' }}
      />
      <ProgressStack.Screen
        name="AddProgress"
        component={AddProgressScreen}
        options={{ title: 'Log Progress' }}
      />
    </ProgressStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="ProfileEditScreen"
        component={ProfileEditScreen}
        options={{ title: 'Edit Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{ title: 'Products' }}
      />
      <Tab.Screen
        name="RoutinesTab"
        component={RoutinesStackNavigator}
        options={{ title: 'Routines' }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressStackNavigator}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
