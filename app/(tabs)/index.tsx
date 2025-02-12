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
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*');

        if (error) {
          console.error('Error fetching events:', error);
        } else {
          console.log('Events received:', data);
          setEvents(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchEvents();
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
  const handleDateSelect = (day) => {
    const { startDate, endDate } = dateRange;

    if (!startDate || (startDate && endDate)) {
      // Si no hay fecha de inicio o ya hay un rango completo, reiniciar
      setDateRange({ startDate: day.dateString, endDate: null });
      setSelectedDates({}); // Limpiar el rango anterior
    } else {
      // Si hay fecha de inicio pero no de fin, completar el rango
      setDateRange({ startDate, endDate: day.dateString });
    }
  };

  const getMarkedDates = () => {
    const { startDate, endDate } = dateRange;
    const markedDates = {};

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00Z'); // Forzar hora UTC
      const end = new Date(endDate + 'T23:59:59Z'); // Incluir todo el día
      let current = new Date(start); // Crear una nueva instancia para evitar modificar start

      console.log('Processing date range:', start, 'to', end);

      // Ajustar la condición para incluir la fecha final
      while (current <= end) {
        const date = current.toISOString().split('T')[0];
        console.log('Processing date:', date);
        
        if (current.getTime() === start.getTime()) {
          console.log('Marking start date:', date);
          markedDates[date] = { 
            startingDay: true,
            color: '#ea266d', // Color intenso para inicio
            textColor: 'white'
          };
        } else if (current.toISOString().split('T')[0] === end.toISOString().split('T')[0]) {
          console.log('Marking end date:', date);
          markedDates[date] = { 
            endingDay: true,
            color: '#ea266d', // Color intenso para fin
            textColor: 'white'
          };
        } else {
          console.log('Marking intermediate date:', date);
          markedDates[date] = { 
            color: '#f8a5c2', // Color más suave para días intermedios
            textColor: 'white'
          };
        }
        
        current.setDate(current.getDate() + 1);
      }
    } else if (startDate) {
      console.log('Single date selected:', startDate);
      markedDates[startDate] = { 
        selected: true,
        color: '#ea266d',
        textColor: 'white',
        startingDay: true,
        endingDay: true
      };
    }

    console.log('Final markedDates:', markedDates);
    return markedDates;
  };

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
    const eventDate = new Date(event.date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (selectedTypes.length > 0 && !selectedTypes.includes(event.event_type)) {
      return false; // Filtrar por tipo de evento
    }

    if (dateRange.startDate && dateRange.endDate) {
      return eventDate >= startDate && eventDate <= endDate; // Filtrar por rango de fechas
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
        startDate: new Date(event.date),
        endDate: new Date(event.date),
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
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
              <FontAwesome name="calendar" size={16} color="white"  />
              <Text style={styles.whiteBoldText}>
                {dateRange.startDate && dateRange.endDate
                  ? `Del ${formatDate(dateRange.startDate)} al ${formatDate(dateRange.endDate)} (Editar)`
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
          ({ id, mainimage, name, date, description, rating, address, city, country }, index) => {
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
                      resizeMode="cover"
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

                    <Text style={styles.cardDates}>{date}</Text>

                    <Text>{address}, {city} ({country})</Text>

                    <Text style={styles.cardPrice}>
                      {description}
                    </Text>
                    
                    <TouchableOpacity
                      style={styles.saveEventButton}
                      onPress={() => addToCalendar({ name, date, city, country, description })}
                    >
                      <Text style={styles.whiteBoldText}>Guardar evento</Text>
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