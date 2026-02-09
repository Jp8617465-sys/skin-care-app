import { NavigatorScreenParams } from '@react-navigation/native';
import { Product } from '@types/product';
import { Routine } from '@types/routine';
import { ProgressEntry } from '@types/progress';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
};

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: { product: Product };
  AddProduct: { product?: Product };
};

export type RoutinesStackParamList = {
  RoutineList: undefined;
  RoutineBuilder: { routine?: Routine };
  RoutineDetail: { routine: Routine };
};

export type ProgressStackParamList = {
  ProgressTracker: undefined;
  ProgressDetail: { entry: ProgressEntry };
  AddProgress: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  SettingsScreen: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  RoutinesTab: NavigatorScreenParams<RoutinesStackParamList>;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
