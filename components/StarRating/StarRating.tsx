import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number; // Puntuación de 0 a 5
  size?: number; // Tamaño de las estrellas (opcional)
  color?: string; // Color de las estrellas (opcional)
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, color = '#ea266d' }) => {
  const fullStars = Math.floor(rating); // Estrellas completas
  const hasHalfStar = rating % 1 !== 0; // Media estrella
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Estrellas vacías

  return (
    <View style={styles.container}>
      {/* Estrellas completas */}
      {[...Array(fullStars)].map((_, index) => (
        <FontAwesome key={`full-${index}`} name="star" size={size} color={color} />
      ))}
      {/* Media estrella */}
      {hasHalfStar && <FontAwesome key="half" name="star-half-empty" size={size} color={color} />}
      {/* Estrellas vacías */}
      {[...Array(emptyStars)].map((_, index) => (
        <FontAwesome key={`empty-${index}`} name="star" size={size} color="#DDD" />
      ))}
      <Text>({rating})</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default StarRating;