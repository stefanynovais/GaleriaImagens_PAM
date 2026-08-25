// src/components/ContactsComponent.js

// Importa as bibliotecas necessárias
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { FontAwesome } from '@expo/vector-icons';

// Quantidade de contatos carregados por página (scroll infinito)
const PAGE_SIZE = 50;
// Tempo de debounce (ms) antes de disparar a busca nativa por nome,
// evitando uma consulta a cada tecla digitada.
const DEBOUNCE_BUSCA_MS = 400;

// Define o componente funcional
const ContactsComponent = () => {
  // Estado para armazenar os contatos carregados até o momento
  const [contacts, setContacts] = useState([]);
  // Texto digitado no campo de busca
  const [searchText, setSearchText] = useState('');
  // Indica carregamento inicial (primeira página)
  const [loadingInicial, setLoadingInicial] = useState(false);
  // Indica carregamento de mais páginas (scroll infinito)
  const [loadingMore, setLoadingMore] = useState(false);
  // Indica se ainda há mais contatos para carregar
  const [hasMore, setHasMore] = useState(true);
  // Indica se a permissão de contatos já foi concedida
  const [permissaoConcedida, setPermissaoConcedida] = useState(false);

  // Referência para o timer de debounce da busca
  const debounceRef = useRef(null);
  // Evita chamadas concorrentes de paginação
  const carregandoRef = useRef(false);

  // Solicita a permissão de acesso aos contatos (uma única vez)
  const solicitarPermissao = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Permissão para acessar contatos foi negada.');
      return false;
    }

    setPermissaoConcedida(true);
    return true;
  };

  // Busca uma página de contatos direto na consulta nativa,
  // já filtrando por nome quando houver texto de busca (pageOffset + pageSize
  // evitam carregar os mais de 5.000 registros de uma vez).
  const buscarPagina = async ({ offset, nomeFiltro }) => {
    const { data, hasNextPage } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      pageSize: PAGE_SIZE,
      pageOffset: offset,
      sort: Contacts.SortTypes.FirstName,
      name: nomeFiltro || undefined, // filtro nativo por nome, quando houver
    });

    return { data, hasNextPage };
  };

  // Carrega a primeira página (reset completo), usada no mount e a cada busca
  const carregarPrimeiraPagina = useCallback(async (nomeFiltro = '') => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;

    let temPermissao = permissaoConcedida;
    if (!temPermissao) {
      temPermissao = await solicitarPermissao();
    }

    if (!temPermissao) {
      carregandoRef.current = false;
      return;
    }

    setLoadingInicial(true);

    try {
      const { data, hasNextPage } = await buscarPagina({ offset: 0, nomeFiltro });
      setContacts(data);
      setHasMore(hasNextPage);
    } catch (error) {
      // Degradação graciosa: nunca deixa o app quebrar por erro no acesso aos contatos
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os contatos.');
      console.error(error);
    } finally {
      setLoadingInicial(false);
      carregandoRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissaoConcedida]);

  // Carrega a próxima página e concatena ao final da lista (scroll infinito)
  const carregarProximaPagina = useCallback(async () => {
    if (carregandoRef.current || !hasMore || loadingInicial) return;
    carregandoRef.current = true;
    setLoadingMore(true);

    try {
      const { data, hasNextPage } = await buscarPagina({
        offset: contacts.length,
        nomeFiltro: searchText,
      });
      setContacts((prev) => [...prev, ...data]);
      setHasMore(hasNextPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
      carregandoRef.current = false;
    }
  }, [contacts.length, hasMore, loadingInicial, searchText]);

  // Dispara a busca com debounce toda vez que o texto digitado muda
  const onChangeSearchText = (texto) => {
    setSearchText(texto);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      carregarPrimeiraPagina(texto);
    }, DEBOUNCE_BUSCA_MS);
  };

  // Carrega a primeira página assim que o componente monta
  useEffect(() => {
    carregarPrimeiraPagina('');

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para renderizar cada item da lista de contatos.
  // Memorizada com useCallback para não recriar a função a cada render
  // (ajuda o FlatList a reaproveitar componentes e evitar lag/vazamento).
  const renderItem = useCallback(({ item }) => (
    <View style={styles.contactItem}>
      <Text style={styles.contactName}>
        {item.firstName} {item.lastName}
      </Text>

      {item.phoneNumbers && item.phoneNumbers.map((phone, index) => (
        <View key={index} style={styles.contactDetailContainer}>
          <FontAwesome name="phone" size={16} color="#555" style={styles.icon} />
          <Text style={styles.contactDetail}>{phone.number}</Text>
        </View>
      ))}

      {item.emails && item.emails.map((email, index) => (
        <View key={index} style={styles.contactDetailContainer}>
          <FontAwesome name="envelope" size={16} color="#555" style={styles.icon} />
          <Text style={styles.contactDetail}>{email.email}</Text>
        </View>
      ))}
    </View>
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
        <Text style={styles.footerText}>Carregando mais contatos...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome..."
          value={searchText}
          onChangeText={onChangeSearchText}
          autoCorrect={false}
        />
        <Button title="Recarregar" onPress={() => carregarPrimeiraPagina(searchText)} />
      </View>

      {loadingInicial ? (
        <ActivityIndicator style={styles.loadingInicial} size="large" />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={carregarProximaPagina}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum contato encontrado.</Text>
          }
          // Configurações de performance/memória para listas grandes (>5.000 registros):
          removeClippedSubviews // desmonta itens fora da tela, liberando memória
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={10}
          updateCellsBatchingPeriod={50}
        />
      )}
    </View>
  );
};

// Define os estilos utilizados no componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  list: {
    marginTop: 20,
  },
  loadingInicial: {
    marginTop: 40,
  },
  vazio: {
    marginTop: 20,
    textAlign: 'center',
    color: '#777',
  },
  footer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 5,
    fontSize: 12,
    color: '#777',
  },
  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  contactDetail: {
    fontSize: 14,
    color: '#555',
  },
  icon: {
    marginRight: 10,
  },
});

// Exporta o componente para uso externo
export default ContactsComponent;
