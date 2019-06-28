/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, TouchableOpacity, YellowBox, FlatList, ScrollView, Dimensions, Alert} from 'react-native';
import SmsAndroid  from 'react-native-get-sms-android';
import socketIO from 'socket.io-client';
// import queueFactory from 'react-native-queue';
const screenHeight = Dimensions.get('window').height

YellowBox.ignoreWarnings(['Remote debugger']);

export default class App extends Component {
  state =  {
    consoleMessages: [],
    sended: 0
  }
  
  async componentDidMount(){
    // this.queue = await queueFactory();
    // this.queue.addWorker('sendMessage', async (id, message) => {
    //   await new Promise(async (resolve) => {
    //       await this.sendMessage(message, resolve)
    //   });
    
    // });
    const socket = socketIO('https://order-os.appspot.com/', {      
      transports: ['websocket'], jsonp: false });   
      socket.connect();
      socket.on('connect', () => {
        this.addMessageToScreen({
          message: 'Conectado al socket'
        })
      }) 
      socket.on('disconnect', () => {
        this.addMessageToScreen({
          message: 'Desconectado del socket, chequen el internet'
        })
      }) 
      socket.on('reconnect', () => {
        this.addMessageToScreen({
          message: 'Intentando reconeccion'
        })
      }) 
      socket.on('message', (message) => {
        this.sendMessage(message)
        // this.queue.createJob('sendMessage', message, {}, true);
      })
  }
  addMessageToScreen = (message) => {
    this.setState({
      consoleMessages: [
        ...this.state.consoleMessages,
        message
      ]
    })
  } 
  sendMessage = async (message) => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      SmsAndroid.autoSend(message.phoneNumber, message.message, (fail) => {
        message.error = fail
        message.type = 'error'
        this.setState({
          consoleMessages: [
            ...this.state.consoleMessages,
            message
          ]
        })
      }, (success) => {
        let message = {
          message: 'Se ah enviado un nuevo mensaje'
        }
        this.setState({
          sended: this.state.sended+1,
          message: [
            ...this.state.consoleMessages,
            message
          ]
        })
      });
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
      );
      await this.sendMessage(message);
    }
  }
  resendFailed = () => {
    let i = this.state.consoleMessages.length
    let messages = this.state.consoleMessages
    while(i--){
      if(messages[i].type == 'error')
        this.sendMessage(messages[i])
    }
  }
  _renderMessage = ({item}) => {
    if(item.type == 'error'){
      return (
        <View style={styles.rowFail}>
          <Text style={styles.textFail}>Numero: {item.phoneNumber}</Text>
          <Text style={styles.textFail}>Mensaje: {item.message}</Text>
          <Text style={styles.textFail}>Error: {item.error}</Text>
        </View>
      )
    } else {
      return (
        <View style={styles.rowFail}>
          <Text style={styles.textFail}>{item.message}</Text>
        </View>
      )
    }
  }
  _resetCounter = () => {
    Alert.alert(
      'Cuidado',
      'Estan seguros?',
      [
        {text: 'OK', onPress: () => this.setState({sended: 0})},
      ],
      {cancelable: true},
    );
  }
  _resetConsole = () => {
    Alert.alert(
      'Cuidado',
      'Estan seguros?',
      [
        {text: 'OK', onPress: () => this.setState({ consoleMessages: [] })},
      ],
      {cancelable: true},
    );
  }
  render() {
    return (
      <ScrollView style={{flex:1}}>
        <View style={styles.container}>
          <Text style={styles.welcome}>Order Os SMS</Text>
          <Text style={styles.welcome}>Mensajes Enviados: {this.state.sended}</Text>
          <View style={styles.failbox}>
            <FlatList
              data={this.state.consoleMessages}
              keyExtractor={(item, index) => `${item.phoneNumber}${item.message}${index}`}
              renderItem={this._renderMessage}
            />
          </View>
          <TouchableOpacity style={styles.buttonReset} onPress={this._resetCounter}>
            <Text style={{color:'white'}}>Reiniciar contador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonDeleteConsole} onPress={this._resetConsole}>
            <Text style={{color:'white'}}>Borrar consola</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonResend} onPress={this.resendFailed}>
            <Text style={{color:'white'}}>Reenviar fallidos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  rowFail: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 10
  },
  failbox: {
    height: screenHeight*.5,
    width: '80%',
    backgroundColor: '#323232'
  },
  textFail: {
    color: 'white'
  },
  buttonResend: {
    width: '80%',
    marginTop: 20,
    backgroundColor: 'red',
    height: 40,
    alignItems: 'center',
    textAlign: 'center',
    padding:10
  },
  buttonReset: {
    width: '80%',
    marginTop: 20,
    backgroundColor: 'green',
    height: 40,
    alignItems: 'center',
    textAlign: 'center',
    padding:10
  },
  buttonDeleteConsole: {
    width: '80%',
    marginTop: 20,
    backgroundColor: 'blue',
    height: 40,
    alignItems: 'center',
    textAlign: 'center',
    padding:10
  }
});
