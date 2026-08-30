// src/storage/auditHistory.js
// Camada simples de persistência local (RF01): salva e lê os registros
// de auditoria já enviados, usando AsyncStorage, para que fiquem
// disponíveis mesmo sem conexão com a internet e entre sessões do app.

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_HISTORICO = '@auditoria_historico';

// Retorna todos os registros salvos, do mais recente para o mais antigo.
export const listarRegistros = async () => {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_HISTORICO);
    const registros = bruto ? JSON.parse(bruto) : [];
    return registros.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Erro ao ler histórico de auditorias', error);
    return [];
  }
};

// Adiciona um novo registro ao histórico e retorna a lista atualizada.
export const salvarRegistro = async (registro) => {
  try {
    const atuais = await listarRegistros();
    const novoRegistro = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      ...registro,
    };
    const atualizados = [novoRegistro, ...atuais];
    await AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify(atualizados));
    return atualizados;
  } catch (error) {
    console.error('Erro ao salvar registro de auditoria', error);
    return null;
  }
};

// Remove todos os registros do histórico (útil para testes/reset).
export const limparHistorico = async () => {
  try {
    await AsyncStorage.removeItem(CHAVE_HISTORICO);
  } catch (error) {
    console.error('Erro ao limpar histórico de auditorias', error);
  }
};
