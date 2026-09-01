# GaleriaImagens_PAM — Visitas Técnicas Agrícolas

Aplicativo mobile (React Native + Expo) desenvolvido para a atividade **"The Code Challenge — Hardware & Recursos Nativos"**, simulando o registro de visitas técnicas agrícolas com uso de recursos nativos do dispositivo: câmera, acelerômetro e contatos.

## 📱 Sobre o projeto

O app tem 4 abas principais:

| Aba | O que faz |
|---|---|
| **Câmera** | Tira foto (câmera) ou seleciona da galeria, com tratamento avançado de permissão. |
| **Auditoria** | Finaliza o registro da visita: valida estabilidade do aparelho via acelerômetro, permite anexar foto e observação, e salva tudo localmente. |
| **Histórico** | Lista os registros de auditoria já enviados, agrupados por dia, com foto (ampliável em tela cheia) e observação. |
| **Contatos** | Lista de contatos do aparelho com busca por nome e paginação (scroll infinito). |

## ✅ Desafios implementados

Os três níveis de desafio propostos na atividade foram implementados:

### Nível Júnior — Permissões da Câmera
Em `src/components/ImagePickerComponent.js`. Ao solicitar a permissão de câmera/galeria, o app verifica o campo `canAskAgain` do retorno. Se o usuário tiver marcado "Não perguntar novamente", em vez de um alerta genérico, o app exibe instruções e um botão que abre diretamente a tela de permissões do app nas Configurações do sistema (`Linking.openSettings()`).

### Nível Pleno — Telemetria com Acelerômetro
Em `src/components/AuditClosureComponent.js`. Ao finalizar uma auditoria, o app liga o sensor `Accelerometer` (expo-sensors) por 1,5s e calcula a aceleração vetorial agregada (`√(x²+y²+z²)`) a cada leitura. Se o pico ultrapassar **2.0g**, o envio é bloqueado com o alerta "Instabilidade Física Detectada". Caso o sensor não esteja disponível no aparelho, o app degrada graciosamente (libera o envio com aviso, em vez de travar).

### Nível Sênior — Otimização e Filtragem em Massa de Contatos
Em `src/components/ContactsComponent.js`. A busca de contatos usa:
- **Paginação sob demanda** (`pageSize` + `pageOffset`) com scroll infinito via `onEndReached`;
- **Filtro por nome direto na consulta nativa** (`Contacts.getContactsAsync({ name })`), com debounce de 400ms;
- **FlatList otimizada** (`removeClippedSubviews`, `renderItem`/`keyExtractor` memorizados, `windowSize` ajustado) para evitar vazamento de memória e lags com listas grandes.

## 🧩 Requisitos adicionais

- **RF01 — Histórico local**: registros de auditoria (foto, observação, pico de aceleração, data/hora) são salvos com `AsyncStorage` e ficam disponíveis na aba Histórico mesmo sem internet. Fotos são copiadas para uma pasta permanente do app (`expo-file-system`) para não se perderem com a limpeza de cache.
- **RNF01 — Degradação graciosa**: sensores/permissões ausentes ou negados não derrubam o app; sempre há uma mensagem amigável.
- **RNF02 — UI responsiva**: layout construído com Flexbox, `useWindowDimensions` na visualização de fotos ampliadas (se adapta à rotação da tela) e `KeyboardAvoidingView`/`ScrollView` na tela de Auditoria.

> RF02 (indicador de precisão de GPS) ainda não foi implementado neste app.

## 🛠️ Tecnologias

- React Native + Expo (SDK 54)
- expo-image-picker, expo-sensors, expo-contacts, expo-file-system
- @react-native-async-storage/async-storage
- @expo/vector-icons

## ▶️ Como rodar o projeto

Pré-requisitos: [Node.js](https://nodejs.org/) instalado e o app **Expo Go** no celular (Android/iOS).

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npx expo start
```

Escaneie o QR code exibido no terminal com o app **Expo Go** (Android: dentro do app; iOS: pela câmera nativa).

> Se estiver numa rede que bloqueia a conexão direta (ex: rede de escola/empresa), use `npx expo start --tunnel`.

### Permissões necessárias
O app solicita, quando usado:
- Câmera e Galeria (aba Câmera)
- Sensores de movimento (aba Auditoria — não exige permissão explícita no Android/iOS modernos)
- Contatos (aba Contatos)

## 🎥 Vídeo de demonstração

> _Link do vídeo (máx. 3 minutos):_ **[COLOQUE AQUI O LINK DO VÍDEO]**

## 📂 Estrutura do projeto

```
GaleriaImagens_PAM/
├── App.js                              # Navegação por abas e estado compartilhado
├── src/
│   ├── theme.js                        # Cores, espaçamentos e tipografia centralizados
│   ├── storage/
│   │   └── auditHistory.js             # Persistência local dos registros (AsyncStorage)
│   └── components/
│       ├── ImagePickerComponent.js     # Nível Júnior — câmera/galeria
│       ├── AuditClosureComponent.js    # Nível Pleno — acelerômetro + foto + observação
│       ├── HistoryComponent.js         # Histórico dos registros salvos (RF01)
│       └── ContactsComponent.js        # Nível Sênior — contatos paginados
├── app.json
└── package.json
```
