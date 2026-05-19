'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Hub, Zone } from '@/types';

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hubs' | 'zones'>('hubs');
  const [showHubForm, setShowHubForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hubData, zoneData] = await Promise.all([api.getHubs(), api.getZones()]);
      setHubs(hubData.hubs);
      setZones(zoneData.zones);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Hub Handlers ────────────────────────────────

  const handleCreateHub = async (data: Record<string, any>) => {
    try {
      setError('');
      await api.createHub(data);
      setShowHubForm(false);
      setSuccessMsg('Hub created');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const handleUpdateHub = async (id: string, data: Record<string, any>) => {
    try {
      setError('');
      await api.updateHub(id, data);
      setEditingHub(null);
      setSuccessMsg('Hub updated');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteHub = async (id: string) => {
    if (!confirm('Delete this hub?')) return;
    try {
      await api.deleteHub(id);
      setSuccessMsg('Hub deleted');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  // ─── Zone Handlers ───────────────────────────────

  const handleCreateZone = async (data: Record<string, any>) => {
    try {
      setError('');
      await api.createZone(data);
      setShowZoneForm(false);
      setSuccessMsg('Zone created');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const handleUpdateZone = async (id: string, data: Record<string, any>) => {
    try {
      setError('');
      await api.updateZone(id, data);
      setEditingZone(null);
      setSuccessMsg('Zone updated');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    try {
      await api.deleteZone(id);
      setSuccessMsg('Zone deleted');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hubs & Zones</h1>
          <p className="page-subtitle">{hubs.length} hubs, {zones.length} zones</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => activeTab === 'hubs' ? setShowHubForm(true) : setShowZoneForm(true)}
        >
          + New {activeTab === 'hubs' ? 'Hub' : 'Zone'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Tabs */}
      <div className="tabs-row">
        <button
          className={`tab-btn ${activeTab === 'hubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('hubs')}
        >
          Hubs ({hubs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'zones' ? 'active' : ''}`}
          onClick={() => setActiveTab('zones')}
        >
          Zones ({zones.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : activeTab === 'hubs' ? (
        /* Hubs Table */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Geofence Radius</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hubs.map((hub) => (
                <tr key={hub._id}>
                  <td><strong>{hub.name}</strong></td>
                  <td>{hub.lat.toFixed(6)}</td>
                  <td>{hub.lng.toFixed(6)}</td>
                  <td>{hub.radiusMeters}m</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setEditingHub(hub)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteHub(hub._id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hubs.length === 0 && (
                <tr><td colSpan={5} className="empty-state">No hubs configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Zones Table */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Associated Hubs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone._id}>
                  <td><strong>{zone.name}</strong></td>
                  <td>
                    {Array.isArray(zone.hubIds) && zone.hubIds.length > 0
                      ? zone.hubIds.map((h: any) => typeof h === 'string' ? h : h.name).join(', ')
                      : '—'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setEditingZone(zone)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteZone(zone._id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr><td colSpan={3} className="empty-state">No zones configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Hub Form Modal */}
      {(showHubForm || editingHub) && (
        <HubFormModal
          hub={editingHub}
          onSubmit={(data) => editingHub ? handleUpdateHub(editingHub._id, data) : handleCreateHub(data)}
          onClose={() => { setShowHubForm(false); setEditingHub(null); }}
        />
      )}

      {/* Zone Form Modal */}
      {(showZoneForm || editingZone) && (
        <ZoneFormModal
          zone={editingZone}
          hubs={hubs}
          onSubmit={(data) => editingZone ? handleUpdateZone(editingZone._id, data) : handleCreateZone(data)}
          onClose={() => { setShowZoneForm(false); setEditingZone(null); }}
        />
      )}
    </div>
  );
}

function HubFormModal({
  hub,
  onSubmit,
  onClose,
}: {
  hub: Hub | null;
  onSubmit: (data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: hub?.name || '',
    lat: hub?.lat?.toString() || '',
    lng: hub?.lng?.toString() || '',
    radiusMeters: hub?.radiusMeters?.toString() || '200',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      radiusMeters: parseInt(form.radiusMeters) || 200,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{hub ? 'Edit Hub' : 'Create Hub'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Hub Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Makati Hub" />
            </div>
            <div className="form-group">
              <label>Latitude *</label>
              <input value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} required type="number" step="any" />
            </div>
            <div className="form-group">
              <label>Longitude *</label>
              <input value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} required type="number" step="any" />
            </div>
            <div className="form-group full-width">
              <label>Geofence Radius (meters)</label>
              <input value={form.radiusMeters} onChange={e => setForm(p => ({ ...p, radiusMeters: e.target.value }))} type="number" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{hub ? 'Save' : 'Create Hub'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ZoneFormModal({
  zone,
  hubs,
  onSubmit,
  onClose,
}: {
  zone: Zone | null;
  hubs: Hub[];
  onSubmit: (data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const existingHubIds = zone?.hubIds
    ? (zone.hubIds as any[]).map((h: any) => typeof h === 'string' ? h : h._id)
    : [];

  const [form, setForm] = useState({
    name: zone?.name || '',
    hubIds: existingHubIds as string[],
  });

  const toggleHub = (hubId: string) => {
    setForm(p => ({
      ...p,
      hubIds: p.hubIds.includes(hubId)
        ? p.hubIds.filter(id => id !== hubId)
        : [...p.hubIds, hubId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: form.name, hubIds: form.hubIds });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{zone ? 'Edit Zone' : 'Create Zone'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Zone Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Zone 3 - Makati CBD" />
            </div>
            <div className="form-group full-width">
              <label>Associated Hubs</label>
              <div className="checkbox-list">
                {hubs.length > 0 ? hubs.map(hub => (
                  <label key={hub._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.hubIds.includes(hub._id)}
                      onChange={() => toggleHub(hub._id)}
                    />
                    {hub.name}
                  </label>
                )) : <p className="text-muted">No hubs available. Create a hub first.</p>}
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{zone ? 'Save' : 'Create Zone'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
