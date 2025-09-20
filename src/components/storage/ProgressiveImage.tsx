// =============================================================================
// PROGRESSIVE IMAGE COMPONENT - OPTIMIZED LOADING
// Epic #2: Profile Management - Progressive Image Loading
// =============================================================================
// Enterprise progressive image loading with Chilean optimization
// Author: Supabase Infrastructure Specialist
// Created: 2025-09-19

import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  Image,
  ImageStyle,
  ViewStyle,
  Animated,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ProgressiveImageProps } from '../../types/storage';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressiveImageState {
  isLoading: boolean;
  hasError: boolean;
  thumbnailLoaded: boolean;
  imageLoaded: boolean;
  errorMessage?: string;
}

// =============================================================================
// PROGRESSIVE IMAGE COMPONENT
// =============================================================================

const ProgressiveImage: React.FC<ProgressiveImageProps & {
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  showLoadingIndicator?: boolean;
  showErrorState?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  blurRadius?: number;
  fadeInDuration?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}> = memo(({
  src,
  thumbnailSrc,
  alt,
  width,
  height,
  className,
  onLoad,
  onError,
  priority = false,
  blur = true,
  style,
  containerStyle,
  showLoadingIndicator = true,
  showErrorState = true,
  retryOnError = true,
  maxRetries = 3,
  blurRadius = 1,
  fadeInDuration = 300,
  resizeMode = 'cover'
}) => {
  const [state, setState] = useState<ProgressiveImageState>({
    isLoading: true,
    hasError: false,
    thumbnailLoaded: false,
    imageLoaded: false
  });

  const retryCount = useRef(0);
  const thumbnailOpacity = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;

  // Calculate responsive dimensions
  const imageWidth = width || screenWidth;
  const imageHeight = height || (imageWidth * 0.75); // Default 4:3 aspect ratio

  useEffect(() => {
    // Reset state when src changes
    setState({
      isLoading: true,
      hasError: false,
      thumbnailLoaded: false,
      imageLoaded: false
    });
    retryCount.current = 0;

    // Reset animations
    thumbnailOpacity.setValue(0);
    imageOpacity.setValue(0);
    loadingOpacity.setValue(1);
  }, [src, thumbnailSrc]);

  const handleThumbnailLoad = () => {
    setState(prev => ({ ...prev, thumbnailLoaded: true }));

    Animated.timing(thumbnailOpacity, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true
    }).start();
  };

  const handleImageLoad = () => {
    setState(prev => ({
      ...prev,
      imageLoaded: true,
      isLoading: false
    }));

    // Fade in main image
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true
    }).start(() => {
      // Fade out loading indicator and thumbnail
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: fadeInDuration,
          useNativeDriver: true
        }),
        thumbnailSrc ? Animated.timing(thumbnailOpacity, {
          toValue: 0,
          duration: fadeInDuration,
          useNativeDriver: true
        }) : Animated.timing(loadingOpacity, { toValue: 0, duration: 0, useNativeDriver: true })
      ]).start();
    });

    onLoad?.();
  };

  const handleImageError = (error: any) => {
    console.error('Image load error:', error);

    if (retryOnError && retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`Retrying image load (attempt ${retryCount.current}/${maxRetries})`);

      // Small delay before retry
      setTimeout(() => {
        setState(prev => ({ ...prev, hasError: false }));
      }, 1000 * retryCount.current); // Exponential backoff
      return;
    }

    setState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
      errorMessage: error?.nativeEvent?.error || 'Failed to load image'
    }));

    Animated.timing(loadingOpacity, {
      toValue: 0,
      duration: fadeInDuration,
      useNativeDriver: true
    }).start();

    onError?.(new Error(error?.nativeEvent?.error || 'Image load failed'));
  };

  const handleRetry = () => {
    retryCount.current = 0;
    setState({
      isLoading: true,
      hasError: false,
      thumbnailLoaded: false,
      imageLoaded: false
    });

    // Reset animations
    thumbnailOpacity.setValue(0);
    imageOpacity.setValue(0);
    loadingOpacity.setValue(1);
  };

  const combinedContainerStyle: ViewStyle = [
    styles.container,
    {
      width: imageWidth,
      height: imageHeight
    },
    containerStyle
  ].filter(Boolean) as ViewStyle;

  const combinedImageStyle: ImageStyle = [
    styles.image,
    {
      width: imageWidth,
      height: imageHeight
    },
    style
  ].filter(Boolean) as ImageStyle;

  return (
    <View style={combinedContainerStyle}>
      {/* Thumbnail layer (blurred, loads first) */}
      {thumbnailSrc && (
        <Animated.View
          style={[
            styles.layer,
            {
              opacity: thumbnailOpacity,
              zIndex: 1
            }
          ]}
        >
          <Image
            source={{ uri: thumbnailSrc }}
            style={combinedImageStyle}
            onLoad={handleThumbnailLoad}
            onError={() => console.warn('Thumbnail load failed')}
            resizeMode={resizeMode}
            accessibilityLabel={`${alt} thumbnail`}
          />
          {blur && state.thumbnailLoaded && !state.imageLoaded && (
            <BlurView
              intensity={80}
              style={StyleSheet.absoluteFill}
              tint="light"
            />
          )}
        </Animated.View>
      )}

      {/* Main image layer */}
      {!state.hasError && (
        <Animated.View
          style={[
            styles.layer,
            {
              opacity: imageOpacity,
              zIndex: 2
            }
          ]}
        >
          <Image
            source={{ uri: src }}
            style={combinedImageStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode={resizeMode}
            accessibilityLabel={alt}
            priority={priority ? 'high' : 'normal'}
          />
        </Animated.View>
      )}

      {/* Loading indicator */}
      {showLoadingIndicator && state.isLoading && !state.hasError && (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingOpacity,
              zIndex: 3
            }
          ]}
        >
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.loadingIndicator}
          />
          <Text style={styles.loadingText}>Cargando imagen...</Text>
        </Animated.View>
      )}

      {/* Error state */}
      {showErrorState && state.hasError && (
        <View style={[styles.errorContainer, { zIndex: 4 }]}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={styles.errorTitle}>Error al cargar imagen</Text>
          <Text style={styles.errorMessage}>
            {state.errorMessage || 'No se pudo cargar la imagen'}
          </Text>
          {retryOnError && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              accessibilityLabel="Reintentar cargar imagen"
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

// =============================================================================
// AVATAR PROGRESSIVE IMAGE (SPECIALIZED)
// =============================================================================

export const AvatarProgressiveImage: React.FC<{
  src?: string | null;
  thumbnailSrc?: string | null;
  size: number;
  userName?: string;
  style?: ImageStyle;
  onPress?: () => void;
}> = memo(({ src, thumbnailSrc, size, userName, style, onPress }) => {
  const initials = userName
    ?.split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  const avatarStyle: ImageStyle = [
    {
      width: size,
      height: size,
      borderRadius: size / 2
    },
    style
  ].filter(Boolean) as ImageStyle;

  if (!src) {
    // Fallback to initials avatar
    return (
      <TouchableOpacity
        style={[
          styles.avatarFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
        onPress={onPress}
        disabled={!onPress}
        accessibilityLabel={`Avatar de ${userName || 'usuario'}`}
        accessibilityRole="image"
      >
        <Text
          style={[
            styles.avatarInitials,
            { fontSize: size * 0.4 }
          ]}
        >
          {initials}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{ borderRadius: size / 2, overflow: 'hidden' }}
      accessibilityLabel={`Avatar de ${userName || 'usuario'}`}
      accessibilityRole="image"
    >
      <ProgressiveImage
        src={src}
        thumbnailSrc={thumbnailSrc}
        alt={`Avatar de ${userName || 'usuario'}`}
        width={size}
        height={size}
        style={avatarStyle}
        showLoadingIndicator={false}
        blur={false}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
});

AvatarProgressiveImage.displayName = 'AvatarProgressiveImage';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden'
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  image: {
    width: '100%',
    height: '100%'
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  loadingIndicator: {
    marginBottom: 8
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  avatarFallback: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitials: {
    color: 'white',
    fontWeight: '600'
  }
});

export default ProgressiveImage;