import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api/client';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

interface Transaction {
  _id: string;
  date: string;
  category: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function TransactionsPage() {
  const [rowData, setRowData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const columnDefs = useMemo(() => ([
    { field: 'date', headerName: 'Date', editable: !demoMode },
    { field: 'category', headerName: 'Category', editable: !demoMode },
    { field: 'description', headerName: 'Description', editable: !demoMode },
    { field: 'amount', headerName: 'Amount', editable: !demoMode },
    { field: 'type', headerName: 'Type', editable: !demoMode },
  ]), [demoMode]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions?limit=500');
      setRowData(data.data);
      setDemoMode(false);
    } catch (e) {
      // Fallback demo data when backend is not running
      setDemoMode(true);
      setRowData([
        { _id: '1', date: '2025-01-05', category: 'Travel', description: 'Flight', amount: 1200, type: 'expense' },
        { _id: '2', date: '2025-01-10', category: 'Salary', description: 'Monthly salary', amount: 5000, type: 'income' },
        { _id: '3', date: '2025-02-02', category: 'Office', description: 'Supplies', amount: 150.5, type: 'expense' },
        { _id: '4', date: '2025-02-15', category: 'Freelance', description: 'Consulting', amount: 800, type: 'income' },
        { _id: '5', date: '2025-03-01', category: 'Utilities', description: 'Electricity', amount: 220.75, type: 'expense' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCellEdit = useCallback(async (event: any) => {
    if (demoMode) {
      // read-only in demo mode
      event.node.setDataValue(event.colDef.field!, event.oldValue);
      return;
    }
    const updated = { [event.colDef.field]: event.newValue } as any;
    const id = event.data._id;
    const oldValue = event.oldValue;
    try {
      await api.patch(`/transactions/${id}`, updated);
    } catch (e) {
      event.node.setDataValue(event.colDef.field!, oldValue);
      alert('Update failed');
    }
  }, [demoMode]);

  const onExport = useCallback(async (format: 'csv'|'xlsx') => {
    if (demoMode) {
      if (format === 'csv') {
        const headers = ['date','category','description','amount','type'];
        const csv = [headers.join(',')].concat(
          rowData.map(r => [r.date, r.category, JSON.stringify(r.description || ''), r.amount, r.type].join(','))
        ).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'transactions_demo.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Start backend to export XLSX.');
      }
      return;
    }
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'}/transactions/export?format=${format}`;
    window.open(url, '_blank');
  }, [demoMode, rowData]);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex gap-2 mb-2">
        <button className="btn btn-outline-secondary" onClick={() => load()}>Refresh</button>
        <button className="btn btn-outline-success" onClick={() => onExport('csv')}>Export CSV</button>
        <button className="btn btn-outline-success" onClick={() => onExport('xlsx')}>Export XLSX</button>
      </div>
      {loading && <div className="alert alert-info">Loading…</div>}
      {demoMode && <div className="alert alert-warning">Demo mode: showing sample data (backend not running)</div>}
      <div className="ag-theme-quartz" style={{ height: '75vh' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs as any}
          rowSelection="multiple"
          animateRows
          onCellValueChanged={onCellEdit}
        />
      </div>
    </div>
  );
}
