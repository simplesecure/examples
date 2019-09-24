import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button
} from 'react-native';

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restore: false, 
      username: "", 
      password: "", 
      email: ""
    }
  }
  render() {
    const { restore, username, password, email } = this.state;
    
  }
}