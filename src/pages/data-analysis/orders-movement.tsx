import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaTruckMoving, FaChartBar } from 'react-icons/fa';
import ExcelFileUploader from '../../components/data-analysis/ExcelFileUploader';
import OrdersMovementViewer from '../../components/data-analysis/OrdersMovementViewer';
import PageHeader from '../../components/common/PageHeader';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import FeatureGate from '../../components/auth/FeatureGate';

const OrdersMovement = () => {
  const [analysisType] = useState<'orders' | 'products'>('orders');
  const [excelData, setExcelData] = useState<any[] | null>(null);

  const handleDataLoaded = (data: any[]) => {
    setExcelData(data);
  };

  return (
    <ProtectedRoute moduleKey={'data-analysis'}>
      <DashboardLayout>
        <FeatureGate feature={'data-analysis.orders-movement'}>
          <div className="mx-auto w-full">
            <PageHeader 
              title={<><FaTruckMoving className="inline-block mr-2" /> Órdenes en Movimiento</>}
              description="Analiza y rastrea el estado de órdenes en proceso de entrega"
              backLink="/data-analysis"
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
        </FeatureGate>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default OrdersMovement;
