import { useState, useEffect, useCallback } from 'react';
import type { ServiceRequest, ServiceRequestType, RestaurantTable, DiningSession } from '../../types/index.ts';
import { serviceRequestRepository } from '../../repositories/serviceRequestRepository.ts';
import { tableRepository } from '../../repositories/tableRepository.ts';
import { sessionRepository } from '../../repositories/sessionRepository.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';
import { timeAgo, formatTableName } from '../../i18n/index.ts';

export default function ServiceDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [occupiedTables, setOccupiedTables] = useState<RestaurantTable[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLanguage();

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

  if (loading) return <div className="page-container"><p>{t.common.loading}</p></div>;

  const requestTypes = Object.keys(t.serviceType) as ServiceRequestType[];

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1rem' }}>{t.serviceDashboard.title}</h1>

      {/* Pending requests */}
      {requests.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.serviceDashboard.noPending}</p>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          {requests.map((req) => (
            <div key={req.id} className="card" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{formatTableName(req.tableName, lang)}</strong>
                <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>
                  {t.serviceType[req.type as ServiceRequestType] ?? req.type}
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {timeAgo(req.requestedAt, lang)}
                  {req.notes && <span> — {req.notes}</span>}
                </div>
              </div>
              <button className="btn btn-success" onClick={() => handleComplete(req.id!)}>{t.serviceDashboard.complete}</button>
            </div>
          ))}
        </div>
      )}

      {/* Add request form */}
      <div className="card" style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t.serviceDashboard.addRequest}</h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>{t.serviceDashboard.tableLabel}</label>
          <select
            className="input"
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value ? parseInt(e.target.value, 10) : '')}
            style={{ width: '100%' }}
          >
            <option value="">{t.serviceDashboard.selectTable}</option>
            {occupiedTables.map((tbl) => (
              <option key={tbl.id} value={tbl.id}>{formatTableName(tbl.name, lang)}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>{t.serviceDashboard.requestType}</label>
          <select
            className="input"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as ServiceRequestType)}
            style={{ width: '100%' }}
          >
            {requestTypes.map((type) => (
              <option key={type} value={type}>{t.serviceType[type]}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>{t.serviceDashboard.notes}</label>
          <input
            type="text"
            className="input"
            placeholder={t.serviceDashboard.notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!selectedTableId}>
          {t.serviceDashboard.submit}
        </button>
      </div>
    </div>
  );
}
