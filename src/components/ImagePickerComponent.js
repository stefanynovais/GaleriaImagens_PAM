// src/components/ImagePickerComponent.js

// Importa as bibliotecas necessárias
import React, { useState } from 'react';
import { View, Button, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Define o componente funcional
const ImagePickerComponent = () => {
  // Estado para armazenar a URI da imagem selecionada
  const [imageUri, setImageUri] = useState(null);

  // Função para solicitar permissão e abrir a galeria
  const selectImage = async () => {
    // Solicita permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Verifica se a permissão foi concedida
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Permissão para acessar a galeria foi negada.');
      return;
    }

    // Abre a galeria para seleção de imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Apenas imagens
      allowsEditing: true, // Permite edição básica
      quality: 1, // Qualidade da imagem (1 é a melhor)
    });

    // Verifica se o usuário cancelou a operação
    if (result.canceled) {
      Alert.alert('Operação Cancelada', 'Você cancelou a seleção de imagem.');
      return;
    }

    // Define a URI da imagem selecionada no estado
    setImageUri(result.assets[0].uri);
  };

  return (
    // Contêiner principal com estilo centralizado
    <View style={styles.container}>
      {/* Botão para selecionar imagem */}
      <Button title="Selecionar Imagem" onPress={selectImage} />

      {/* Exibe a imagem selecionada, se houver */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }} // Fonte da imagem
          style={styles.image} // Estilo da imagem
        />
      )}
    </View>
  );
};

// Define os estilos utilizados no componente
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo o espaço disponível
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    padding: 20, // Espaçamento interno
    backgroundColor: '#fff', // Cor de fundo branca
  },
  image: {
    width: 200, // Largura da imagem
    height: 200, // Altura da imagem
    marginTop: 20, // Espaçamento acima da imagem
    borderRadius: 10, // Bordas arredondadas
  },
});

// Exporta o componente para uso externo
export default ImagePickerComponent;