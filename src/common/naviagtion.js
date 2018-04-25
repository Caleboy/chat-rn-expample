/**
 * Created by zhangsong on 2018/3/5.
 */
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView, StackNavigator } from 'react-navigation';
import LoginScreen from '../views/login';
import UsersScreen from '../views/users';
import ChatsScreen from '../views/chat';

const Routes = {
  LoginScreen: { screen: LoginScreen, header: null },
  ChatsScreen: { screen: ChatsScreen, header: null },
};

const AppNavigator = StackNavigator(
  {
    ...Routes,
    Index: {
      screen: LoginScreen,
    },
  },
  {
    headerMode: 'none',
    /*
   * Use modal on iOS because the card mode comes from the right,
   * which conflicts with the drawer example gesture
   */
    mode: Platform.OS === 'ios' ? 'modal' : 'card',
  }
);

export default AppNavigator;
