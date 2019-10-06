import React, {Component} from 'react';
import {View, Text, StatusBar} from 'react-native';
import { colors } from '../../../constants/themeContants';

export default class CustomStatusBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <StatusBar
          {...this.props}
          translucent={false}
          backgroundColor={colors.secondaryColor}
          barStyle="dark-content"
        />
    );
  }
}
