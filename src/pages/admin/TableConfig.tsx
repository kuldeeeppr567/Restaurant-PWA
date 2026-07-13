import { useState, useEffect, useCallback } from 'react';
import { tableRepository } from '../../repositories/tableRepository.ts';
import type { RestaurantTable, TableStatus } from '../../types/index.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';

export default function TableConfig() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(4);
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const loadTables = useCallback(async () => {
    const all = await tableRepository.getAll();
    setTables(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleAdd = async () => {
    if (!newName.trim()) {
      alert(t.tableConfig.nameRequired);
      return;
    }
    await tableRepository.create({
      name: newName.trim(),
      status: 'available',
      capacity: newCapacity,
    });
    setNewName('');
    setNewCapacity(4);
    setShowAdd(false);
    await loadTables();
  };

  const startEdit = (table: RestaurantTable) => {
    setEditingId(table.id!);
    setEditName(table.name);
    setEditCapacity(table.capacity);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await tableRepository.update(editingId, {
      name: editName.trim(),
      capacity: editCapacity,
    });
    setEditingId(null);
    await loadTables();
  };

  const handleDelete = async (table: RestaurantTable) => {
    if (table.status !== 'available') {
      alert(t.tableConfig.cantDeleteMsg);
      return;
    }
    if (!window.confirm(t.tableConfig.confirmDelete(table.name))) return;
    const { db } = await import('../../db/index.ts');
    await db.restaurantTables.delete(table.id!);
    await loadTables();
  };

  if (loading) return <div className="p-4">{t.tableConfig.loading}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t.tableConfig.title}</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {t.tableConfig.addTable}
        </button>
      </div>

      {showAdd && (
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
          <h2 className="font-bold mb-2">{t.tableConfig.addNewTable}</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-semibold mb-1">{t.tableConfig.nameLabel}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.tableConfig.namePlaceholder}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t.tableConfig.capacityLabel}</label>
              <input
                type="number"
                min={1}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="border rounded px-3 py-2 w-20"
              />
            </div>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t.common.save}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => {
          const statusLabel = t.tableStatus[table.status as TableStatus] ?? table.status.replace(/_/g, ' ');
          return (
            <div key={table.id} className="border rounded-lg p-4">
              {editingId === table.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm">{t.tableConfig.editingCapacity}</label>
                    <input
                      type="number"
                      min={1}
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(Number(e.target.value))}
                      className="border rounded px-3 py-2 w-20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      {t.common.save}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">{table.name}</div>
                      <div className="text-sm text-gray-600">{t.tableConfig.capacityLabel}: {table.capacity}</div>
                      <div className="text-sm text-gray-500">
                        {statusLabel}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(table)}
                        className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800"
                      >
                        {t.tableConfig.editBtn}
                      </button>
                      <button
                        onClick={() => handleDelete(table)}
                        disabled={table.status !== 'available'}
                        className={`px-3 py-1 rounded text-sm ${
                          table.status === 'available'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {t.tableConfig.deleteBtn}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
