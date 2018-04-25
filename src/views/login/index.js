/**
 * Created by zhangsong on 2018/3/5.
 */
import React, { Component } from 'react';
import {
  AppRegistry,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  AsyncStorage,
} from 'react-native';
import { Flex, Button, List, InputItem, } from 'antd-mobile';
import Request from '../../utils/request';
import config from '../../config/index';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'zzz',
      password: '123',
      loading: false,
    };
  }

  submitHandle = () => {
    if (!this.state.text) {
      return Alert.alert('警告', '请输入账户名');
    }
    if (!this.state.password) {
      return Alert.alert('警告', '请输入密码');
    }
    this.setState({
      loading: true,
    });
    Request(config.UrlConstant.login, {
      method: 'POST',
      body: {
        username: this.state.text,
        password: this.state.password,
      },
    }).then((result) => {
      this.setState({
        loading: false,
      });
      if (result.code === 1) {
        AsyncStorage.setItem(config.Config.userInfo, JSON.stringify({
          username: this.state.text,
          password: this.state.password,
          token: result.data,
        }));
        this.props.navigation.navigate('ChatsScreen', {
          token: result.data,
          username: this.state.text,
        });
      } else {
        return Alert.alert('警告', '帐号或者密码错误');
      }
    }).catch((err) => {
      this.setState({
        loading: false,
      });
      return Alert.alert('警告', '系统异常,无法登录');
    });
  };

  render() {
    return (
      <View style={ { flex: 1, paddingLeft: 15, paddingRight: 15, } }>
        <View style={ styles.icon }>
          <Image source={ require('../../assiet/simplechat_src_assets_images_smallLogo.png') }/>
        </View>
        <View style={ { display: 'flex', } }>
          <Text style={ { width: 100 } }>
            昵称:
          </Text>
          <TextInput style={ { height: 40, borderColor: 'gray', borderWidth: 1, } }
                     maxLength={ 20 }
                     onChangeText={ (text) => this.setState({ text }) }
                     placeholder="请输入昵称"
                     value={ this.state.text }/>
        </View>
        <View>
          <Text style={ styles.label }>
            密码:
          </Text>
          <TextInput style={ { height: 40, borderColor: 'gray', borderWidth: 1 } }
                     secureTextEntry={ true }
                     clearTextOnFocus={ true }
                     placeholder="请输入密码"
                     clearButtonMode="unless-editing"
                     onChangeText={ (text) => this.setState({ password: text }) }
                     value={ this.state.password }/>
        </View>
        <View>
          <Button loading={ this.state.loading } onClick={ this.submitHandle }>登录</Button>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    width: 100,
  },
  icon: {
    flex: 1,
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
});
