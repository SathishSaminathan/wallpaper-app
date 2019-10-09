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
          translucent={true}
          backgroundColor={this.props.backgroundColor}
          {...this.props}
          barStyle="dark-content"
          animated
        />
    );
  }
}

CustomStatusBar.defaultProps = {
  backgroundColor: colors.transparent,
};