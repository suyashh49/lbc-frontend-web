'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  available: 'var(--color-purple, #7c3aed)',
  assigned: 'var(--color-info, #3b82f6)',
  delivered: 'var(--color-success, #22c55e)',
  returned: 'var(--color-warning, #f59e0b)',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hubFilter, setHubFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (hubFilter) params.hub = hubFilter;
      const data = await api.getOrders(params);
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, hubFilter]);

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      setError('');
      await api.createOrder(formData);
      setShowCreateForm(false);
      setSuccessMsg('Order created successfully');
      fetchOrders();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id: string, formData: Record<string, any>) => {
    try {
      setError('');
      await api.updateOrder(id, formData);
      setEditingOrder(null);
      setSuccessMsg('Order updated successfully');
      fetchOrders();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.deleteOrder(id);
      setSuccessMsg('Order deleted');
      fetchOrders();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkImport = async (jsonData: Record<string, any>[]) => {
    try {
      setError('');
      const result = await api.bulkImportOrders(jsonData);
      setShowBulkImport(false);
      setSuccessMsg(result.message);
      fetchOrders();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Try JSON first
        try {
          const json = JSON.parse(text);
          const arr = Array.isArray(json) ? json : json.orders || [json];
          handleBulkImport(arr);
          return;
        } catch { /* not JSON, try CSV */ }

        // Parse CSV
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { setError('CSV must have header + data rows'); return; }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const rows = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim());
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
          return {
            trackingNumber: obj.trackingnumber || obj.tracking_number || obj.tracking,
            recipient: { name: obj.recipient_name || obj.name, phone: obj.recipient_phone || obj.phone },
            address: {
              text: obj.address || obj.address_text,
              lat: parseFloat(obj.lat || obj.address_lat) || 0,
              lng: parseFloat(obj.lng || obj.address_lng) || 0,
            },
            serviceType: obj.servicetype || obj.service_type || 'Standard',
            codAmount: parseFloat(obj.codamount || obj.cod_amount || obj.cod) || 0,
            packageDetails: obj.packagedetails || obj.package_details || '',
            specialInstructions: obj.specialinstructions || obj.special_instructions || '',
            hub: obj.hub || '',
            zone: obj.zone || '',
          };
        });
        handleBulkImport(rows);
      } catch (err: any) {
        setError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const uniqueHubs = [...new Set(orders.map(o => o.hub))].filter(Boolean);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowBulkImport(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Bulk Import
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + New Order
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Filters */}
      <div className="filters-row">
        <input
          className="filter-input"
          placeholder="Search tracking #, recipient, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
        </select>
        <select className="filter-select" value={hubFilter} onChange={(e) => setHubFilter(e.target.value)}>
          <option value="">All Hubs</option>
          {uniqueHubs.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Loading orders...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Recipient</th>
                <th>Address</th>
                <th>Hub / Zone</th>
                <th>Service</th>
                <th>COD</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td><span className="tracking-number">{order.trackingNumber}</span></td>
                  <td>
                    <div>{order.recipient.name}</div>
                    <div className="text-muted">{order.recipient.phone}</div>
                  </td>
                  <td><span className="text-truncate">{order.address.text}</span></td>
                  <td>
                    <div>{order.hub}</div>
                    <div className="text-muted">{order.zone}</div>
                  </td>
                  <td>{order.serviceType}</td>
                  <td>{order.codAmount > 0 ? `₱${order.codAmount.toLocaleString()}` : '—'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status] }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setEditingOrder(order)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(order._id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="empty-state">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateForm || editingOrder) && (
        <OrderFormModal
          order={editingOrder}
          onSubmit={(data) => editingOrder ? handleUpdate(editingOrder._id, data) : handleCreate(data)}
          onClose={() => { setShowCreateForm(false); setEditingOrder(null); }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="modal-overlay" onClick={() => setShowBulkImport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Bulk Import Orders</h2>
            <p className="text-muted">Upload a CSV or JSON file with order data.</p>
            <div className="form-group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="file-input"
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>
              CSV headers: trackingNumber, recipient_name, recipient_phone, address, lat, lng, hub, zone, serviceType, codAmount
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowBulkImport(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderFormModal({
  order,
  onSubmit,
  onClose,
}: {
  order: Order | null;
  onSubmit: (data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    trackingNumber: order?.trackingNumber || '',
    recipientName: order?.recipient?.name || '',
    recipientPhone: order?.recipient?.phone || '',
    addressText: order?.address?.text || '',
    addressLat: order?.address?.lat?.toString() || '',
    addressLng: order?.address?.lng?.toString() || '',
    serviceType: order?.serviceType || 'Standard',
    codAmount: order?.codAmount?.toString() || '0',
    packageDetails: order?.packageDetails || '',
    specialInstructions: order?.specialInstructions || '',
    hub: order?.hub || '',
    zone: order?.zone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      trackingNumber: form.trackingNumber,
      recipient: { name: form.recipientName, phone: form.recipientPhone },
      address: {
        text: form.addressText,
        lat: parseFloat(form.addressLat) || 0,
        lng: parseFloat(form.addressLng) || 0,
        geocoded: !!(parseFloat(form.addressLat) && parseFloat(form.addressLng)),
      },
      serviceType: form.serviceType,
      codAmount: parseFloat(form.codAmount) || 0,
      packageDetails: form.packageDetails,
      specialInstructions: form.specialInstructions,
      hub: form.hub,
      zone: form.zone,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
        <h2>{order ? 'Edit Order' : 'Create Order'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Tracking Number *</label>
              <input
                value={form.trackingNumber}
                onChange={e => setForm(p => ({ ...p, trackingNumber: e.target.value }))}
                required
                disabled={!!order}
                placeholder="LBC-2025-XXXX"
              />
            </div>
            <div className="form-group">
              <label>Service Type</label>
              <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}>
                <option>Standard</option>
                <option>Express Padala</option>
                <option>Same Day</option>
              </select>
            </div>
            <div className="form-group">
              <label>Recipient Name *</label>
              <input value={form.recipientName} onChange={e => setForm(p => ({ ...p, recipientName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Recipient Phone *</label>
              <input value={form.recipientPhone} onChange={e => setForm(p => ({ ...p, recipientPhone: e.target.value }))} required />
            </div>
            <div className="form-group full-width">
              <label>Address *</label>
              <input value={form.addressText} onChange={e => setForm(p => ({ ...p, addressText: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Latitude</label>
              <input value={form.addressLat} onChange={e => setForm(p => ({ ...p, addressLat: e.target.value }))} type="number" step="any" />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input value={form.addressLng} onChange={e => setForm(p => ({ ...p, addressLng: e.target.value }))} type="number" step="any" />
            </div>
            <div className="form-group">
              <label>Hub *</label>
              <input value={form.hub} onChange={e => setForm(p => ({ ...p, hub: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Zone *</label>
              <input value={form.zone} onChange={e => setForm(p => ({ ...p, zone: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>COD Amount</label>
              <input value={form.codAmount} onChange={e => setForm(p => ({ ...p, codAmount: e.target.value }))} type="number" step="0.01" />
            </div>
            <div className="form-group">
              <label>Package Details</label>
              <input value={form.packageDetails} onChange={e => setForm(p => ({ ...p, packageDetails: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label>Special Instructions</label>
              <input value={form.specialInstructions} onChange={e => setForm(p => ({ ...p, specialInstructions: e.target.value }))} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{order ? 'Save Changes' : 'Create Order'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
