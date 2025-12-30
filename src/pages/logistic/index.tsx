import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaTruckMoving } from 'react-icons/fa';
import ExcelFileUploader from '../../components/data-analysis/ExcelFileUploader';
import OrdersMovementViewer from '../../components/data-analysis/OrdersMovementViewer';
import PageHeader from '../../components/common/PageHeader';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const Logistics = () => {
  const [analysisType] = useState<'orders' | 'products'>('orders');
  const [excelData, setExcelData] = useState<any[] | null>(null);

  const handleDataLoaded = (data: any[]) => {
    setExcelData(data);
  };

  return (
    <ProtectedRoute moduleKey={'logistic'}>
      <DashboardLayout>
        <div className="mx-auto w-full">
          <PageHeader
            title={<><FaTruckMoving className="inline-block mr-2" /> Gestión Logística</>}
            description="Analiza y rastrea el estado de órdenes en proceso de entrega"
            backLink="/"
          />

          <ExcelFileUploader
            onDataLoaded={handleDataLoaded}
            analysisType={analysisType}
            showTypeSelector={false}
          />

          {excelData && (
            <OrdersMovementViewer data={excelData} />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Logistics;
