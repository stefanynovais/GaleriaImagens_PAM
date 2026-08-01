// src/components/ContactsComponent.js

// Importa as bibliotecas necessárias
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';
import { FontAwesome } from '@expo/vector-icons';

// Define o componente funcional
const ContactsComponent = () => {
  // Estado para armazenar os contatos
  const [contacts, setContacts] = useState([]);

  // Função para solicitar permissão e carregar contatos
  const loadContacts = async () => {
    // Solicita permissão para acessar contatos
    const { status } = await Contacts.requestPermissionsAsync();

    // Verifica se a permissão foi concedida
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Permissão para acessar contatos foi negada.');
      return;
    }

    try {
      // Obtém todos os contatos do dispositivo
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      });

      // Verifica se há contatos
      if (data.length > 0) {
        setContacts(data); // Atualiza o estado com os contatos obtidos
      } else {
        Alert.alert('Sem Contatos', 'Nenhum contato encontrado.');
      }
    } catch (error) {
      // Trata possíveis erros na obtenção dos contatos
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os contatos.');
      console.error(error);
    }
  };

  // Executa a função de carregar contatos quando o componente é montado
  useEffect(() => {
    loadContacts();
  }, []);

  // Função para renderizar cada item da lista de contatos
  const renderItem = ({ item }) => (
    <View style={styles.contactItem}>
      {/* Nome completo do contato */}
      <Text style={styles.contactName}>
        {item.firstName} {item.lastName}
      </Text>

      {/* Lista de números de telefone do contato, agora com ícone */}
      {item.phoneNumbers && item.phoneNumbers.map((phone, index) => (
        <View key={index} style={styles.contactDetailContainer}>
          <FontAwesome name="phone" size={16} color="#555" style={styles.icon} />
          <Text style={styles.contactDetail}>{phone.number}</Text>
        </View>
      ))}

      {/* Lista de emails do contato, agora com ícone */}
      {item.emails && item.emails.map((email, index) => (
        <View key={index} style={styles.contactDetailContainer}>
          <FontAwesome name="envelope" size={16} color="#555" style={styles.icon} />
          <Text style={styles.contactDetail}>{email.email}</Text>
        </View>
      ))}
    </View>
  );

  return (
    // Contêiner principal com estilo de preenchimento
    <View style={styles.container}>
      {/* Botão para recarregar os contatos manualmente */}
      <Button title="Recarregar Contatos" onPress={loadContacts} />

      {/* Lista de contatos exibida usando FlatList */}
      <FlatList
        data={contacts} // Dados da lista
        keyExtractor={(item) => item.id} // Chave única para cada item
        renderItem={renderItem} // Função para renderizar cada item
        contentContainerStyle={styles.list} // Estilo do conteúdo da lista
      />
    </View>
  );
};

// Define os estilos utilizados no componente
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo o espaço disponível
    padding: 20, // Espaçamento interno
    backgroundColor: '#fff', // Cor de fundo branca
  },
  list: {
    marginTop: 20, // Espaçamento acima da lista
  },
  contactItem: {
    padding: 15, // Espaçamento interno
    borderBottomWidth: 1, // Linha de separação inferior
    borderColor: '#eee', // Cor da linha de separação
  },
  contactName: {
    fontSize: 18, // Tamanho da fonte
    fontWeight: 'bold', // Peso da fonte
  },
  contactDetailContainer: {
    flexDirection: 'row', // Alinha ícone e texto na horizontal
    alignItems: 'center', // Alinha verticalmente ao centro
    marginTop: 5, // Espaçamento acima
  },
  contactDetail: {
    fontSize: 14, // Tamanho da fonte
    color: '#555', // Cor do texto
  },
  icon: {
    marginRight: 10, // Espaçamento entre o ícone e o texto
  },
});

// Exporta o componente para uso externo
export default ContactsComponent;
