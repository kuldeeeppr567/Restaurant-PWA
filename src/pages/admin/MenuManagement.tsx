import { useState, useEffect, useCallback } from 'react';
import { menuRepository } from '../../repositories/menuRepository.ts';
import type { MenuItem } from '../../types/index.ts';

interface MenuFormData {
  name: string;
  category: string;
  newCategory: string;
  price: number;
  available: boolean;
}

const emptyForm: MenuFormData = {
  name: '',
  category: '',
  newCategory: '',
  price: 0,
  available: true,
};

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const allItems = await menuRepository.getAll();
    const cats = await menuRepository.getCategories();
    setItems(allItems);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedItems = filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingId(item.id!);
    setForm({
      name: item.name,
      category: item.category,
      newCategory: '',
      price: item.price,
      available: item.available,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const category = form.newCategory.trim() || form.category;
    if (!form.name.trim() || !category || form.price <= 0) {
      alert('Please fill all required fields with valid values.');
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      await menuRepository.update(editingId, {
        name: form.name.trim(),
        category,
        price: form.price,
        available: form.available,
      });
    } else {
      await menuRepository.create({
        name: form.name.trim(),
        category,
        price: form.price,
        available: form.available,
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    setShowForm(false);
    await loadData();
  };

  const handleArchive = async (item: MenuItem) => {
    if (!window.confirm(`Archive "${item.name}"? It will no longer appear in menus.`)) return;
    await menuRepository.archive(item.id!);
    await loadData();
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await menuRepository.update(item.id!, { available: !item.available });
    await loadData();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button
          onClick={openAddForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Item
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
          <h2 className="text-lg font-bold mb-3">
            {editingId ? 'Edit Item' : 'Add New Item'}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__new__">+ New Category</option>
              </select>
              {form.category === '__new__' && (
                <input
                  type="text"
                  placeholder="New category name"
                  value={form.newCategory}
                  onChange={(e) => setForm({ ...form, newCategory: e.target.value })}
                  className="border rounded px-3 py-2 w-full mt-2"
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Price ({'\u20B9'})</label>
              <input
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Available
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(groupedItems).length === 0 ? (
        <p className="text-gray-500">No menu items found.</p>
      ) : (
        Object.entries(groupedItems)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, catItems]) => (
            <div key={category} className="mb-6">
              <h2 className="text-lg font-bold mb-2 border-b pb-1">{category}</h2>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded ${
                      !item.available ? 'bg-gray-100 opacity-60' : ''
                    }`}
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-gray-600">{'\u20B9'}{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded text-sm ${
                          item.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                      <button
                        onClick={() => openEditForm(item)}
                        className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(item)}
                        className="px-3 py-1 rounded text-sm bg-red-100 text-red-800"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
