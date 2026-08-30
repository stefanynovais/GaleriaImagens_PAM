// App.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import ImagePickerComponent from './src/components/ImagePickerComponent';
import AuditClosureComponent from './src/components/AuditClosureComponent';
import ContactsComponent from './src/components/ContactsComponent';
import HistoryComponent from './src/components/HistoryComponent';
import { colors, spacing, typography } from './src/theme';

// Define as abas disponíveis no app (label e ícone da barra de navegação)
const TABS = [
  { key: 'camera', label: 'Câmera', icon: 'camera' },
  { key: 'auditoria', label: 'Auditoria', icon: 'shield' },
  { key: 'historico', label: 'Histórico', icon: 'folder-open' },
  { key: 'contatos', label: 'Contatos', icon: 'address-book' },
];

const App = () => {
  // Aba atualmente selecionada
  const [abaAtiva, setAbaAtiva] = useState(TABS[0].key);

  // Foto capturada/selecionada na aba Câmera, compartilhada com a aba
  // Auditoria para que o registro salvo no Histórico leve a foto junto.
  const [fotoAtual, setFotoAtual] = useState(null);

  const tabAtual = TABS.find((tab) => tab.key === abaAtiva);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Cabeçalho fixo do app */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visitas Técnicas Agrícolas</Text>
        <Text style={styles.headerSubtitle}>{tabAtual.label}</Text>
      </View>

      {/* Conteúdo da aba selecionada */}
      <View style={styles.content}>
        {abaAtiva === 'camera' && <ImagePickerComponent onFotoCapturada={setFotoAtual} />}
        {abaAtiva === 'auditoria' && (
          <AuditClosureComponent fotoUri={fotoAtual} onFotoConsumida={() => setFotoAtual(null)} />
        )}
        {abaAtiva === 'historico' && <HistoryComponent />}
        {abaAtiva === 'contatos' && <ContactsComponent />}
      </View>

      {/* Barra de navegação por abas, na parte inferior */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const ativa = tab.key === abaAtiva;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => setAbaAtiva(tab.key)}
              activeOpacity={0.7}
            >
              <FontAwesome
                name={tab.icon}
                size={22}
                color={ativa ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabLabel, ativa && styles.tabLabelAtiva]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textInverse,
  },
  headerSubtitle: {
    ...typography.subtitle,
    color: colors.primaryLight,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  tela: {
    flex: 1,
  },
  telaEscondida: {
    display: 'none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tabLabelAtiva: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default App;
