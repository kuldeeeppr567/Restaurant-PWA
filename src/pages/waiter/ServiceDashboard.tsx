import { useState, useEffect, useCallback } from 'react';
import type { ServiceRequest, ServiceRequestType, RestaurantTable, DiningSession } from '../../types/index.ts';
import { SERVICE_REQUEST_LABELS } from '../../types/index.ts';
import { serviceRequestRepository } from '../../repositories/serviceRequestRepository.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';

function timeElapsed(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

export default function ServiceDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [occupiedTables, setOccupiedTables] = useState<RestaurantTable[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Add request form
  const [selectedTableId, setSelectedTableId] = useState<number | ''>('');
  const [requestType, setRequestType] = useState<ServiceRequestType>('water');
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    const [pending, allTables, activeSessions] = await Promise.all([
      serviceRequestRepository.getPending(),
      tableRepository.getAll(),
      sessionRepository.getActive(),
    ]);
    setRequests(pending);
    setOccupiedTables(allTables.filter((t) => t.status !== 'available' && t.status !== 'ready_for_cleaning'));
    setSessions(activeSessions);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = useCallback(async (id: number) => {
    await serviceRequestRepository.complete(id);
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    if (!selectedTableId) return;
    const table = occupiedTables.find((t) => t.id === selectedTableId);
    const session = sessions.find((s) => s.tableId === selectedTableId);
    if (!table || !session) return;

    await serviceRequestRepository.create({
      sessionId: session.id!,
      tableId: table.id!,
      tableName: table.name,
      type: requestType,
      notes,
      requestedAt: new Date().toISOString(),
      completed: false,
    });
    setSelectedTableId('');
    setNotes('');
    fetchData();
  }, [selectedTableId, requestType, notes, occupiedTables, sessions, fetchData]);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  const requestTypes = Object.keys(SERVICE_REQUEST_LABELS) as ServiceRequestType[];

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1rem' }}>Service Requests</h1>

      {/* Pending requests */}
      {requests.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No pending service requests.</p>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          {requests.map((req) => (
            <div key={req.id} className="card" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{req.tableName}</strong>
                <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>
                  {SERVICE_REQUEST_LABELS[req.type]}
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {timeElapsed(req.requestedAt)}
                  {req.notes && <span> — {req.notes}</span>}
                </div>
              </div>
              <button className="btn btn-success" onClick={() => handleComplete(req.id!)}>Complete</button>
            </div>
          ))}
        </div>
      )}

      {/* Add request form */}
      <div className="card" style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add Request</h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Table</label>
          <select
            className="input"
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value ? parseInt(e.target.value, 10) : '')}
            style={{ width: '100%' }}
          >
            <option value="">Select a table</option>
            {occupiedTables.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Request Type</label>
          <select
            className="input"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as ServiceRequestType)}
            style={{ width: '100%' }}
          >
            {requestTypes.map((type) => (
              <option key={type} value={type}>{SERVICE_REQUEST_LABELS[type]}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Notes (optional)</label>
          <input
            type="text"
            className="input"
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!selectedTableId}>
          Submit Request
        </button>
      </div>
    </div>
  );
}
