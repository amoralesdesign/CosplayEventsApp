import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ImageCarousel from '@/components/ImageCarousel/ImageCarousel';
import StarRating from '@/components/StarRating/StarRating';
import EventMap from '@/components/EventMap/EventMap';
import * as Calendar from 'expo-calendar';

import { LinearGradient } from 'expo-linear-gradient';

const EventDetailScreen = () => {
  const { id, mainimage, gallery, name, start_date, end_date, description, rating, address, city, country, latitude, longitude } = useLocalSearchParams();
  const navigation = useNavigation();

  const galleryArray = gallery ? JSON.parse(gallery) : [];

  const eventLatitude = parseFloat(latitude);
  const eventLongitude = parseFloat(longitude);

  const isEventFinished = false;
  // const isEventFinished = new Date() > new Date(end_date);
  console.log("isEventFinished",isEventFinished)

  const handleAddToCalendar = async () => {
    try {
      // Solicitar permisos para acceder al calendario
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso al calendario.');
        return;
      }

      // Obtener el calendario predeterminado
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();

      // Crear el evento en el calendario
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: name,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        location: `${city}, ${country}`,
        notes: description,
      });

      Alert.alert('Evento agregado', 'El evento se ha añadido a tu calendario.');
    } catch (error) {
      console.error('Error al agregar el evento:', error);
      Alert.alert('Error', 'No se pudo agregar el evento al calendario.');
    }
  };

  const handleViewAccommodation = () => {
    const searchParams = new URLSearchParams({
      ss: `${address}, ${city}`,
      aid: 'TU_ID_DE_AFILIADO',
    });
    const checkinDate = new Date(start_date).toISOString().split('T')[0];
    const checkoutDate = new Date(end_date).toISOString().split('T')[0];
    searchParams.set('checkin', checkinDate);
    searchParams.set('checkout', checkoutDate);
    const searchUrl = `https://www.booking.com/searchresults.es.html?${searchParams.toString()}`;
    Linking.openURL(searchUrl);
  };

  console.log('eventLatitude:', eventLatitude); // Verifica la latitud
       console.log('eventLongitude:', eventLongitude);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Botón de retroceso */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        {/* Imagen de cabecera con sobreado */}
        <View style={styles.headerContainer}>
          {galleryArray.length > 0 ? (
            <ImageCarousel images={[...galleryArray]} />
          ) : (
            <Image
              alt={name}
              resizeMode="cover"
              style={styles.headerImage}
              source={{ uri: mainimage }}
            />
          )}
          {/* Sobreado superior */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.6)', 'transparent']}
            style={styles.gradientTop}
          />
          {/* Sobreado inferior */}
         
        </View>

        <View style={styles.avatarContainer}>
          <Image
            alt={name}
            source={{ uri: mainimage }}
            style={styles.avatar}
            resizeMode="contain"
          />
          {isEventFinished && (
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>Finalizado</Text>
            </View>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <Text style={styles.title}>{name}</Text>
          <View style={styles.rating}>
            <StarRating rating={parseFloat(rating)} size={20} />
          </View>
          <View style={styles.iconContainer}>
            <Feather name="calendar" size={16} color="#34acde"/>
            <Text style={styles.dates}>Del {start_date} al {end_date}</Text>
          </View>

          <View style={styles.iconContainer}>
            <Feather name="map-pin" size={16} color="#34acde" />
            <Text style={styles.location}>{address}, {city} ({country})</Text>
          </View>
          
          <Text style={styles.description}>{description}</Text>

          <EventMap
            latitude={eventLatitude}
            longitude={eventLongitude}
            title={name}
            description={address}
          />
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <LinearGradient
          colors={['#ea266d', '#ea266d', '#f857a6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomBarButton} 

        >
          <TouchableOpacity onPress={handleAddToCalendar}>
            <Text style={styles.bottomBarButtonText}><Feather name="calendar" size={20} color="#fff" /> Guardar fecha</Text>
          </TouchableOpacity>
        </LinearGradient>

          <TouchableOpacity  style={[styles.bottomBarButton, styles.bookingButton]}  onPress={handleViewAccommodation}>
            <Text style={styles.bookingButtonText}><Feather name="home" size={20} color="#2573b9" /> Ver alojamiento</Text>
          </TouchableOpacity>
       
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    width: Dimensions.get('window').width,
    height: 300,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50,
    position: 'relative'
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: "black",
    padding: 20,
  },
  ribbon: {
    position: 'absolute',
    left: 12,
    top: 100,
    backgroundColor: '#fff3cd',
    padding: 4,
    borderRadius: 100,
  },
  ribbonText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
    paddingBottom: 40,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: "#333",
  },
  rating: {
    marginBottom: 16,
  },
  dates: {
    fontSize: 16,
    color: '#777',
  },
  location: {
    fontSize: 16,
    color: '#777',
    marginBottom: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'start',
    marginBottom: 16,
    gap: 8,
    
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: "#333"
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
    paddingBottom: 40,
    gap: 20
  },
  bottomBarButton: {
    flex: 1,
    padding: 12,
    borderRadius: 100,
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
  },
  
  bottomBarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  bookingButtonText: {
    color: '#2573b9',
    fontWeight: 'bold',
    fontSize: 16
  },
  bookingButton: {
    borderColor: '#2573b9',
    borderWidth: 1,
    fontWeight: 'bold',
    fontSize: 16
  },
});

export default EventDetailScreen;