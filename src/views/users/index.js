/**
 * Created by zhangsong on 2018/3/8.
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
} from 'react-native';
import { Flex, Button, List, InputItem, } from 'antd-mobile';

const Item = List.Item;
const Brief = Item.Brief;

export default class HelloWorldApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      password: '',
      loading: false,
    };
  }

  componentDidMount() {

  }

  getUserList(){

  }

  render() {
    return (
      <List renderHeader={() => 'Icon in the left'}>
        <Item
          thumb="https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png"
          arrow="horizontal"
          onClick={() => {}}
        >My wallet</Item>
        <Item
          thumb="https://zos.alipayobjects.com/rmsportal/UmbJMbWOejVOpxe.png"
          onClick={() => {}}
          arrow="horizontal"
        >
          My Cost Ratio
        </Item>
      </List>
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
    height:100,
  }
});

