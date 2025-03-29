import DashboardLayout from '../components/layout/DashboardLayout';
import ChatInterface from '../components/ChatInterface';

export default function Chat() {
  return (
    <DashboardLayout>
      <div className='w-full md:w-3/4 mx-auto'>
        <ChatInterface/>
      </div>
    </DashboardLayout>
  );
}
