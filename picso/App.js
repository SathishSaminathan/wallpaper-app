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
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
  Button,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'react-native-fetch-blob';
import CameraRoll from '@react-native-community/cameraroll';
import Share from 'react-native-share';
import SplashScreen from 'react-native-splash-screen';
import WallPaperManager from '@ajaybhatia/react-native-wallpaper-manager';
import Dialog, {DialogContent, SlideAnimation} from 'react-native-popup-dialog';

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
      visible: false,
      image: null,
    };

    this.scale = {
      transform: [{scale: this.state.scale}],
    };

    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, -100],
    });

    this.borderRadius = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [30, 0],
    });
  }

  checkForUpdates = () => {
    // ToastAndroid.showWithGravityAndOffset(
    //   'App is uptodate!',
    //   ToastAndroid.SHORT,
    //   ToastAndroid.BOTTOM,
    //   25,
    //   50,
    // );
  };

  componentDidMount() {
    // setTimeout(() => {
    //   let promise = new Promise(resolve => {
    //     this.checkForUpdates();
    //     resolve();
    //   });
    //   promise.then(() => {
    //     SplashScreen.hide();
    //     this.fetchImages();
    //   });
    // }, 2000);
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
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
            // console.log(res);
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
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Picso App requires Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.showWithGravityAndOffset(
          'Your Image is downloading...',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
        return true;
      } else {
        ToastAndroid.showWithGravityAndOffset(
          'Please grant permission to save the images...',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
    }
  };

  saveToCameraRoll = image => {
    const isGranted = this.requestCameraPermission();
    if (Platform.OS === 'android') {
      RNFetchBlob.config({
        fileCache: true,
        appendExt: 'jpg',
      })
        .fetch('GET', image.urls.full)
        .then(res => {
          CameraRoll.saveToCameraRoll(res.path())
            .then(() => {
              ToastAndroid.showWithGravityAndOffset(
                'Image added to Gallery!',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
                25,
                50,
              );
            })
            .catch(err => console.log('err:', err));
        });
    } else {
      CameraRoll.saveToCameraRoll(image.urls.small).then(
        Alert.alert('Success', 'Photo added to camera roll!'),
      );
    }
  };

  setWallPaper = (image, screen) => {
    WallPaperManager.setWallpaper({uri: image.urls.full, screen}, res => {
      ToastAndroid.showWithGravityAndOffset(
        screen === 'lock'
          ? 'Lock screen changed'
          : screen === 'both'
          ? 'Wallpaper and Lock Screen changed'
          : 'Wallpaper changed',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    });
  };

  shareImage = image => {
    const shareOptions = {
      title: 'Checkout the Image',
      message: 'Picso Image',
      url: image.urls.full,
    };
    Share.open(shareOptions);
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
        <ActivityIndicator size="large" color={colors.secondaryColor} />
      </View>
      <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
        <Animated.View style={[{height, width}, this.scale]}>
          <Animated.Image
            style={{
              flex: 1,
              height: null,
              width: null,
              borderRadius: this.borderRadius,
            }}
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
          borderRadius: this.borderRadius,
          backgroundColor: colors.secondaryColor,
        }}>
        <View style={styles.actionBarArea}>
          <TouchableOpacity
            style={styles.actionBarArea}
            activeOpacity={0.5}
            onPress={this.fetchImages}>
            <Ionicons style={styles.icons} name="ios-refresh" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBarArea}
            activeOpacity={0.5}
            onPress={() => this.shareImage(item)}>
            <Ionicons style={styles.icons} name="ios-share" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBarArea}
            activeOpacity={0.5}
            onPress={() => this.setState({visible: true, image: item})}>
            <Ionicons style={styles.icons} name="ios-settings" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBarArea}
            activeOpacity={0.5}
            onPress={() => this.saveToCameraRoll(item)}>
            <Ionicons style={styles.icons} name="ios-save" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  render() {
    const {isLoading, images, isImageFocused, visible, image} = this.state;
    return (
      <SafeAreaView style={{backgroundColor: colors.primaryColor, flex: 1}}>
        <Dialog
          dialogStyle={{
            backgroundColor: colors.transparent,
          }}
          onTouchOutside={() =>
            this.setState({
              visible: false,
              image: null,
            })
          }
          visible={visible}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'bottom',
            })
          }>
          <DialogContent>
            <TouchableOpacity
              onPress={() => this.setWallPaper(image, 'home')}
              style={{
                width: '100%',
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: colors.secondaryColor,
                borderRadius: 50,
              }}>
              <Text style={{color: colors.primaryColor}}>Set as Wallpaper</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setWallPaper(image, 'lock')}
              style={{
                width: '100%',
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: colors.primaryColor,
                borderRadius: 50,
                marginTop: 10,
              }}>
              <Text style={{color: colors.secondaryColor}}>
                Set as Lock screen
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => this.setWallPaper(image, 'both')}
              style={{
                width: '100%',
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: colors.primaryColor,
                borderRadius: 50,
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: colors.secondaryColor}}>Set for Both</Text>
            </TouchableOpacity> */}
          </DialogContent>
        </Dialog>
        <CustomStatusBar
          backgroundColor={
            isImageFocused ? colors.secondaryColor : colors.transparent
          }
          hidden={!isImageFocused}
        />
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
              renderItem={this.renderItem}
            />
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
