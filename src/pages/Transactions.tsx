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

  const columnDefs = useMemo(() => ([
    { field: 'date', headerName: 'Date', editable: true },
    { field: 'category', headerName: 'Category', editable: true },
    { field: 'description', headerName: 'Description', editable: true },
    { field: 'amount', headerName: 'Amount', editable: true },
    { field: 'type', headerName: 'Type', editable: true },
  ]), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions?limit=500');
      setRowData(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCellEdit = useCallback(async (event: any) => {
    const updated = { [event.colDef.field]: event.newValue } as any;
    const id = event.data._id;
    const oldValue = event.oldValue;
    try {
      await api.patch(`/transactions/${id}`, updated);
    } catch (e) {
      event.node.setDataValue(event.colDef.field!, oldValue);
      alert('Update failed');
    }
  }, []);

  const onExport = useCallback(async (format: 'csv'|'xlsx') => {
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'}/transactions/export?format=${format}`;
    window.open(url, '_blank');
  }, []);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex gap-2 mb-2">
        <button className="btn btn-outline-secondary" onClick={() => load()}>Refresh</button>
        <button className="btn btn-outline-success" onClick={() => onExport('csv')}>Export CSV</button>
        <button className="btn btn-outline-success" onClick={() => onExport('xlsx')}>Export XLSX</button>
      </div>
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
