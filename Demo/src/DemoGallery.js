import React, { Component } from 'react';
import {
    Animated,
    Image,
    ScrollView,
    View,
    SafeAreaView,
    Text,
    Modal,
    Dimensions,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import Gallery from 'react-native-image-gallery';

import Item from './item';

const ANIM_CONFIG = {duration: 300};
const ORIENTATION_OPTIONS = ['portrait', 'landscape'];

export default class DemoGallery extends Component {
    constructor (props) {
        super(props);

        this.state = {
            fullscreen: false,
            index: 0,
            images: [
                {
                    caption: 'This image is bundled with the app, so you must provide dimensions for it',
                    source: require('./static/images/placehold.jpg'),
                    dimensions: { width: 540, height: 720 }
                },
                {
                    caption: 'This image has a broken URL',
                },
                {
                    caption: 'Remote image with supplied dimensions',
                    source: { uri: 'http://i.imgur.com/gSmWCJF.jpg' },
                    dimensions: { width: 1200, height: 800 }
                },
                { caption: 'Caption 4', source: { uri: 'http://i.imgur.com/XP2BE7q.jpg' } },
                { caption: 'Caption 5', source: { uri: 'http://i.imgur.com/5nltiUd.jpg' } },
                { caption: 'Caption 6', source: { uri: 'http://i.imgur.com/6vOahbP.jpg' } },
                { caption: 'Caption 7', source: { uri: 'http://i.imgur.com/kj5VXtG.jpg' } },
                { caption: 'Caption 8', source: { uri: 'http://i.imgur.com/BN8RVGa.jpg' } },
                { caption: 'Caption 9', source: { uri: 'http://i.imgur.com/jXbhTbv.jpg' } },
                { caption: 'Caption 10', source: { uri: 'http://i.imgur.com/30s12Qj.jpg' } },
                { caption: 'Caption 11', source: { uri: 'http://i.imgur.com/4A1Q49y.jpg' } },
                { caption: 'Caption 12', source: { uri: 'http://i.imgur.com/JfVDTF9.jpg' } },
                { caption: 'Caption 13', source: { uri: 'http://i.imgur.com/Vv4bmwR.jpg' } }
            ],
            origin: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            target: {
                x: 0,
                y: 0,
                opacity: 1
            }
        };

        this.items = [];
        this.imageItems = [];

        this.openAnim = new Animated.Value(0);
        this.headerFooterAnim = new Animated.Value(1);
    }

    get header () {
        const { index, images } = this.state;
        const header = this.getHeaderFooterStyle();

        return (
            <TouchableWithoutFeedback onPress={this.close}>
                <Animated.View style={[{top: header.start, opacity: header.opacity}, styles.headerContainer]}>
                    <Text style={styles.headerText}>{ index + 1 } / { images.length }</Text>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    get footer () {
        const { images, index } = this.state;
        const footer = this.getHeaderFooterStyle();
        return (
            <Animated.View style={[{bottom: footer.start, opacity: footer.opacity}, styles.footerContainer]}>
                <Text style={styles.footerText}>{ (images[index] && images[index].caption) || '' } </Text>
            </Animated.View>
        );
    }

    get gallery () {
        return (
            <Gallery
              errorComponent={this.renderError}
              flatListProps={{initialNumToRender: this.state.images.length}}
              images={this.state.images}
              imageComponent={this.renderGalleryItem}
              initialPage={this.state.index}
              onLayout={this.handleGalleryLayout}
              onPageSelected={this.handleChangeImage}
              onSingleTapConfirmed={this.handleTapped}
              onSwipedVertical={this.handleSwipedVertical}
              pageMargin={2}
              style={styles.flex}
            />
        );
    }

    open = (idx) => {
        const component = this.items[idx];

        if (!component) {
            return;
        }

        component.measure((rx, ry, width, height, x, y) => {
            this.setState(
                {
                    fullscreen: true,
                    index: idx,
                    animating: true,
                    origin: {x, y, width, height},
                    target: {x: 0, y: 0, opacity: 1}
                },
                () => {
                    this.animateOpenAnimToValue(1, () => {
                        this.setState({gallery: true});
                    });
                }
            );
        });
    };

    close = () => {
        const activeComponent = this.items[this.state.index];
        if (!activeComponent) return;

        this.setState({animating: true, gallery: false, hide: false});

        activeComponent.measure((rx, ry, width, height, x, y) => {
            this.setState({
                origin: {x, y, width, height},
                slidesDown: x + width < 0 || x > Dimensions.get('window').width
            });

            this.animateOpenAnimToValue(0, () => {
                this.setState({fullscreen: false});
            });
        });
    };

    animateOpenAnimToValue = (toValue, onComplete) => {
        Animated.timing(this.openAnim, {
            ...ANIM_CONFIG,
            toValue
        }).start(() => {
            this.setState({animating: false});
            if (onComplete) {
                onComplete();
            }
        });
    };

    captureItemRef = (ref, idx) => {
        this.items[idx] = ref;
    };

    captureImageRef = (ref, idx) => {
        this.imageItems[idx] = ref;
    };

    getFullscreenOpacity = () => {
        const {target} = this.state;

        return {
            opacity: this.openAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, target.opacity]
            })
        };
    };

    getHeaderFooterStyle = () => {
        return {
            start: this.headerFooterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-80, 0]
            }),
            opacity: this.headerFooterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1]
            })
        };
    };

    getSwipeableStyle = (idx) => {
        const {fullscreen, origin, index, target} = this.state;

        if (!fullscreen || idx !== index) {
            return {flex: 1};
        }

        const inputRange = [0, 1];
        const dimensions = Dimensions.get('window');

        return {
            left: this.openAnim.interpolate({
                inputRange,
                outputRange: [origin.x, target.x]
            }),
            top: this.openAnim.interpolate({
                inputRange,
                outputRange: [origin.y, target.y]
            }),
            width: this.openAnim.interpolate({
                inputRange,
                outputRange: [origin.width, dimensions.width]
            }),
            height: this.openAnim.interpolate({
                inputRange,
                outputRange: [origin.height, dimensions.height]
            })
        };
    };

    handleChangeImage = (index) => {
        this.setState({index});
    };

    handleGalleryLayout = () => {
        this.setState({hide: true});
    };

    handleSwipedVertical = (evt, gestureState) => {
        if (Math.abs(gestureState.dy) > 150) {
            this.close();
        }
    };

    handleTapped = () => {
        const {showHeaderFooter} = this.state;
        const toValue = showHeaderFooter ? 1 : 0;
        this.setState({showHeaderFooter: !showHeaderFooter});
        Animated.timing(this.headerFooterAnim, {
            duration: 150,
            toValue
        }).start();
    };

    renderError = () => {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>This image cannot be displayed...</Text>
                <Text style={styles.errorText}>... but this is fine :)</Text>
            </View>
        );
    };

    renderFullScreen = () => {
        const opacity = this.getFullscreenOpacity();

        return (
            <Modal
              transparent={true}
              visible={this.state.fullscreen}
              onRequestClose={this.close}
              supportedOrientations={ORIENTATION_OPTIONS}
            >
                <SafeAreaView style={styles.container}>
                    <Animated.View style={[styles.container, opacity]}>
                        {this.renderSelectedItem()}
                        {this.state.gallery && this.gallery}
                        { this.header }
                        { this.footer }
                    </Animated.View>
                </SafeAreaView>
            </Modal>
        );
    };

    renderGalleryItem = (imageProps) => {
        return (
            <Image
              {...imageProps}
              resizeMode='contain'
            />
        );
    };

    renderItems = () => {
        return this.state.images.map((imageProps, idx) => {
            return (
                <Item
                  imageProps={imageProps}
                  imageStyle={{height: 200, width: 300}}
                  index={idx}
                  key={`image-${idx}`}
                  onCaptureImageReference={this.captureImageRef}
                  onCaptureReference={this.captureItemRef}
                  onPress={this.open}
                  style={[styles.flex, styles.center]}
                />
            );
        });
    };

    renderSelectedItem = () => {
        const {hide} = this.state;

        if (hide) {
            return null;
        }

        const containerStyle = [this.getSwipeableStyle(this.state.index)];
        const component = this.imageItems[this.state.index];

        return (
            <ScrollView scrollEnabled={false}>
                <Animated.View style={[styles.selectedItemContainer, containerStyle]}>
                    <Image
                      source={component.props.source}
                      style={[StyleSheet.absoluteFill, styles.fullWidth]}
                      resizeMode='contain'
                    />
                </Animated.View>
            </ScrollView>
        );
    };

    render () {
        return (
            <View style={{flex: 1}}>
                <ScrollView
                  horizontal={true}
                  alwaysBounceHorizontal={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.center}
                >
                    {this.renderItems()}
                    {this.state.fullscreen && this.renderFullScreen()}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    flex: {
        flex: 1
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorText: {
        color: '#fff',
        fontSize: 15,
        fontStyle: 'italic'
    },
    footerContainer: {
        height: 65,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        width: '100%',
        position: 'absolute',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    footerText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        fontStyle: 'italic'
    },
    headerContainer: {
        height: 65,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: '100%',
        position: 'absolute',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    headerText: {
        textAlign: 'right',
        color: '#fff',
        fontSize: 15,
        fontStyle: 'italic',
        paddingRight: '10%'
    },
    selectedItemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    fullWidth: {
        width: '100%'
    }
});
