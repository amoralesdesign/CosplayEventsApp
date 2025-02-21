import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  Alert,
  Linking
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { Calendar as CalendarUI, LocaleConfig } from 'react-native-calendars';
import * as Calendar from 'expo-calendar';
import { supabase } from '@/lib/supabase';

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ],
  dayNames: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};
LocaleConfig.defaultLocale = 'es';

export default function Example() {
  const [saved, setSaved] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]); // Tipos seleccionados
  const [selectedDates, setSelectedDates] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null }); // Estado para el rango de fechas


  // Función para obtener los eventos desde Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data;
    };

    fetchEvents().then(data => {
      console.log('Events received:', data);
      setEvents(data);
    });
  }, []);

 

  // Función para manejar la selección/deselección de tags
  const handleTagPress = (type) => {
    if (selectedTypes.includes(type)) {
      // Deseleccionar el tipo
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      // Seleccionar el tipo
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Función para manejar la selección de fechas
  const handleDateSelect = (date) => {
    const selectedDate = new Date(date.dateString);
  
    console.log('Selected Date:', selectedDate);
  
    // Si ya hay un rango completo seleccionado, lo limpiamos antes de seleccionar uno nuevo
    if (dateRange.startDate && dateRange.endDate) {
      console.log('Clearing previous date range');
      setDateRange({ startDate: null, endDate: null });
    }
  
    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      console.log('Setting start date:', selectedDate);
      setDateRange({ startDate: selectedDate, endDate: null });
    } else if (selectedDate >= dateRange.startDate) {
      console.log('Setting end date:', selectedDate);
      setDateRange({ ...dateRange, endDate: selectedDate });
    } else {
      console.log('Swapping start and end dates');
      setDateRange({ startDate: selectedDate, endDate: dateRange.startDate });
    }
  };

  // ... existing code ...

  // ... existing code ...

const getMarkedDates = () => {
  const { startDate, endDate } = dateRange;
  const markedDates = {};

  if (startDate && endDate) {
    // Convertir las fechas a cadenas si son objetos Date
    const startStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;

    // Forzar la hora UTC para evitar problemas con la zona horaria
    const start = new Date(startStr + 'T00:00:00Z');
    const end = new Date(endStr + 'T23:59:59Z');
    let current = new Date(start); // Crear una nueva instancia para evitar modificar start

    console.log('Processing dates from:', start, 'to', end);

    // Ajustar la condición para incluir la fecha final
    while (current <= end) {
      const date = current.toISOString().split('T')[0];
      
      if (current.getTime() === start.getTime()) {
        markedDates[date] = { 
          startingDay: true,
          color: '#ea266d', // Color intenso para inicio
          textColor: 'white'
        };
        console.log('Marked start date:', date);
      } else if (date === endStr) { // Comparar solo la fecha (sin la hora)
        markedDates[date] = { 
          endingDay: true,
          color: '#ea266d', // Color intenso para fin
          textColor: 'white'
        };
        console.log('Marked end date:', date);
      } else {
        markedDates[date] = { 
          color: '#f8a5c2', // Color más suave para días intermedios
          textColor: 'white'
        };
        console.log('Marked intermediate date:', date);
      }
      
      current.setDate(current.getDate() + 1); // Avanzar al siguiente día
    }
  } else if (startDate) {
    const date = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    markedDates[date] = { 
      selected: true,
      color: '#ea266d',
      textColor: 'white',
      startingDay: true,
      endingDay: true
    };
    console.log('Marked single date:', date);
  }

  console.log('Final markedDates:', markedDates);
  return markedDates;
};

// ... existing code ...

// ... existing code ...

  const saveDateRange = () => {
    const { startDate, endDate } = dateRange;

    if (startDate && endDate) {
      const newSelectedDates = getMarkedDates();
      console.log('New selected dates:', newSelectedDates); // Debugging
      setSelectedDates(newSelectedDates);
      setShowCalendar(false);

      
    } else {
      Alert.alert('Error', 'Selecciona un rango de fechas válido.');
    }
  };

  const filteredEvents = events.filter(event => {
    const eventStartDate = new Date(event.start_date);
    const eventEndDate = new Date(event.end_date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (selectedTypes.length > 0 && !selectedTypes.includes(event.event_type)) {
      return false; // Filtrar por tipo de evento
    }

    if (dateRange.startDate && dateRange.endDate) {
      // Verifica si el rango de fechas del evento se solapa con el rango seleccionado
      return (
        (eventStartDate >= startDate && eventStartDate <= endDate) ||
          (eventEndDate >= startDate && eventEndDate <= endDate) ||
          (eventStartDate <= startDate && eventEndDate >= endDate)
      );
    }

    return true; // Mostrar todos los eventos si no hay rango seleccionado
  });

  const eventTypes = React.useMemo(() => {
    const uniqueTypes = [...new Set(filteredEvents.map(event => event.event_type))];
    return uniqueTypes;
  }, [filteredEvents]);

  const addToCalendar = async (event) => {
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
        title: event.name,
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        location: `${event.city}, ${event.country}`,
        notes: event.description,
      });
  
      Alert.alert('Evento agregado', 'El evento se ha añadido a tu calendario.');
    } catch (error) {
      console.error('Error al agregar el evento:', error);
      Alert.alert('Error', 'No se pudo agregar el evento al calendario.');
    }
  };

  // Añadir una función para formatear las fechas
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const end = new Date(endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    return `Del ${start} al ${end}`;
  };

  const saveEvent = async (event) => {
    const { startDate, endDate } = event;

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          name: event.name,
          start_date: startDate,
          end_date: endDate,
          // ... otros campos del evento
        },
      ]);

    if (error) {
      console.error('Error saving event:', error);
    } else {
      console.log('Event saved successfully:', data);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerAction} />

          <View style={styles.headerAction}>
            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}>
              <FeatherIcon
                color="#000"
                name="sliders"
                size={21} />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.headerTitle}>Eventos</Text>
          <TouchableOpacity
            onPress={() => setShowCalendar(!showCalendar)} style={styles.datePickerButton}>
              <FontAwesome name="calendar" size={16} color="white" />
              <Text style={styles.whiteBoldText}>
                {dateRange.startDate && dateRange.endDate
                  ? formatDateRange(dateRange.startDate, dateRange.endDate) + ' (Editar)'
                  : 'Seleccionar fechas'}
              </Text>
          </TouchableOpacity>
        </View>

         {/* Calendario */}
         {showCalendar && (
          <View>
            <CalendarUI
              markingType={'period'}
              onDayPress={handleDateSelect}
              markedDates={{
                ...getMarkedDates(),
                ...selectedDates
              }}
              theme={{
                calendarBackground: '#fff',
                selectedDayBackgroundColor: '#ea266d',
                todayTextColor: '#ea266d',
                arrowColor: '#ea266d',
              }}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveDateRange}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Listado de Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {eventTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tag,
                selectedTypes.includes(type) && styles.tagSelected,
              ]}
              onPress={() => handleTagPress(type)}>
              <Text style={styles.tagText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredEvents.map(
          ({ id, mainimage, name, start_date, end_date, description, rating, address, city, country }, index) => {
            const isSaved = saved.includes(id);

            return (
              <TouchableOpacity
                key={id}
                onPress={() => {
                  // handle onPress
                }}>
                <View style={styles.card}>
                  <View style={styles.cardLikeWrapper}>
                    <TouchableOpacity onPress={() => handleSave(id)}>
                      <View style={styles.cardLike}>
                        <FontAwesome
                          color={isSaved ? '#ea266d' : '#222'}
                          name="heart"
                          solid={isSaved}
                          size={20} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardTop}>
                    <Image
                      alt=""
                      resizeMode="contain"
                      style={styles.cardImg}
                      source={{ uri: mainimage }} />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{name}</Text>

                      <FontAwesome
                        color="#ea266d"
                        name="star"
                        solid={true}
                        size={12}
                        style={{ marginBottom: 2 }} />

                      <Text style={styles.cardStars}>{rating}</Text>
                    </View>

                    <Text style={styles.cardDates}>Del {start_date} al {end_date}</Text>

                    <Text>{address}, {city} ({country})</Text>

                    <Text style={styles.cardPrice}>
                      {description}
                    </Text>
                    
                    <TouchableOpacity
                      style={styles.saveEventButton}
                      onPress={() => addToCalendar({ name, start_date, end_date, city, country, description })}
                    >
                      <Text style={styles.whiteBoldText}>Guardar evento</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bookingButton}
                      onPress={() => {
                        // Construir la URL de búsqueda de Booking.com
                        const searchParams = new URLSearchParams({
                          ss: `${address}, ${city}`,
                          aid: 'TU_ID_DE_AFILIADO', // Reemplaza con tu ID de afiliado
                        });

                        // Usar las fechas del evento si no hay un rango de fechas seleccionado
                        const checkinDate = dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : start_date.split('T')[0];
                        const checkoutDate = dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : end_date.split('T')[0];

                        // Añadir fechas a la URL
                        searchParams.set('checkin', checkinDate);
                        searchParams.set('checkout', checkoutDate);

                        const searchUrl = `https://www.booking.com/searchresults.es.html?${searchParams.toString()}`;
                        console.log('Web URL:', searchUrl); // Depuración: URL para la web

                        // Abrir la URL en el navegador (evitar la app)
                        Linking.openURL(searchUrl);
                      }}
                    >
                      <Text style={styles.whiteBoldText}>Ver alojamiento cerca</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          },
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  saveEventButton: {
    backgroundColor: "#4dc586",
    alignSelf: 'flex-start',
    padding: 10,
    marginBlockStart: 10,
    borderRadius: 4,
    color: 'white',
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: '#ea266d',
    color: 'white',
    borderRadius: 4,
    marginBlockStart: 10,
    marginBlockEnd: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    alignSelf: 'flex-start',
  },
  bookingButton: {
    backgroundColor: "#0071c2",
    alignSelf: 'flex-start',
    padding: 10,
    marginBlockStart: 10,
    borderRadius: 4,
    color: 'white',
  },
  whiteBoldText: {
    color: 'white',
    fontWeight: 600,
  },
  /** Header */
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTop: {
    marginHorizontal: -6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  /** Tags */
  tagsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  tagSelected: {
    backgroundColor: '#ea266d',
  },
  tagText: {
    fontSize: 14,
    color: '#1d1d1d',
  },
  /** Card */
  card: {
    position: 'relative',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardLikeWrapper: {
    position: 'absolute',
    zIndex: 1,
    top: 12,
    right: 12,
  },
  cardLike: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardImg: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardBody: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#232425',
    marginRight: 'auto',
  },
  cardStars: {
    marginLeft: 2,
    marginRight: 4,
    fontSize: 15,
    fontWeight: '500',
    color: '#232425',
  },
  cardDates: {
    marginTop: 4,
    fontSize: 16,
    color: '#595a63',
  },
  cardPrice: {
    marginTop: 6,
    fontSize: 16,
    color: '#232425',
  },
});