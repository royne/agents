import { Message } from '../../components/ChatInterface/types';

export type ExportFormat = 'json' | 'txt' | 'md';

const formatContent = (messages: Message[], format: ExportFormat): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(messages, null, 2);
    
    case 'txt':
      return messages.map(msg => {
        const role = msg.isUser ? 'Usuario' : 'Asistente';
        const time = msg.timestamp.toLocaleString();
        return `[${time}] ${role}:\n${msg.text}\n`;
      }).join('\n');
    
    case 'md':
      return messages.map(msg => {
        const role = msg.isUser ? '👤 Usuario' : '🤖 Asistente';
        const time = msg.timestamp.toLocaleString();
        return `### ${role} - ${time}\n\n${msg.text}\n`;
      }).join('\n\n');
    
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
};

export const chatExportService = {
  exportChat(messages: Message[], format: ExportFormat, agentId: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chat-${agentId}-${timestamp}`;
    const content = formatContent(messages, format);
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
