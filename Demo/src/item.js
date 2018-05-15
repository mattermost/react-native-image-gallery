// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Image, TouchableWithoutFeedback, View} from 'react-native';

export default class Item extends PureComponent {
    static propTypes = {
        imageProps: PropTypes.object.isRequired,
        imageStyle: PropTypes.oneOfType([
            PropTypes.object, // inline style
            PropTypes.number, // style sheet entry
            PropTypes.array
        ]),
        index: PropTypes.number.isRequired,
        onCaptureReference: PropTypes.func,
        onCaptureImageReference: PropTypes.func,
        onPress: PropTypes.func,
        style: PropTypes.oneOfType([
            PropTypes.object, // inline style
            PropTypes.number, // style sheet entry
            PropTypes.array
        ])
    };

    handlePress = () => {
        const {index, onPress} = this.props;

        if (onPress) {
            onPress(index);
        }
    };

    handleCaptureReference = (ref) => {
        const {index, onCaptureReference} = this.props;

        if (onCaptureReference) {
            onCaptureReference(ref, index);
        }
    };

    handleCaptureImageReference = (ref) => {
        const {index, onCaptureImageReference} = this.props;

        if (onCaptureImageReference) {
            onCaptureImageReference(ref, index);
        }
    };

    render () {
        return (
            <TouchableWithoutFeedback onPress={this.handlePress}>
                <View
                  ref={this.handleCaptureReference}
                  style={this.props.style}
                >
                    <Image
                      ref={this.handleCaptureImageReference}
                      style={this.props.imageStyle}
                      resizeMode='cover'
                      source={this.props.imageProps.source}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}