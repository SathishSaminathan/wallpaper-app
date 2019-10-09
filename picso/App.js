/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  CameraRoll,
  PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'react-native-fetch-blob';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import CustomStatusBar from './app/components/_shared/statusbar';
import {colors, type} from './app/constants/themeContants';
import CustomText from './app/components/_shared/customtext';
import Axios from 'axios';
import {UNPLASH_ACCESS_KEY} from './app/constants/appContants';

const {width, height} = Dimensions.get('window');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      images: [],
      isImageFocused: false,
      scale: new Animated.Value(1),
    };

    this.scale = {
      transform: [{scale: this.state.scale}],
    };

    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, -80],
    });
  }

  componentDidMount() {
    this.fetchImages();
  }

  fetchImages = () => {
    Axios.get(
      `https://api.unsplash.com/photos/random?count=30&client_id=${UNPLASH_ACCESS_KEY}`,
    )
      .then(res => {
        this.setState(
          {
            isLoading: false,
            images: res.data,
          },
          () => {
            console.log(res);
          },
        );
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  };

  showControls = item => {
    this.setState(
      state => ({
        isImageFocused: !state.isImageFocused,
      }),
      () => {
        if (this.state.isImageFocused) {
          Animated.spring(this.state.scale, {
            toValue: 0.9,
            friction: 7,
          }).start();
        } else {
          Animated.spring(this.state.scale, {
            toValue: 1,
          }).start();
        }
      },
    );
  };

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  saveToCameraRoll = () => {
    this.requestCameraPermission();
  };

  renderItem = ({item}) => (
    <View style={{flex: 1}}>
      <View
        style={{
          backgroundColor: colors.primaryColor,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator
          size="large"
          color={colors.secondaryColor}></ActivityIndicator>
      </View>
      <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
        <Animated.View style={[{height, width}, this.scale]}>
          <Image
            style={{flex: 1, height: null, width: null}}
            source={{uri: item.urls.regular}}
            resizeMode="cover"
          />
        </Animated.View>
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: this.actionBarY,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: colors.secondaryColor,
        }}>
        <View style={styles.actionBarArea}>
          <TouchableOpacity
            style={styles.actionBarArea}
            activeOpacity={0.5}
            onPress={this.fetchImages}>
            <Ionicons style={styles.icons} name="ios-refresh" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBarArea} activeOpacity={0.5}>
            <Ionicons style={styles.icons} name="ios-share" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBarArea}
            activeOpacity={0.5}
            onPress={this.saveToCameraRoll}>
            <Ionicons style={styles.icons} name="ios-save" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  render() {
    const {isLoading, images, isImageFocused} = this.state;
    return (
      <SafeAreaView style={{backgroundColor: colors.primaryColor, flex: 1}}>
        <CustomStatusBar></CustomStatusBar>
        {isLoading ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color={colors.secondaryColor} />
          </View>
        ) : (
          <View style={{flex: 1}}>
            <FlatList
              scrollEnabled={!isImageFocused}
              horizontal
              pagingEnabled
              data={images}
              keyExtractor={item => item.id}
              renderItem={this.renderItem}></FlatList>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  actionBarArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  icons: {
    fontSize: 30,
  },
});

export default App;
