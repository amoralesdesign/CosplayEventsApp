import * as React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const progress = useSharedValue(0);
  const ref = React.useRef<ICarouselInstance>(null);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View>
      <Carousel
        ref={ref}
        loop
        width={width}
        autoPlay={true}
        autoPlayInterval={2000}
        height={260}
        data={images}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          </View>
        )}
      />
      {/* Paginación con estilos ajustados */}
      <View style={styles.paginationContainer}>
        <Pagination.Basic
          progress={progress}
          data={images}
          dotStyle={{ backgroundColor: '#fff', borderRadius: 16 }}
          activeDotStyle={{ backgroundColor: 'red' }}
          containerStyle={{ gap: 10 }}
          onPress={onPressPagination}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: '100%',
    height: 260,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  paginationContainer: {
    zIndex: 2, // Asegura que la paginación esté por encima del avatar
    position: 'relative',
    top: -60, // Ajusta la posición hacia arriba
  },
});

export default ImageCarousel;