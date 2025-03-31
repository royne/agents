import React, { useState, useEffect } from 'react';
import type { Advertisement } from '../../types/database';
import { expensesDatabaseService } from '../../services/database/expensesService';
import type { DailyExpenses } from '../../types/database';
import { getCurrentLocalDate, formatDateForInput, getTodayString, isSameDay } from '../../utils/dateUtils';

interface Expense {
  id?: string;
  advertisement_id: string;
  amount: number;
  date: Date;
  company_id: string;
}

interface ExpensesFormProps {
  selectedAd: Advertisement | null;
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExpensesForm: React.FC<ExpensesFormProps> = ({ selectedAd, companyId, onSuccess, onCancel }) => {
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingExpense, setExistingExpense] = useState<DailyExpenses | null>(null);

  useEffect(() => {
    if (selectedAd && companyId) {
      checkForExistingExpense();
    }
  }, [selectedAd, companyId]);

  const checkForExistingExpense = async () => {
    if (!selectedAd || !companyId) return;
    
    setLoading(true);
    try {
      // Obtener todos los gastos para la compañía
      const expenses = await expensesDatabaseService.getExpenses(companyId);
      
      // Comprobar si existe un gasto para hoy y para este anuncio
      const today = getCurrentLocalDate();
      const existingExpenseForToday = expenses.find(expense => 
        expense.advertisement_id === selectedAd.id && 
        isSameDay(new Date(expense.date), today)
      );
      
      if (existingExpenseForToday) {
        setIsEditMode(true);
        setExistingExpense(existingExpenseForToday);
        setCurrentExpense({
          id: existingExpenseForToday.id,
          advertisement_id: existingExpenseForToday.advertisement_id,
          amount: existingExpenseForToday.amount,
          date: new Date(existingExpenseForToday.date),
        });
      } else {
        setIsEditMode(false);
        setExistingExpense(null);
        setCurrentExpense({
          advertisement_id: selectedAd.id,
          amount: 0,
          date: getCurrentLocalDate(),
          company_id: companyId
        });
      }
    } catch (error) {
      console.error('Error al verificar gastos existentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedAd) return;

    try {
      setLoading(true);
      const expensePayload = {
        advertisement_id: selectedAd.id,
        amount: currentExpense.amount || 0,
        date: currentExpense.date || getCurrentLocalDate(),
        company_id: companyId,
      };

      if (isEditMode && existingExpense?.id) {
        // Actualizar gasto existente
        await expensesDatabaseService.updateExpense(
          existingExpense.id,
          expensePayload,
          companyId
        );
        alert('Gasto actualizado correctamente');
      } else {
        // Crear nuevo gasto
        await expensesDatabaseService.createExpense(expensePayload, companyId);
        alert('Gasto registrado correctamente');
      }
      onSuccess();
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentExpense.amount) {
    return <div className="text-center py-4">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        placeholder="Monto del gasto"
        className="w-full p-3 rounded bg-gray-700 text-white border border-red-500"
        value={currentExpense.amount || ''}
        onChange={(e) => setCurrentExpense({
          ...currentExpense,
          amount: Number(e.target.value)
        })}
        required
      />
      
      {isEditMode ? (
        <div className="w-full p-3 rounded bg-gray-700 text-white">
          <p>Fecha: {currentExpense.date ? new Date(currentExpense.date).toLocaleDateString() : ''}</p>
          <p className="text-xs text-gray-400">Este gasto ya existe para la fecha actual</p>
        </div>
      ) : (
        <input
          type="date"
          className="w-full p-3 rounded bg-gray-700 text-white"
          value={currentExpense.date ? formatDateForInput(currentExpense.date) : ''}
          onChange={(e) => setCurrentExpense({
            ...currentExpense,
            date: new Date(e.target.value)
          })}
          required
        />
      )}
      
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Guardando...' : isEditMode ? 'Actualizar Gasto' : 'Registrar Gasto'}
        </button>
      </div>
    </form>
  );
};

export default ExpensesForm;