import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaTruckMoving, FaChartBar } from 'react-icons/fa';
import ExcelFileUploader from '../../components/data-analysis/ExcelFileUploader';
import OrdersMovementViewer from '../../components/data-analysis/OrdersMovementViewer';
import PageHeader from '../../components/common/PageHeader';

const OrdersMovement = () => {
  const [analysisType] = useState<'orders' | 'products'>('orders');
  const [excelData, setExcelData] = useState<any[] | null>(null);

  const handleDataLoaded = (data: any[]) => {
    setExcelData(data);
  };

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
};

export default OrdersMovement;
