import { useEffect, useMemo, useState } from 'react';
import { fetchMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/materialService';
import MaterialTable from '../components/MaterialTable';
import MaterialForm from '../components/MaterialForm';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(materials.map((item) => item.category).filter(Boolean)));
  }, [materials]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchMaterials();
      setMaterials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleSave = async (payload) => {
    try {
      if (activeMaterial) {
        await updateMaterial(activeMaterial.id, payload);
      } else {
        await createMaterial(payload);
      }
      setActiveMaterial(null);
      await loadMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteMaterial(id);
      await loadMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="page-title">Material Tracking</h3>
          <p className="text-muted">Manage inventory with real-time tracking, alerts and Procurement workflows.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveMaterial(null)}>
          Add Material
        </button>
      </div>

      <MaterialForm activeMaterial={activeMaterial} onSave={handleSave} onCancel={() => setActiveMaterial(null)} />

      {loading ? (
        <div className="card card-custom p-4 text-center">Loading materials...</div>
      ) : (
        <MaterialTable
          materials={materials}
          onEdit={(item) => setActiveMaterial(item)}
          onDelete={handleDelete}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    </div>
  );
};

export default MaterialsPage;
