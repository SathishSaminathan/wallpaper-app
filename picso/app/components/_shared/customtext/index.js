import React from 'react';
import {Text, View} from 'react-native';
import {colors} from '../../../constants/themeContants';

const CustomText = props => (
  <View>
    <Text
      style={[
        {color: colors.secondaryColor, fontFamily: props.type, fontSize: 20},
        props.style,
      ]}>
      {props.children}
    </Text>
  </View>
);

export default CustomText;

CustomText.defaultProps = {
  type: 'Lato-Regular',
};
