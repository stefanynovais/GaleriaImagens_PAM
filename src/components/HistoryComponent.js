// src/components/HistoryComponent.js
// Sessão de Histórico (RF01): lista os registros de auditoria já enviados,
// lidos do armazenamento local, agrupados por dia. Funciona mesmo sem internet,
// pois os dados vêm do AsyncStorage e não de uma API remota.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, spacing, radius, typography, cardShadow } from '../theme';
import { listarRegistros, limparHistorico } from '../storage/auditHistory';

// Formata a data de um registro no padrão "dd/mm/aaaa"
const formatarData = (timestamp) => {
  const data = new Date(timestamp);
  return data.toLocaleDateString('pt-BR');
};

// Formata a hora de um registro no padrão "hh:mm"
const formatarHora = (timestamp) => {
  const data = new Date(timestamp);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Agrupa a lista de registros (já ordenada do mais novo pro mais antigo)
// em seções por dia, no formato que o FlatList consegue renderizar
// com cabeçalhos de data ("Registro do dia 29/08/2026", etc).
const agruparPorDia = (registros) => {
  const grupos = [];
  let grupoAtual = null;

  registros.forEach((registro) => {
    const dataLabel = formatarData(registro.timestamp);

    if (!grupoAtual || grupoAtual.data !== dataLabel) {
      grupoAtual = { data: dataLabel, itens: [] };
      grupos.push(grupoAtual);
    }

    grupoAtual.itens.push(registro);
  });

  return grupos;
};

const HistoryComponent = () => {
  // Dimensões atuais da janela (atualiza sozinho ao girar o aparelho)
  const { width, height } = useWindowDimensions();
  // Lista de registros já agrupados por dia
  const [grupos, setGrupos] = useState([]);
  // Controle do "puxar para atualizar"
  const [atualizando, setAtualizando] = useState(false);
  // URI da foto atualmente ampliada em tela cheia (null = modal fechado)
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const carregar = useCallback(async () => {
    const registros = await listarRegistros();
    setGrupos(agruparPorDia(registros));
  }, []);

  // Carrega ao montar. Como essa tela é uma aba (não uma rota de navegação
  // com histórico próprio), o usuário também pode usar "puxar para atualizar"
  // depois de enviar uma nova auditoria em outra aba.
  React.useEffect(() => {
    carregar();
  }, [carregar]);

  const aoAtualizar = async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  };

  const confirmarLimpeza = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja apagar todos os registros salvos localmente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await limparHistorico();
            carregar();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.tituloSecao}>Registros Salvos</Text>
        {grupos.length > 0 && (
          <TouchableOpacity onPress={confirmarLimpeza} hitSlop={10}>
            <FontAwesome name="trash-o" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={grupos}
        keyExtractor={(grupo) => grupo.data}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazioContainer}>
            <FontAwesome name="inbox" size={32} color={colors.border} />
            <Text style={styles.vazioTexto}>
              Nenhum registro salvo ainda. Finalize uma auditoria para vê-la aqui.
            </Text>
          </View>
        }
        renderItem={({ item: grupo }) => (
          <View style={styles.grupo}>
            <Text style={styles.grupoTitulo}>Registro do dia {grupo.data}</Text>

            {grupo.itens.map((registro) => (
              <View key={registro.id} style={styles.registroCard}>
                {registro.fotoUri ? (
                  <TouchableOpacity
                    onPress={() => setFotoAmpliada(registro.fotoUri)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: registro.fotoUri }} style={styles.registroFoto} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.registroIcone}>
                    <FontAwesome name="check" size={14} color={colors.success} />
                  </View>
                )}

                <View style={styles.registroInfo}>
                  <Text style={styles.registroTitulo}>Auditoria enviada</Text>
                  <Text style={styles.registroDetalhe}>
                    {formatarHora(registro.timestamp)}
                    {registro.magnitude != null
                      ? ` · pico de ${registro.magnitude.toFixed(2)}g`
                      : ''}
                  </Text>
                  {registro.observacao ? (
                    <Text style={styles.registroObservacao} numberOfLines={3}>
                      {registro.observacao}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      />

      {/* Modal de visualização em tela cheia: toca na foto pra fechar */}
      <Modal
        visible={!!fotoAmpliada}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoAmpliada(null)}
      >
        <TouchableOpacity
          style={styles.modalFundo}
          activeOpacity={1}
          onPress={() => setFotoAmpliada(null)}
        >
          <TouchableOpacity style={styles.modalFechar} onPress={() => setFotoAmpliada(null)} hitSlop={12}>
            <FontAwesome name="close" size={22} color={colors.textInverse} />
          </TouchableOpacity>

          {fotoAmpliada && (
            <Image
              source={{ uri: fotoAmpliada }}
              style={[styles.modalImagem, { width, height: height * 0.8 }]}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tituloSecao: {
    ...typography.title,
    fontSize: 17,
  },
  lista: {
    paddingBottom: spacing.lg,
  },
  grupo: {
    marginBottom: spacing.lg,
  },
  grupoTitulo: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  registroCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...cardShadow,
  },
  registroIcone: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registroFoto: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  registroInfo: {
    flex: 1,
  },
  registroTitulo: {
    ...typography.body,
    fontWeight: '600',
  },
  registroDetalhe: {
    ...typography.caption,
    marginTop: 2,
  },
  registroObservacao: {
    ...typography.body,
    fontSize: 13,
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },
  vazioContainer: {
    marginTop: 60,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  vazioTexto: {
    ...typography.subtitle,
    textAlign: 'center',
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImagem: {},
  modalFechar: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 1,
    padding: spacing.sm,
  },
});

export default HistoryComponent;
