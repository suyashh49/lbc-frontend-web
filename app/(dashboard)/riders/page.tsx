'use client';

import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/lib/api';
import { Rider } from '@/types';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

const EMPTY_FORM = { employeeId: '', name: '', email: '', phone: '', password: '', hub: '', zone: '', vehicleType: 'motorcycle' };

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRider, setEditRider] = useState<Rider | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Rider | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getRiders({ search, status: statusFilter }).then(d => setRiders(d.riders)).catch(() => showToast('Failed to load riders', 'error')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const openCreate = () => { setEditRider(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (r: Rider) => {
    setEditRider(r);
    setForm({ employeeId: r.employeeId, name: r.name, email: r.email, phone: r.phone, password: '', hub: r.hub, zone: r.zone, vehicleType: r.vehicleType });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editRider) {
        const data: Record<string, unknown> = { ...form };
        if (!form.password) delete data.password;
        await api.updateRider(editRider._id, data);
        showToast('Rider updated');
      } else {
        await api.createRider(form);
        showToast('Rider created');
      }
      setShowModal(false);
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteRider(deleteTarget._id);
      showToast('Rider deactivated');
      setDeleteTarget(null);
      load();
    } catch { showToast('Failed to deactivate', 'error'); }
  };

  const toggleActive = async (r: Rider) => {
    try {
      await api.updateRider(r._id, { isActive: !r.isActive });
      showToast(r.isActive ? 'Rider deactivated' : 'Rider activated');
      load();
    } catch { showToast('Failed to update status', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1 className="page-title">Riders</h1><p className="page-subtitle">Manage delivery riders</p></div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ New Rider</button>
        </div>
      </div>

      <div className="table-container" style={{ paddingTop: 20 }}>
        <div className="table-toolbar">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="search-input" placeholder="Search riders..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Employee ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Hub</th><th>Zone</th><th>Vehicle</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={9}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
              ) : riders.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No riders found</div></div></td></tr>
              ) : riders.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.employeeId}</td>
                  <td>{r.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.hub}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.zone}</td>
                  <td><span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>{r.vehicleType}</span></td>
                  <td>
                    <button className={`badge badge-${r.isActive ? 'active' : 'inactive'}`} onClick={() => toggleActive(r)} style={{ cursor: 'pointer', border: 'none' }}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={() => setDeleteTarget(r)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editRider ? 'Edit Rider' : 'New Rider'} onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? <span className="spinner" /> : editRider ? 'Update' : 'Create'}</button></>}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Employee ID</label><input className="form-input" value={form.employeeId} onChange={e => setForm(f => ({...f, employeeId: e.target.value}))} required disabled={!!editRider} /></div>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Password {editRider && '(leave blank to keep)'}</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required={!editRider} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Hub</label><input className="form-input" value={form.hub} onChange={e => setForm(f => ({...f, hub: e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Zone</label><input className="form-input" value={form.zone} onChange={e => setForm(f => ({...f, zone: e.target.value}))} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Vehicle Type</label>
              <select className="form-select" value={form.vehicleType} onChange={e => setForm(f => ({...f, vehicleType: e.target.value}))}>
                <option value="motorcycle">Motorcycle</option><option value="bicycle">Bicycle</option><option value="van">Van</option><option value="car">Car</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog title="Deactivate Rider?" message={`This will deactivate ${deleteTarget.name} (${deleteTarget.employeeId}). They won't be able to log in.`} confirmText="Deactivate" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </>
  );
}
