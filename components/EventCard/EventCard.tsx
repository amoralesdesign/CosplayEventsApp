import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import { styles } from './styles';

interface EventCardProps {
  id: string;
  mainimage: string;
  gallery?: string[];
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  rating: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isSaved: boolean;
  onSave: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  mainimage,
  gallery,
  name,
  start_date,
  end_date,
  description,
  rating,
  address,
  city,
  country,
  latitude,
  longitude,
  isSaved,
  onSave,
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push({
      pathname: `/(event)/${id}`,
      params: {
        id,
        mainimage,
        gallery: gallery ? JSON.stringify(gallery) : null,
        name,
        start_date,
        end_date,
        latitude,
        longitude,
        description,
        rating,
        address,
        city,
        country,
      },
    })}>
      <View style={styles.card}>
        <View style={styles.cardLikeWrapper}>
          <TouchableOpacity onPress={() => onSave(id)}>
            <View style={styles.cardLike}>
              <FontAwesome
                color={isSaved ? '#ea266d' : '#222'}
                name="heart"
                solid={isSaved}
                size={20}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardTop}>
          <Image
            alt={name}
            resizeMode="contain"
            style={styles.cardImg}
            source={{ uri: mainimage }}
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{name}</Text>

            <FontAwesome
              color="#ea266d"
              name="star"
              solid={true}
              size={12}
              style={{ marginBottom: 2 }}
            />

            <Text style={styles.cardStars}>{rating}</Text>
          </View>

          <Text style={styles.cardDates}>Del {start_date} al {end_date}</Text>

          <Text>{address}, {city} ({country})</Text>

          <Text style={styles.cardPrice}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;