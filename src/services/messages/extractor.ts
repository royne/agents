interface Message {
  text: string;
  isUser: boolean;
}

export const extractMessages = (messages: Message[], systemPrompt: { role: string; content: string; }) => {
  type ValidRole = 'system' | 'user' | 'assistant';
  const validRoles = new Set<ValidRole>(['system', 'user', 'assistant']);

  const formattedMessages = [
    systemPrompt,
    ...messages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text
    }))
  ];

  const safeMessages = formattedMessages.filter(msg =>
    validRoles.has(msg.role as ValidRole)
  );

  return safeMessages;
};
