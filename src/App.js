import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import * as queries from './graphql';
import './App.css';

Amplify.configure(awsExports);
const client = generateClient();

function averageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((a, b) => a + b.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

function App({ signOut, user }) {
  const [page, setPage] = useState('dashboard');
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [businessFilter, setBusinessFilter] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Form states
  const [bForm, setBForm] = useState({ name: '', address: '', category: '', description: '', phone: '', website: '' });
  const [rForm, setRForm] = useState({ businessId: '', rating: 5, text: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [br, rr] = await Promise.all([
        client.graphql({ query: queries.listBusinesses }),
        client.graphql({ query: queries.listReviews }),
      ]);
      setBusinesses(br.data.listBusinesses.items);
      setReviews(rr.data.listReviews.items);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleAddBusiness() {
    if (!bForm.name || !bForm.address || !bForm.category) return;
    await client.graphql({ query: queries.createBusiness, variables: { input: bForm } });
    setBForm({ name: '', address: '', category: '', description: '', phone: '', website: '' });
    setModal(null);
    fetchAll();
  }

  async function handleDeleteBusiness(id) {
    await client.graphql({ query: queries.deleteBusiness, variables: { input: { id } } });
    fetchAll();
  }

  async function handleAddReview() {
    if (!rForm.businessId || !rForm.rating) return;
    await client.graphql({
      query: queries.createReview,
      variables: { input: { ...rForm, createdAt: new Date().toISOString() } }
    });
    setRForm({ businessId: '', rating: 5, text: '' });
    setModal(null);
    fetchAll();
  }

  async function handleDeleteReview(id) {
    await client.graphql({ query: queries.deleteReview, variables: { input: { id } } });
    fetchAll();
  }

  const totalReviews = reviews.length;
  const avgRatingAll = averageRating(reviews);

  const filteredBusinesses = businesses.filter(b =>
    (b.name + b.address + b.category).toLowerCase().includes(businessFilter.toLowerCase())
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">🍽️ My Yelp</div>
        {['dashboard', 'businesses', 'reviews'].map(p => (
          <div key={p} className={`nav-item${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
            {p === 'dashboard' && '📊'} {p === 'businesses' && '🏢'} {p === 'reviews' && '⭐'} {p.charAt(0).toUpperCase() + p.slice(1)}
          </div>
        ))}
        <div className="signout-btn" onClick={signOut}>Sign out</div>
        <div className="user-badge">👤 {user?.username}</div>
      </aside>

      <main className="main">
        {loading && <div className="loading-bar" />}

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <div className="page-title">Dashboard</div>
            <div className="stats">
              <div className="stat"><div className="stat-label">Businesses</div><div className="stat-val">{businesses.length}</div></div>
              <div className="stat"><div className="stat-label">Reviews</div><div className="stat-val">{totalReviews}</div></div>
              <div className="stat"><div className="stat-label">Avg Rating</div><div className="stat-val">{avgRatingAll} ⭐</div></div>
            </div>
            <div className="two-col">
              <div className="card">
                <div className="card-header"><span className="card-title">Recent businesses</span></div>
                <table><thead><tr><th>Name</th><th>Category</th><th>Rating</th></tr></thead>
                  <tbody>{businesses.slice(-5).reverse().map(b => (
                    <tr key={b.id}>
                      <td>{b.name}</td>
                      <td>{b.category}</td>
                      <td>{averageRating(b.reviews?.items || [])} ⭐</td>
                    </tr>
                  ))}</tbody>
                </table>
                {businesses.length === 0 && <p className="empty">No businesses yet</p>}
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Recent reviews</span></div>
                <table><thead><tr><th>Business</th><th>Rating</th><th>Text</th></tr></thead>
                  <tbody>{reviews.slice(-5).reverse().map(r => (
                    <tr key={r.id}>
                      <td>{r.business?.name || '—'}</td>
                      <td>{r.rating} ⭐</td>
                      <td>{r.text?.slice(0, 50) || '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
                {reviews.length === 0 && <p className="empty">No reviews yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* BUSINESSES */}
        {page === 'businesses' && (
          <div>
            <div className="page-title">Businesses</div>
            <div className="card">
              <div className="card-header">
                <input className="search-bar" placeholder="Search businesses…" value={businessFilter} onChange={e => setBusinessFilter(e.target.value)} />
                <button className="btn btn-primary" onClick={() => setModal('business')}>+ Add business</button>
              </div>
              <table><thead><tr><th>Name</th><th>Address</th><th>Category</th><th>Rating</th><th>Reviews</th><th></th></tr></thead>
                <tbody>{filteredBusinesses.map(b => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.address}</td>
                    <td>{b.category}</td>
                    <td>{averageRating(b.reviews?.items || [])} ⭐</td>
                    <td>{b.reviews?.items?.length || 0}</td>
                    <td>
                      <button className="btn btn-sm btn-info" onClick={() => { setSelectedBusiness(b); setModal('reviews'); }}>View Reviews</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBusiness(b.id)}>Remove</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {filteredBusinesses.length === 0 && <p className="empty">No businesses found</p>}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {page === 'reviews' && (
          <div>
            <div className="page-title">Reviews</div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">All reviews</span>
                <button className="btn btn-primary" onClick={() => {
                  setRForm({ businessId: businesses[0]?.id || '', rating: 5, text: '' });
                  setModal('review');
                }}>+ Add review</button>
              </div>
              <table><thead><tr><th>Business</th><th>Rating</th><th>Text</th><th>Date</th><th></th></tr></thead>
                <tbody>{reviews.map(r => (
                  <tr key={r.id}>
                    <td>{r.business?.name || '—'}</td>
                    <td>{r.rating} ⭐</td>
                    <td>{r.text || '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteReview(r.id)}>Remove</button></td>
                  </tr>
                ))}</tbody>
              </table>
              {reviews.length === 0 && <p className="empty">No reviews yet</p>}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {modal === 'business' && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add business</div>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={bForm.name} onChange={e => setBForm({ ...bForm, name: e.target.value })} placeholder="e.g. Joe's Pizza" /></div>
              <div className="form-group"><label>Address</label><input value={bForm.address} onChange={e => setBForm({ ...bForm, address: e.target.value })} placeholder="123 Main St" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Category</label><input value={bForm.category} onChange={e => setBForm({ ...bForm, category: e.target.value })} placeholder="e.g. Restaurant" /></div>
              <div className="form-group"><label>Phone</label><input value={bForm.phone} onChange={e => setBForm({ ...bForm, phone: e.target.value })} placeholder="(555) 123-4567" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Website</label><input value={bForm.website} onChange={e => setBForm({ ...bForm, website: e.target.value })} placeholder="https://joespizza.com" /></div>
              <div className="form-group"><label>Description</label><textarea value={bForm.description} onChange={e => setBForm({ ...bForm, description: e.target.value })} placeholder="Brief description..." /></div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddBusiness}>Add business</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'review' && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add review</div>
            <div className="form-group" style={{ marginBottom: 12 }}><label>Business</label>
              <select value={rForm.businessId} onChange={e => setRForm({ ...rForm, businessId: e.target.value })}>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}><label>Rating</label>
              <select value={rForm.rating} onChange={e => setRForm({ ...rForm, rating: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} ⭐</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}><label>Review text</label>
              <textarea value={rForm.text} onChange={e => setRForm({ ...rForm, text: e.target.value })} placeholder="Write your review..." />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddReview}>Add review</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'reviews' && selectedBusiness && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Reviews for {selectedBusiness.name}</div>
            <div className="reviews-list">
              {selectedBusiness.reviews?.items?.map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-rating">{r.rating} ⭐</div>
                  <div className="review-text">{r.text || 'No text'}</div>
                  <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              )) || <p>No reviews yet</p>}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthenticator(App);
