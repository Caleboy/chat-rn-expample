/**
 * 聊天窗口组件
 * Created by zhangsong on 2018/3/12.
 */
import React, { Component } from 'react';
import {
  GiftedChat,
  Actions,
  Bubble,
  SystemMessage,
} from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-crop-picker';
import moment from 'moment';
import SocketIOClient from 'socket.io-client';
import {
  AppRegistry,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import {
  Flex,
  Button,
  List,
  InputItem,
  Tabs,
  WhiteSpace,
  Badge,
} from 'antd-mobile';
import Video from 'react-native-video';
import Request from '../../../utils/request';
import config from '../../../config/index';
import uuid from 'uuid';
const DEFAULT_AVATAR = 'https://upload.jianshu.io/users/upload_avatars/9393582/51f6f9e9-0a3a-44df-bd9d-9c4fbaed5edb?imageMogr2/auto-orient/strip|imageView2/1/w/120/h/120';
export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.socket = this.props.params.socket;

    this.state = {
      oid: null,
      loadEarlier: true,
      messages: [],
      userId: this.props.params.userId,
      username: this.props.params.username,
      avatar: this.props.params.currentChat.avatar,
      token: this.props.params.token,
      groupsId: this.props.params.currentChat.groupsId,
      online: false, // 是否在线
      opposite: this.props.params.currentChat,      // 聊天对象的用户信息
      modalVisible:true
    };
    console.log(config.Config.host);
  }
  onLoadEarlierHandle = (...arg) => {
    console.log('加载早期消息回调函数');
    this.loadHistoryRecord();
  };

  loadHistoryRecord = () => {
    this.socket.emit('getHistoryMessage', {
      userId: this.state.opposite.userId,
      oid: this.state.oid,
      groupsId: this.state.groupsId,
    }, (result) => {
      if (result.code === 1) {
        const arr = result.data.message.map((item) => {
          console.log(item);
          if (item.data.user._id !== this.state.userId) {
            item.createdAt = item.receiveAt;
          }
          return item.data;
        });
        this.setState(previousState => {
          const params = {};
          if (result.data.message.length !== result.data.pageSize) {
            params.loadEarlier = false;
            arr.push({
              _id: uuid.v4(),
              text: '没有更多消息了...',
              createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
              system: true,
            });
          } else {
            params.oid = result.data.message[result.data.message.length - 1]._id;
            console.log('oid:', params.oid);
          }
          // 像数据前面插入数据,类似数组的 unshift 方法
          params.messages = GiftedChat.prepend(previousState.messages, arr);
          return params;
        });
      } else {
        alert('返回状态码不对');
      }
    });
  };

  // 点击发送按钮事件处理
  sendBtnClickHandle = () => {
    /*
    {
  _id: 1,
  text: 'My message',
  createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
  user: {
    _id: 2,
    name: 'React Native',
    avatar: 'https://facebook.github.io/react/img/logo_og.png',
  },
  image: 'https://facebook.github.io/react/img/logo_og.png',
  // Any additional custom parameters are passed through
}
     */
  };
  onSend(messages = [], flag = true) {
    this.setState(previousState => {
      const params = {
        // 像数组尾部插入数据
        messages: GiftedChat.append(previousState.messages, messages),
      };
      return params;
    });
    if (flag) {
      console.log('groupsId:', this.state.groupsId);
      this.socket.emit('message', {
        messages,
        groupsId: this.state.groupsId,
      }, (result) => {
        this.setState({
          oid: result._id,
        });
      });
    }
  }

  /*  onSend = (messages = []) => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }));
      this.socket.emit('message', messages, (result) => {
        if (result === 'success') {
          console.log(`发送消息:${JSON.stringify(messages)} ,状态: ${result}`);
        }
      });
    };*/
    getData(value){
      let obj = { _id:uuid.v4() ,
                  image:value.image,
                  user: {
                    _id: this.state.userId, //发送方的ID 如果是自己的ID 则在右边，否则在左边
                    name: this.state.opposite.username, //发送方的昵称
                    avatar: this.state.avatar, //发送方的头像
                  },
                }
      return obj;
    }
  renderActions = (props) => {
    if (Platform.OS === 'ios') {
      return (
        <CustomActions
          {...props}
        />
      );
    }
    const options = {
      '拍照': (props) => {
        ImagePicker.openCamera({
          compressImageMaxWidth: 800,
          includeBase64:true
        }).then(image => {
          console.log('image',image);
          const obj = this.getData({ image: image.path });
          console.log('obj',obj)
          this.onSendFile(image.path, {
            mime: image.mime,
            path: image.path,
            message: obj,
            data:image.data
          });
          this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, [obj]),
          }));
        });
      },
      '选择照片': (props) => {
        ImagePicker.openPicker({
          mediaType: 'photo',
          multiple: true,
          compressImageMaxWidth: 800,
        }).then(images => {
          const arr = images.map((item) => {
            const obj = this.getData({ image: item.path });
            this.onSendFile(item.path, {
              mime: item.mime,
              path: item.path,
              message: obj,
            });
            return obj;
          });
          this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, arr),
          }));
        });
      },
      '选择视频': (props) => {
        ImagePicker.openPicker({
          cropping: false,
          mediaType: 'video',
        }).then((video) => {
          ToastAndroid.show(`选择视频成功,共${Math.floor(video.size / 1080 / 1080)}M`,
            ToastAndroid.SHORT);
          const obj = this.getData({ video: video.path, text: '接收到新的视频' });
          this.onSendFile(video.path, {
            mime: video.mime,
            path: video.path,
            message: obj,
          });
        });
      },
      '取消': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  };

  onSendFile = (uri, options = {}) => {
    const name = new Date().getTime();
    let filename = null;
    switch (options.mime) {
      case 'image/gif':
        filename = name + '.gif';
        break;
      case 'image/jpeg':
        filename = name + '.jpg';
        break;
      case 'video/mpeg':
        filename = name + '.mp4';
        break;
      case 'video/x-msvideo':
        filename = name + '.avi';
        break;
      default:
        filename = name;
    }
    console.log('filename',filename);
    let url = `${config.Config.host}/upload`;
    console.log('upload',url);
    let opt = {
      name: name, 
      filename: filename,
      type: options.mime, 
      data: options.data
    };
    console.log('opt',opt);
    Request(url, {
      method: 'POST',
      body: JSON.stringify(opt)
    }).then((result) => {
          console.log(result)
    })
    .catch((error)=>{
      console.log(error)
    })
    // RNFetchBlob.fetch('POST', url, {
    //   'Content-Type': 'multipart/form-data',
    // }, [
    //   { name: name, filename: filename, type: options.mime, data:options.data  },
    // ]).uploadProgress((written, total) => {
    //   console.log('uploaded', written / total);
    // }).progress((received, total) => {
    //   console.log('progress', received / total);
    // }).then((resp) => {
    //   return resp.json();
    // }).then((result) => {
    //   console.log(result.url);
    //   // 需要在这里判断,是图片还是视频还是文件
    //   if (options.mime.startsWith('image')) {
    //     options.message.image = result.url;
    //   } else if (options.mime.startsWith('video')) {
    //     options.message.video = result.url;
    //   }
    //   this.socket.emit('message', [options.message], (result) => {
    //     // 更新本地状态机中的消息内容
    //     //       ToastAndroid.show(`文件上传成功,返回 uri: ${result}`, ToastAndroid.SHORT);
    //   });
    // }).catch((err) => {
    //   ToastAndroid.show(`文件 发送失败:${err}`, ToastAndroid.SHORT);
    // });
  };

  goBack=()=> {
    this.props.goBack();
  };
  _onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else {
      if (this.props.currentMessage.text) {
        const options = [
          'Copy Text',
          'Cancel',
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions({
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.text);
              break;
          }
        });
      }
    }
  }

  renderSystemMessage=(props)=> {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    );
  };

  componentDidMount() {
    this.connect = this.socket.on(this.props.params.currentChat.groupsId, (messages)=> {
      console.log('接收到服务端消息:this.props.params.currentChat.groupsId', messages);
      const arr = messages.filter((item)=> {
        return item.user._id!==this.state.userId;
      });
      if(arr.length>0){
        this.setState(previousState => {
          const params = {
            // 像数组尾部插入数据
            messages: GiftedChat.append(previousState.messages, messages),
          };
          return params;
        });
      }
    });
    this.onLoadEarlierHandle();   //默认加载部分历史信息
  }

  componentWillUnmount() {
    // 组件卸载时,删除该东西
    this.socket.off(this.state.groupsId, function (err) {
      console.log('断开事件监听');
    });
  }

  render() {
    console.log('消息数组，用于展示消息',this.state.messages);
    return (
      <View style={{ flex: 1 }}>
        <View style={{backgroundColor: '#ccc',height: 40,justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ flexBasis: 40,display: 'flex',alignItems:'center',justifyContent:'center'}} onPress={this.goBack}>
              <Text>返回</Text>
            </TouchableOpacity>
          <View>
            <Text>{this.state.opposite ? this.state.opposite.username : null}</Text>
          </View>
          
          <View style={{ flexBasis: 40,}} />

          <Modal visible={this.state.modalVisible}>
          <Video
              source={{uri:'http://techslides.com/demos/sample-videos/small.mp4'}}
              style={styles.backgroundVideo}
              rate={1}                          // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
              paused={false}
              volume={1}                   // 声音的放大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
              muted={true}                  // true代表静音，默认为false.
              resizeMode='cover'       // 视频的自适应伸缩铺放行为，
              onLoad={()=>console.log('....')}                       // 当视频加载完毕时的回调函数
              onLoadStart={()=>console.log('....')}            // 当视频开始加载时的回调函数
              onProgress={()=>console.log('....')}   //  进度控制，每250ms调用一次，以获取视频播放的进度
              onEnd={()=>console.log('....')}             // 当视频播放完毕后的回调函数
              onError={(error)=>console.log('....',error)}    // 当视频不能加载，或出错后的回调函数
              onAudioBecomingNoisy={()=>console.log('....')}
              onAudioFocusChanged={()=>console.log('....')}
              repeat={false}                            // 是否重复播放
          />
          </Modal>
        </View>
        <GiftedChat
          messages={this.state.messages} //消息数组，用于展示消息 有特定的格式
          renderActions={this.renderActions} //自定义输入框左边的按钮
          loadEarlier={this.state.loadEarlier}   //是否显示加载更早的消息按钮 "Load earlier messages"
          onLoadEarlier={(...arg) => {   //加载更多消息时的回调
            this.onLoadEarlierHandle(...arg);
          }}
          renderSystemMessage={this.renderSystemMessage} //自定义系统消息
          onSend={messages => this.onSend(messages)}   //点击send时的回调
          locale="zh_TW"   //本地化日期
          user={{
            _id: this.state.userId,
            name: this.state.username,
            avatar: this.state.avatar,
            
          }}      //配置用户信息
          placeholder='请输入'   //输入框的占位字符
          renderAvatarOnTop={true}  //头像显示在顶部还是底部，默认是false底部
          // onLongPress={()=>this._onLongPress()}
        />

      </View>
    );
  }

}
const styles = StyleSheet.create({
  backgroundVideo: {
    width:200,
    height:300
  },
});
