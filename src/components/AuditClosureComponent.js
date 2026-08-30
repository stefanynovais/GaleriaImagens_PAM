// src/components/AuditClosureComponent.js

// Importa as bibliotecas necessárias
import React, { useState, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as FileSystem from 'expo-file-system/legacy';
import { FontAwesome } from '@expo/vector-icons';
import { colors, spacing, radius, typography, cardShadow } from '../theme';
import { salvarRegistro } from '../storage/auditHistory';

// Duração da janela de leitura do acelerômetro (em ms) ao finalizar a auditoria
const JANELA_LEITURA_MS = 1500;
// Frequência de amostragem do sensor (em ms entre leituras)
const INTERVALO_AMOSTRAGEM_MS = 50;
// Limite de aceleração vetorial agregada, em g, que bloqueia o envio
const LIMITE_ACELERACAO_G = 2.0;
// Pasta permanente onde as fotos anexadas às auditorias são guardadas,
// para que não sumam se o sistema limpar o cache do ImagePicker.
const PASTA_FOTOS = `${FileSystem.documentDirectory}auditorias/`;

const AuditClosureComponent = ({ fotoUri, onFotoConsumida }) => {
  // Indica se a checagem de estabilidade está em andamento
  const [verificando, setVerificando] = useState(false);
  // Guarda o resultado da última tentativa (para exibir feedback na tela)
  const [ultimoResultado, setUltimoResultado] = useState(null);
  // Texto livre descrevendo como estava a situação da visita
  const [observacao, setObservacao] = useState('');
  // Referência para a subscription do sensor, para poder remover no fim
  const subscriptionRef = useRef(null);

  // Calcula a aceleração vetorial agregada (magnitude do vetor) em g
  // a partir das três componentes retornadas pelo sensor.
  const calcularMagnitude = ({ x, y, z }) => {
    return Math.sqrt(x * x + y * y + z * z);
  };

  // Copia a foto (que vive numa pasta de cache temporária do ImagePicker)
  // para uma pasta permanente do app, e devolve o novo caminho persistente.
  // Se algo falhar, não trava a auditoria — apenas segue sem foto anexada.
  const copiarFotoParaPastaPermanente = async (uriOriginal) => {
    try {
      await FileSystem.makeDirectoryAsync(PASTA_FOTOS, { intermediates: true });
      const nomeArquivo = `auditoria_${Date.now()}.jpg`;
      const destino = `${PASTA_FOTOS}${nomeArquivo}`;
      await FileSystem.copyAsync({ from: uriOriginal, to: destino });
      return destino;
    } catch (error) {
      console.error('Erro ao salvar foto da auditoria', error);
      return null;
    }
  };

  // Finaliza a auditoria: liga o acelerômetro por um curto período,
  // monitora a aceleração vetorial agregada e só libera o envio
  // se o dispositivo permanecer estável durante toda a janela.
  const finalizarAuditoria = async () => {
    setUltimoResultado(null);

    // Degradação graciosa: verifica se o sensor está disponível antes de usar.
    // Se não estiver (emulador sem suporte, hardware ausente, etc.),
    // avisa o usuário de forma amigável em vez de travar o app.
    const disponivel = await Accelerometer.isAvailableAsync().catch(() => false);

    if (!disponivel) {
      Alert.alert(
        'Sensor Indisponível',
        'O acelerômetro não está disponível neste dispositivo. ' +
          'A verificação de estabilidade foi ignorada e o envio será liberado.'
      );
      enviarAuditoria(null);
      return;
    }

    setVerificando(true);

    let magnitudeMaxima = 0;

    Accelerometer.setUpdateInterval(INTERVALO_AMOSTRAGEM_MS);

    subscriptionRef.current = Accelerometer.addListener((leitura) => {
      const magnitude = calcularMagnitude(leitura);
      if (magnitude > magnitudeMaxima) {
        magnitudeMaxima = magnitude;
      }
    });

    // Após a janela de leitura, para o sensor e avalia o resultado
    setTimeout(() => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      setVerificando(false);

      if (magnitudeMaxima > LIMITE_ACELERACAO_G) {
        setUltimoResultado({ bloqueado: true, magnitude: magnitudeMaxima });
        Alert.alert(
          'Instabilidade Física Detectada',
          `Aceleração de ${magnitudeMaxima.toFixed(2)}g detectada (limite: ${LIMITE_ACELERACAO_G}g). ` +
            'Mantenha o aparelho parado e tente finalizar a auditoria novamente.'
        );
        return;
      }

      setUltimoResultado({ bloqueado: false, magnitude: magnitudeMaxima });
      enviarAuditoria(magnitudeMaxima);
    }, JANELA_LEITURA_MS);
  };

  // Simula o envio da auditoria e a persiste localmente (RF01), incluindo
  // a foto anexada (copiada para um local permanente), para que fique
  // disponível na aba de Histórico mesmo sem internet.
  const enviarAuditoria = async (magnitudePico) => {
    let fotoSalva = null;

    if (fotoUri) {
      fotoSalva = await copiarFotoParaPastaPermanente(fotoUri);
    }

    await salvarRegistro({
      status: 'enviado',
      magnitude: magnitudePico,
      fotoUri: fotoSalva,
      observacao: observacao.trim() || null,
    });

    // Libera a foto e o texto atuais para não serem reaproveitados sem querer
    // num próximo envio.
    setObservacao('');
    if (onFotoConsumida) onFotoConsumida();

    Alert.alert('Auditoria Enviada', 'Registro de visita técnica enviado e salvo no histórico.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.iconeCirculo}>
          <FontAwesome name="shield" size={28} color={colors.primary} />
        </View>

        <Text style={styles.titulo}>Fechamento da Auditoria</Text>
        <Text style={styles.descricao}>
          Ao finalizar, mantenha o aparelho parado por{' '}
          {(JANELA_LEITURA_MS / 1000).toFixed(1)}s enquanto verificamos a estabilidade do
          dispositivo.
        </Text>

        {fotoUri ? (
          <View style={styles.fotoPreviewContainer}>
            <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
            <Text style={styles.fotoLegenda}>Foto anexada a este envio</Text>
          </View>
        ) : (
          <Text style={styles.fotoAusente}>
            Nenhuma foto anexada (tire uma na aba Câmera antes de enviar, se quiser)
          </Text>
        )}

        <View style={styles.observacaoContainer}>
          <Text style={styles.observacaoLabel}>Observação da visita</Text>
          <TextInput
            style={styles.observacaoInput}
            placeholder="Ex.: plantação apresentava sinais de praga na lateral leste..."
            placeholderTextColor={colors.textSecondary}
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.botao, verificando && styles.botaoDesabilitado]}
          onPress={finalizarAuditoria}
          disabled={verificando}
          activeOpacity={0.8}
        >
          {verificando ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <FontAwesome name="paper-plane" size={16} color={colors.textInverse} />
          )}
          <Text style={styles.botaoTexto}>
            {verificando ? 'Verificando estabilidade...' : 'Finalizar Auditoria e Enviar'}
          </Text>
        </TouchableOpacity>

        {ultimoResultado && (
          <View
            style={[
              styles.resultadoBox,
              ultimoResultado.bloqueado ? styles.resultadoBoxBloqueado : styles.resultadoBoxOk,
            ]}
          >
            <FontAwesome
              name={ultimoResultado.bloqueado ? 'exclamation-triangle' : 'check-circle'}
              size={16}
              color={ultimoResultado.bloqueado ? colors.danger : colors.success}
            />
            <Text
              style={[
                styles.resultadoTexto,
                { color: ultimoResultado.bloqueado ? colors.danger : colors.success },
              ]}
            >
              {ultimoResultado.bloqueado
                ? `Bloqueado: pico de ${ultimoResultado.magnitude.toFixed(2)}g`
                : `Enviado: pico de ${ultimoResultado.magnitude.toFixed(2)}g (dentro do limite)`}
            </Text>
          </View>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...cardShadow,
  },
  iconeCirculo: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  fotoPreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  fotoPreview: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  fotoLegenda: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  fotoAusente: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  observacaoContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  observacaoLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  observacaoInput: {
    width: '100%',
    minHeight: 90,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    ...typography.body,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    gap: spacing.sm,
  },
  botaoDesabilitado: {
    backgroundColor: colors.textSecondary,
  },
  botaoTexto: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  resultadoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    width: '100%',
  },
  resultadoBoxOk: {
    backgroundColor: colors.successLight,
  },
  resultadoBoxBloqueado: {
    backgroundColor: colors.dangerLight,
  },
  resultadoTexto: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
});

export default AuditClosureComponent;
