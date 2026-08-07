// App.js

// Importa as bibliotecas necessárias
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import ContactsComponent from './src/components/ContactsComponent';

// Define o componente principal do aplicativo
const App = () => {
  return (
    // SafeAreaView para garantir que o conteúdo não ultrapasse áreas seguras do dispositivo
    <SafeAreaView style={styles.container}>
      {/* ScrollView para permitir rolagem caso o conteúdo exceda a tela */}
      <ScrollView>
        {/* Renderiza o componente de contatos */}
        <ContactsComponent />
      </ScrollView>
    </SafeAreaView>
  );
};

// Define os estilos utilizados no aplicativo principal
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo o espaço disponível
    backgroundColor: '#f0f0f0', // Cor de fundo cinza claro
  },
});

// Exporta o componente principal
export default App;