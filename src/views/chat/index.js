/**
 * Created by zhangsong on 2018/3/8.
 */
import React, { Component } from 'react';
import {
  GiftedChat,
  Actions,
  Bubble,
  SystemMessage,
} from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-crop-picker';
import SocketIOClient from 'socket.io-client';
import {
  AppRegistry,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  Flex,
  Button,
  List,
  InputItem,
  Tabs,
  WhiteSpace,
  Badge,
  NoticeBar,
  Icon
} from 'antd-mobile';
import Config from '../../config/config';
import config from '../../config/index';
import Chat from './components/chat';

const DEFAULT_AVATAR = 'https://upload.jianshu.io/users/upload_avatars/9393582/51f6f9e9-0a3a-44df-bd9d-9c4fbaed5edb?imageMogr2/auto-orient/strip|imageView2/1/w/120/h/120';

const Item = List.Item;
const Brief = Item.Brief;
if (!window.location) {
  // App is running in simulator
  window.navigator.userAgent = 'ReactNative';
}

const tabs = [
  { title: <Text>最近聊天</Text> },
  { title: <Text>用户列表</Text> },
];

export default class ChatIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
      messages: [],
      userId: '',
      username: this.props.navigation.state.params.username,
      token: this.props.navigation.state.params.token,
      online: 0, // 在线人数
      userList: [], // 全部用户
      historyUserList: [], // 最近常用联系人
      currentChat: {},
    };
    console.log(config.Config.host);
    this.socket = SocketIOClient(config.Config.host);
  }

  /**
   * 检验后端返回信息是否有问题
   * @param func
   * @returns {function(*=)}
   */
  checkRequestSuccess = (func) => {
    return (result) => {
      console.log('检验后端返回信息是否有问题',result);
      if (result.code === 1) {
        func(result);
      } else if (result.code === 403) {
        Alert.alert('警告', '用户在其他设备登录code === 403',
          [
            {
              text: 'OK',
              onPress: () => this.props.navigation.navigate('LoginScreen'),
            },
          ],
          { cancelable: false });
      } else {
        Alert.alert('警告', result.message);
      }
    };
  };

  componentDidMount() {
    this.getUserList();
  }

  getUserList() {
    this.socket.emit('userJoined', {
      username: this.state.username,
      token: this.state.token,
    }, this.checkRequestSuccess((result) => {
      console.log('获取到用户返回信息:', result);
      this.setState({
        userId: result.data._id
      });
      //
      this.socket.emit('getAllUserList', {},
        this.checkRequestSuccess((result2) => {
          console.log('获取全部用户信息:', result2);
          this.setState({
            userList: result2.data,
          });
        }));
      //
      this.socket.emit('getHistoryChat', {},
        this.checkRequestSuccess((result2) => {
          console.log('获取到用户历史消息:', result2);
          this.setState({
            historyUserList: result2.data,
          });
        }));
    }));
  }
  _golongin(){
    this.props.navigation.navigate('LoginScreen');
  }

  render() {
    const { userList, online } = this.state;
    return (
      <View style={{ flex: 1 }}>

        {this.state.modalVisible ? (
          <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {}}
          >
            <Chat
              refs={(s) => this.chat = s}
              params={{
              userId: this.state.userId,
              socket: this.socket,
              username: this.state.username,
              token: this.state.token,
              currentChat: this.state.currentChat,
            }}
              goBack={this.goBack}
            />
          </Modal>) : null}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.loading}
          onRequestClose={() => {}}
        ><View><Text>
          加载中...
        </Text></View></Modal>
        <TouchableOpacity onPress={()=>this._golongin()}>
          <View style={{marginTop:30}}>
            <Text>
              重新登录
            </Text>
          </View>
        </TouchableOpacity>
        <WhiteSpace size="lg" />
        <NoticeBar marqueeProps={{ loop: false}}>
        
          Notice: The arrival time of incomes and transfers of Yu &#39;E Bao will be delayed during National Day.
        </NoticeBar>
        <Tabs
          tabs={tabs}
          initialPage={0}
          onChange={(tab, index) => {
            console.log('onChange', index, tab);
          }}
          onTabClick={(tab, index) => {
            console.log('onTabClick', index, tab);
          }}
        >
          <List
            renderHeader={() => '最近聊天用户'}
          >
            {
              this.state.historyUserList.map((item, index) => {
                // console.log('this.state.historyUserList.map',item)
                return (
                  <Item
                    key={index}
                    thumb="https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png"
                    extra={''}
                    arrow="horizontal"
                    onClick={() => {
                      console.log('1111111111111111111');
                      this.setState({
                        modalVisible: true,
                      });
                    }}
                  >{item.groupsId.name}</Item>
                );
              })
            }
          </List>
          <ScrollView>
          <List
            renderHeader={() => '所有用户列表'}
            renderFooter={() => `总共${userList.length}人`}
          >
            {
              this.state.userList.map((item, index) => {
                return (<Item
                  key={index}
                  thumb={item.avatar || DEFAULT_AVATAR}
                  onClick={() => {
                    this.clickUserHandle({
                      userId: item._id,
                      username: item.username,
                      avatar: item.avatar || DEFAULT_AVATAR,
                    });
                  }}
                >{item.username}</Item>);
              })
            }
          </List>
          </ScrollView>
        </Tabs>
      </View>
    );
  }
  goBack = () => {
    this.setState({
      modalVisible: false,
    });
  };
  // 点击用户打开聊天
  clickUserHandle = ({ userId, username, avatar }) => {
    this.setState({
      loading: true,
    });
    // 打开用户聊天窗口
    this.socket.emit('openUserChat', { userId, type: 1 },
      this.checkRequestSuccess((result) => {
        console.log(result);
        this.setState({
          modalVisible: true,
          loading: false,
          currentChat: {
            userId,
            username,
            avatar,
            groupsId: result.data.groupsId,
          },
        }, () => {
          // this.chat.onSend(result.data.records);
        });
      }));
  };
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

