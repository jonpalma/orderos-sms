/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, TouchableOpacity, YellowBox, FlatList, DeviceEventEmitter} from 'react-native';
import SmsAndroid  from 'react-native-get-sms-android';
import socketIO from 'socket.io-client';
import queueFactory from 'react-native-queue';
import RedisClient from "react-native-redispubsub";

YellowBox.ignoreWarnings(['Remote debugger']);

export default class App extends Component {
  state =  {
    unsendMessages: []
  }
  constructor(props) {
    super(props);
    RedisClient.redisConnect("redis://h:paed030d5f2a4ee27e3da51d57d1c0c38a5256b5c65de8c2e76b2c7370e4172cb@ec2-18-206-37-137.compute-1.amazonaws.com:25989");
    RedisClient.subscribe("sendMessage");

    DeviceEventEmitter.addListener('sendMessage', function(e) {
        alert(e);
    });
  }
  async componentDidMount(){
    this.queue = await queueFactory();
    this.queue.addWorker('sendMessage', async (id, message) => {
      await new Promise((resolve) => {
          this.sendMessage(message)
          resolve();
      });
    
    });
    const socket = socketIO('https://useful-theory-228316.appspot.com', {      
      transports: ['websocket'], jsonp: false });   
      socket.connect(); 
      socket.on('message', (message) => {
        this.queue.createJob('sendMessage', message, {}, true);
      })
  }
  sendMessage = async (message) => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      SmsAndroid.autoSend(message.number, message.message, (fail) => {
        message.error = fail
        this.setState({
          unsendMessages: [
            ...this.unsendMessages,
            message
          ]
        })
      }, (success) => {
      });
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
      );
      this.sendMessage(message);
    }
  }
  resendFailed = () => {
    let i = this.state.unsendMessages.length
    let messages = this.state.unsendMessages
    while(i--){
      this.sendMessage(messages[i])
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Order Os SMS</Text>
        <View style={styles.failbox}>
          <FlatList
            data={this.state.unsendMessages}
            keyExtractor={(item, index) => `${item.number}${item.message}${index}`}
            renderItem={({item}) => 
            <View style={styles.rowFail}>
              <Text style={styles.textFail}>Numero: {item.number}</Text>
              <Text style={styles.textFail}>Mensaje: {item.message}</Text>
              <Text style={styles.textFail}>Error: {item.error}</Text>
            </View>
            }
          />
        </View>
        <TouchableOpacity style={styles.buttonResend} onPress={this.resendFailed}>
          <Text style={{color:'white'}}>Reenviar fallidos</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  rowFail: {
    height: 70,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 10
  },
  failbox: {
    height: '60%',
    width: '80%',
    backgroundColor: '#323232'
  },
  textFail: {
    color: 'white'
  },
  buttonResend: {
    width: '80%',
    margin: 20,
    backgroundColor: 'red',
    height: 40,
    alignItems: 'center',
    textAlign: 'center',
    padding:10
  }
});
