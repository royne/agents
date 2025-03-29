import DashboardLayout from '../components/layout/DashboardLayout';
import ChatInterface from '../components/ChatInterface';

interface ChatPageProps {
  apiKey: string;
}

export default function Chat({ apiKey }: ChatPageProps) {
  return (
    <DashboardLayout>
      <div>
        <ChatInterface apiKey={apiKey} />
      </div>
    </DashboardLayout>
  );
}
