// src/components/ImagePickerComponent.js

// Importa as bibliotecas necessárias
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { colors, spacing, radius, typography, cardShadow } from '../theme';

// Define o componente funcional
// Recebe onFotoCapturada: callback chamado com a URI toda vez que uma foto
// é tirada/selecionada, para que a aba de Auditoria possa anexá-la ao registro.
const ImagePickerComponent = ({ onFotoCapturada }) => {
  // Estado para armazenar a URI da imagem selecionada
  const [imageUri, setImageUri] = useState(null);

  const definirImagem = (uri) => {
    setImageUri(uri);
    if (onFotoCapturada) onFotoCapturada(uri);
  };

  // Abre as configurações do sistema operacional na tela do app,
  // para que o usuário possa liberar a permissão manualmente.
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Trata o retorno de uma solicitação de permissão de forma avançada.
  // Retorna true se a permissão está concedida (ou acabou de ser concedida).
  const handlePermissionResult = (permissionResponse, recursoLabel) => {
    const { status, canAskAgain } = permissionResponse;

    if (status === 'granted') {
      return true;
    }

    // Caso o usuário tenha marcado "Não perguntar novamente" (ou já tenha
    // negado permanentemente no iOS), não adianta pedir de novo:
    // é preciso orientar a ida manual até as Configurações.
    if (!canAskAgain) {
      Alert.alert(
        'Permissão bloqueada',
        `O acesso à ${recursoLabel} foi negado permanentemente. ` +
          'Para usar esse recurso, abra as Configurações do sistema e ' +
          'ative a permissão manualmente em Apps > DeviceResourcesApp > Permissões.',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Abrir Configurações', onPress: openAppSettings },
        ]
      );
      return false;
    }

    // Ainda é possível perguntar de novo (usuário só negou uma vez)
    Alert.alert('Permissão Negada', `Permissão para acessar a ${recursoLabel} foi negada.`);
    return false;
  };

  // Função para solicitar permissão da câmera e capturar uma foto
  const takePhoto = async () => {
    const permissionResponse = await ImagePicker.requestCameraPermissionsAsync();

    const granted = handlePermissionResult(permissionResponse, 'câmera');
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      Alert.alert('Operação Cancelada', 'Você cancelou a captura da foto.');
      return;
    }

    definirImagem(result.assets[0].uri);
  };

  // Função para solicitar permissão e abrir a galeria
  const selectImage = async () => {
    const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();

    const granted = handlePermissionResult(permissionResponse, 'galeria');
    if (!granted) return;

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
    definirImagem(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Registro Fotográfico</Text>
        <Text style={styles.descricao}>
          Capture uma foto da visita ou selecione uma imagem já existente na galeria.
        </Text>

        <View style={styles.botoesRow}>
          <TouchableOpacity style={styles.botaoPrimario} onPress={takePhoto} activeOpacity={0.8}>
            <FontAwesome name="camera" size={18} color={colors.textInverse} />
            <Text style={styles.botaoPrimarioTexto}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSecundario} onPress={selectImage} activeOpacity={0.8}>
            <FontAwesome name="image" size={18} color={colors.primary} />
            <Text style={styles.botaoSecundarioTexto}>Galeria</Text>
          </TouchableOpacity>
        </View>

        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.selo}>
              <FontAwesome name="link" size={12} color={colors.primaryDark} />
              <Text style={styles.seloTexto}>Será anexada ao próximo envio de auditoria</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <FontAwesome name="picture-o" size={32} color={colors.border} />
            <Text style={styles.placeholderTexto}>Nenhuma imagem selecionada</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Define os estilos utilizados no componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...cardShadow,
  },
  titulo: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  descricao: {
    ...typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  botoesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  botaoPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    gap: spacing.sm,
  },
  botaoPrimarioTexto: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  botaoSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    gap: spacing.sm,
  },
  botaoSecundarioTexto: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: radius.md,
  },
  placeholder: {
    width: 220,
    height: 220,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderTexto: {
    ...typography.caption,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  seloTexto: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});

// Exporta o componente para uso externo
export default ImagePickerComponent;
