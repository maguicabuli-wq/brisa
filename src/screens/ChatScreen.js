import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

// AI Chat screen — in production, this connects to an AI API
// with a system prompt loaded with trichotillomania knowledge
export default function ChatScreen() {
  const { t } = useApp();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: t('chatWelcome'),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulated AI response — in production this calls the AI API
    // with system context about trichotillomania
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: getSimulatedResponse(userMessage.text),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && <Text style={styles.aiAvatar}>🌿</Text>}
        <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser && styles.userText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🌿</Text>
        <Text style={styles.title}>{t('chatTitle')}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Brisa está escribiendo...</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('chatPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Simulated responses — replace with real AI API in production
function getSimulatedResponse(userText) {
  const lower = userText.toLowerCase();

  if (lower.includes('qué es') || lower.includes('what is') || lower.includes('tricho')) {
    return 'La tricotilomanía es un trastorno de comportamiento repetitivo centrado en el cuerpo (BFRB). Se caracteriza por la urgencia recurrente de jalarse el cabello, lo que puede resultar en pérdida de cabello. Es más común de lo que piensas — afecta a aproximadamente el 1-2% de la población. No estás sola. 💛';
  }

  if (lower.includes('ayuda') || lower.includes('help') || lower.includes('no puedo')) {
    return 'Entiendo que puede ser muy difícil. Recuerda: cada momento es una oportunidad nueva. Intenta identificar qué estás sintiendo ahora mismo. ¿Puedes describir qué sensación física tienes? A veces, nombrar lo que sentimos nos ayuda a procesarlo. Estoy aquí contigo. 🌿';
  }

  if (lower.includes('tip') || lower.includes('consejo')) {
    return 'Aquí van algunos tips:\n\n🧤 Ten un "kit de blockers" a la mano: guantes, gorro, juguete sensorial\n\n🧘 Practica la técnica de "surfear la ola" — observa la urgencia sin actuar, notando cómo sube y baja\n\n📝 Registra tus episodios para identificar patrones\n\n💛 Sé gentil contigo misma — el progreso no es lineal';
  }

  if (lower.includes('respirar') || lower.includes('breath') || lower.includes('ansiedad') || lower.includes('anxiety')) {
    return 'La respiración es una herramienta poderosa. Intenta esto:\n\n1. Inhala 4 segundos\n2. Sostén 4 segundos\n3. Exhala 6 segundos\n\nRepite 3-4 veces. Esto activa tu sistema nervioso parasimpático y te ayuda a sentir calma. ¿Quieres que hagamos un ejercicio de respiración juntas? Puedes usar el botón de registro en la pantalla principal. 🌬️';
  }

  return 'Gracias por compartir eso conmigo. ¿Puedes contarme más sobre cómo te sientes? Estoy aquí para escucharte y ayudarte a explorar tus emociones. Recuerda que cada paso que das, por pequeño que sea, cuenta. 🌿';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    fontSize: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  messageContent: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userContent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  aiContent: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textOnPrimary,
  },
  typingContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  typingText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
});
