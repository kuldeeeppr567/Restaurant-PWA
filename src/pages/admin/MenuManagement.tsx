import { useState, useEffect, useCallback } from 'react';
import { menuRepository } from '../../repositories/menuRepository.ts';
import type { MenuItem } from '../../types/index.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';

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
  const { t } = useLanguage();

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
      alert(t.menuManagement.validationError);
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
    if (!window.confirm(t.menuManagement.confirmArchive(item.name))) return;
    await menuRepository.archive(item.id!);
    await loadData();
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await menuRepository.update(item.id!, { available: !item.available });
    await loadData();
  };

  if (loading) return <div className="p-4">{t.menuManagement.loading}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{t.menuManagement.title}</h1>
        <button
          onClick={openAddForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {t.menuManagement.addNew}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder={t.menuManagement.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">{t.menuManagement.allCategories}</option>
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
            {editingId ? t.menuManagement.editItem : t.menuManagement.addItem}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">{t.menuManagement.nameLabel}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t.menuManagement.categoryLabel}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">{t.menuManagement.selectCategory}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__new__">{t.menuManagement.newCategoryOption}</option>
              </select>
              {form.category === '__new__' && (
                <input
                  type="text"
                  placeholder={t.menuManagement.newCategoryPlaceholder}
                  value={form.newCategory}
                  onChange={(e) => setForm({ ...form, newCategory: e.target.value })}
                  className="border rounded px-3 py-2 w-full mt-2"
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">{t.menuManagement.priceLabel}</label>
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
              {t.menuManagement.availableLabel}
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t.menuManagement.saveBtn}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                {t.menuManagement.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(groupedItems).length === 0 ? (
        <p className="text-gray-500">{t.menuManagement.noItems}</p>
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
                      <span className="ml-2 text-gray-600">₹{item.price}</span>
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
                        {item.available ? t.menuManagement.availableBtn : t.menuManagement.unavailableBtn}
                      </button>
                      <button
                        onClick={() => openEditForm(item)}
                        className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800"
                      >
                        {t.menuManagement.editBtn}
                      </button>
                      <button
                        onClick={() => handleArchive(item)}
                        className="px-3 py-1 rounded text-sm bg-red-100 text-red-800"
                      >
                        {t.menuManagement.archiveBtn}
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
