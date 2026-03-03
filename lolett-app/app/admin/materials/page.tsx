'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

export default function MaterialsAdminPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');

  useEffect(() => {
    fetch('/api/admin/materials').then(r => r.json()).then(setMaterials).finally(() => setLoading(false));
  }, []);

  const toggle = async (m: Material) => {
    setSaving(m.id);
    const res = await fetch('/api/admin/materials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, active: !m.active }),
    });
    const updated = await res.json();
    setMaterials(prev => prev.map(x => x.id === m.id ? updated : x));
    setSaving(null);
  };

  const updateField = async (m: Material, field: 'name' | 'icon', value: string) => {
    setSaving(m.id);
    const res = await fetch('/api/admin/materials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, [field]: value }),
    });
    const updated = await res.json();
    setMaterials(prev => prev.map(x => x.id === m.id ? updated : x));
    setSaving(null);
  };

  const add = async () => {
    if (!newName.trim()) return;
    const maxOrder = Math.max(0, ...materials.map(m => m.sort_order));
    const res = await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, icon: newIcon || '●', sort_order: maxOrder + 1, active: false }),
    });
    const created = await res.json();
    setMaterials(prev => [...prev, created]);
    setNewName('');
    setNewIcon('');
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette matière ?')) return;
    await fetch('/api/admin/materials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-[#1a1510]/30">Chargement...</div>;

  const activeMaterials = materials.filter(m => m.active);
  const inactiveMaterials = materials.filter(m => !m.active);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">Matières</h1>
        <p className="text-sm text-[#B89547] mt-1">
          Gérez les matières affichées sur la page &ldquo;Mon Histoire&rdquo;. Activez/désactivez selon vos collections.
        </p>
      </div>

      {/* Active materials */}
      <Card className="border-gray-200/50 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-base font-medium flex items-center gap-2 text-[#1a1510]">
            <span className="w-2 h-2 rounded-full bg-[#B89547]" />
            Actives ({activeMaterials.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeMaterials.map(m => (
            <MaterialRow key={m.id} material={m} saving={saving === m.id} onToggle={() => toggle(m)} onUpdate={updateField} onDelete={() => remove(m.id)} />
          ))}
          {activeMaterials.length === 0 && <p className="text-sm text-[#1a1510]/30 text-center py-4">Aucune matière active</p>}
        </CardContent>
      </Card>

      {/* Inactive / available */}
      <Card className="border-gray-200/50 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-base font-medium flex items-center gap-2 text-[#1a1510]">
            <span className="w-2 h-2 rounded-full bg-[#1a1510]/20" />
            Disponibles ({inactiveMaterials.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inactiveMaterials.map(m => (
            <MaterialRow key={m.id} material={m} saving={saving === m.id} onToggle={() => toggle(m)} onUpdate={updateField} onDelete={() => remove(m.id)} />
          ))}
        </CardContent>
      </Card>

      {/* Add new */}
      <Card className="border-gray-200/50 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-base font-medium text-[#1a1510]">Ajouter une matière</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-[#1a1510]/50 mb-1 block">Nom</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Cachemire" className="text-[#1a1510]" />
            </div>
            <div className="w-24">
              <label className="text-xs text-[#1a1510]/50 mb-1 block">Icône</label>
              <Input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="◉" className="text-center text-lg text-[#1a1510]" />
            </div>
            <Button onClick={add} disabled={!newName.trim()} className="gap-1 bg-[#1B0B94] text-white hover:bg-[#130970]">
              <Plus className="w-4 h-4" /> Ajouter
            </Button>
          </div>
          <p className="text-xs text-[#1a1510]/50 mt-4 mb-2">Cliquez sur une icône pour la copier :</p>
          <div className="flex flex-wrap gap-2">
            {['≡','❛','〰','◉','⌘','◎','❖','▣','◇','∿','⊞','▤','●','○','◆','◈','✦','✧','❀','✿','♦','⬡','⬟','☀','♡','✕','⊕','⊗','⊙','⋈','⌂','☁','♢','◐','◑','▲','△','◌','⊶','⋮'].map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => { navigator.clipboard.writeText(icon); setNewIcon(icon); }}
                className="w-10 h-10 rounded-lg border border-gray-200/50 hover:border-[#B89547] hover:bg-[#B89547]/5 flex items-center justify-center text-lg transition-colors cursor-pointer text-[#1a1510]"
                title={`Copier ${icon}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-gray-200/50 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-montserrat)] text-base font-medium text-[#1a1510]">Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center flex-wrap gap-8 py-4" style={{ background: '#FDF5E6', borderRadius: 8, padding: '24px 16px' }}>
            {activeMaterials.map(m => (
              <div key={m.id} className="text-center">
                <div className="w-16 h-16 rounded-full border flex items-center justify-center text-xl mb-2 mx-auto" style={{ borderColor: '#B89547', color: '#B89547', background: 'rgba(184,149,71,0.06)' }}>
                  {m.icon}
                </div>
                <p className="text-xs uppercase tracking-widest" style={{ color: '#1a1510' }}>{m.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MaterialRow({ material: m, saving, onToggle, onUpdate, onDelete }: {
  material: Material;
  saving: boolean;
  onToggle: () => void;
  onUpdate: (m: Material, field: 'name' | 'icon', value: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(m.name);
  const [icon, setIcon] = useState(m.icon);

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200/50 bg-white">
      <GripVertical className="w-4 h-4 text-[#1a1510]/20 flex-shrink-0" />
      <div className="w-10 h-10 rounded-full border flex items-center justify-center text-lg flex-shrink-0" style={{ borderColor: '#B89547', color: '#B89547' }}>
        {m.icon}
      </div>
      <Input value={name} onChange={e => setName(e.target.value)} className="flex-1 h-8 text-sm text-[#1a1510]" />
      <Input value={icon} onChange={e => setIcon(e.target.value)} className="w-14 h-8 text-center text-lg text-[#1a1510]" />
      {(name !== m.name || icon !== m.icon) && (
        <Button size="sm" variant="outline" onClick={() => { onUpdate(m, 'name', name); onUpdate(m, 'icon', icon); }} disabled={saving} className="border-gray-200 hover:border-[#B89547] hover:text-[#B89547]">
          <Save className="w-3 h-3" />
        </Button>
      )}
      <Switch checked={m.active} onCheckedChange={onToggle} disabled={saving} />
      <button onClick={onDelete} className="text-red-400 hover:text-red-600 p-1 transition-colors" disabled={saving}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
