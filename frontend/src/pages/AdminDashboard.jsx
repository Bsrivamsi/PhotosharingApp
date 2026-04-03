import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaChartPie, FaUsers, FaImages, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { API_BASE } from '../api';

const AdminAnalyticsCharts = lazy(() => import('../components/AdminAnalyticsCharts'));

const PAGE_SIZE = 8;
const normalizePhotoStatus = (status) => status || 'APPROVED';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const isAdmin = userRole === 'ROLE_ADMIN';
  const isModerator = userRole === 'ROLE_MODERATOR';
  const canAccessDashboard = isAdmin || isModerator;

  const [analytics, setAnalytics] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(false);

  const [activeTab, setActiveTab] = useState(isAdmin ? 'analytics' : 'photos');

  const [usersRows, setUsersRows] = useState([]);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalElements, setUsersTotalElements] = useState(0);

  const [photosRows, setPhotosRows] = useState([]);
  const [photosTotalPages, setPhotosTotalPages] = useState(1);
  const [photosTotalElements, setPhotosTotalElements] = useState(0);

  const [pendingRows, setPendingRows] = useState([]);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotalElements, setPendingTotalElements] = useState(0);

  const [categoriesRows, setCategoriesRows] = useState([]);
  const [categoriesTotalPages, setCategoriesTotalPages] = useState(1);
  const [categoriesTotalElements, setCategoriesTotalElements] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [activityRows, setActivityRows] = useState([]);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotalElements, setActivityTotalElements] = useState(0);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '', role: 'ROLE_USER', profileBio: '' });
  const [photoUploadForm, setPhotoUploadForm] = useState({ title: '', description: '', category: '', uploader: '' });
  const [photoUploadFile, setPhotoUploadFile] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);

  const [photoSearch, setPhotoSearch] = useState('');
  const [photoStatusFilter, setPhotoStatusFilter] = useState('ALL');
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState('ALL');
  const [photoPage, setPhotoPage] = useState(1);

  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingPage, setPendingPage] = useState(1);

  const [categorySearch, setCategorySearch] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);

  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const availableTabs = useMemo(() => {
    const baseTabs = ['photos', 'moderation', 'categories'];
    return isAdmin ? ['analytics', 'users', ...baseTabs, 'activity'] : baseTabs;
  }, [isAdmin]);

  const applyAuthFailure = (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      navigate('/login');
      return true;
    }
    return false;
  };

  const parsePaged = (data) => ({
    rows: data?.content || data?.logs || [],
    totalPages: Math.max(1, data?.totalPages || 1),
    totalElements: data?.totalElements ?? data?.totalLogs ?? 0
  });

  const fetchAnalytics = async () => {
    if (!isAdmin) return;
    const response = await axios.get(`${API_BASE}/admin/analytics/dashboard`, { headers: authHeaders });
    setAnalytics(response.data);
  };

  const fetchUsers = async (page = userPage) => {
    if (!isAdmin) return;
    const response = await axios.get(`${API_BASE}/admin/users`, {
      headers: authHeaders,
      params: { page: Math.max(0, page - 1), size: PAGE_SIZE, q: userSearch || undefined, role: userRoleFilter }
    });
    const parsed = parsePaged(response.data);
    setUsersRows(parsed.rows);
    setUsersTotalPages(parsed.totalPages);
    setUsersTotalElements(parsed.totalElements);
  };

  const fetchPhotos = async (page = photoPage) => {
    const response = await axios.get(`${API_BASE}/admin/photos`, {
      headers: authHeaders,
      params: {
        page: Math.max(0, page - 1),
        size: PAGE_SIZE,
        q: photoSearch || undefined,
        status: photoStatusFilter,
        category: photoCategoryFilter
      }
    });
    const parsed = parsePaged(response.data);
    setPhotosRows(parsed.rows);
    setPhotosTotalPages(parsed.totalPages);
    setPhotosTotalElements(parsed.totalElements);
  };

  const fetchPendingPhotos = async (page = pendingPage) => {
    const response = await axios.get(`${API_BASE}/admin/photos/pending`, {
      headers: authHeaders,
      params: { page: Math.max(0, page - 1), size: PAGE_SIZE, q: pendingSearch || undefined }
    });
    const parsed = parsePaged(response.data);
    setPendingRows(parsed.rows);
    setPendingTotalPages(parsed.totalPages);
    setPendingTotalElements(parsed.totalElements);
  };

  const fetchCategories = async (page = categoryPage) => {
    const response = await axios.get(`${API_BASE}/admin/categories`, {
      headers: authHeaders,
      params: { page: Math.max(0, page - 1), size: PAGE_SIZE, q: categorySearch || undefined }
    });
    const parsed = parsePaged(response.data);
    setCategoriesRows(parsed.rows);
    setCategoriesTotalPages(parsed.totalPages);
    setCategoriesTotalElements(parsed.totalElements);
  };

  const fetchCategoryOptions = async () => {
    const response = await axios.get(`${API_BASE}/admin/categories`, {
      headers: authHeaders,
      params: { page: 0, size: 100 }
    });
    const parsed = parsePaged(response.data);
    setCategoryOptions(parsed.rows.map((c) => c.name).filter(Boolean));
  };

  const fetchActivity = async (page = activityPage) => {
    if (!isAdmin) return;
    const response = await axios.get(`${API_BASE}/admin/activity-logs`, {
      headers: authHeaders,
      params: { page: Math.max(0, page - 1), size: PAGE_SIZE, q: activitySearch || undefined }
    });
    const parsed = parsePaged(response.data);
    setActivityRows(parsed.rows);
    setActivityTotalPages(parsed.totalPages);
    setActivityTotalElements(parsed.totalElements);
  };

  const refreshAllData = async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      const tasks = [fetchPhotos(1), fetchPendingPhotos(1), fetchCategories(1), fetchCategoryOptions()];
      if (isAdmin) {
        tasks.push(fetchAnalytics(), fetchUsers(1), fetchActivity(1));
      }
      await Promise.all(tasks);
      setUserPage(1);
      setPhotoPage(1);
      setPendingPage(1);
      setCategoryPage(1);
      setActivityPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) {
        setStatusMessage('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!canAccessDashboard) {
      navigate('/');
      return;
    }
    refreshAllData();
  }, [token, canAccessDashboard, navigate]);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) setActiveTab(availableTabs[0]);
  }, [availableTabs, activeTab]);

  useEffect(() => {
    if (!canAccessDashboard || !isAdmin) return;
    fetchUsers(userPage).catch((e) => !applyAuthFailure(e) && setStatusMessage('Failed to load users.'));
  }, [userPage, userSearch, userRoleFilter]);

  useEffect(() => {
    if (!canAccessDashboard) return;
    fetchPhotos(photoPage).catch((e) => !applyAuthFailure(e) && setStatusMessage('Failed to load photos.'));
  }, [photoPage, photoSearch, photoStatusFilter, photoCategoryFilter]);

  useEffect(() => {
    if (!canAccessDashboard) return;
    fetchPendingPhotos(pendingPage).catch((e) => !applyAuthFailure(e) && setStatusMessage('Failed to load moderation queue.'));
  }, [pendingPage, pendingSearch]);

  useEffect(() => {
    if (!canAccessDashboard) return;
    fetchCategories(categoryPage).catch((e) => !applyAuthFailure(e) && setStatusMessage('Failed to load categories.'));
  }, [categoryPage, categorySearch]);

  useEffect(() => {
    if (!canAccessDashboard || !isAdmin) return;
    fetchActivity(activityPage).catch((e) => !applyAuthFailure(e) && setStatusMessage('Failed to load activity logs.'));
  }, [activityPage, activitySearch]);

  useEffect(() => setSelectedUsers([]), [usersRows]);
  useEffect(() => setSelectedPhotos([]), [photosRows]);

  useEffect(() => setUserPage(1), [userSearch, userRoleFilter]);
  useEffect(() => setPhotoPage(1), [photoSearch, photoStatusFilter, photoCategoryFilter]);
  useEffect(() => setPendingPage(1), [pendingSearch]);
  useEffect(() => setCategoryPage(1), [categorySearch]);
  useEffect(() => setActivityPage(1), [activitySearch]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    setBusyAction(true);
    try {
      await axios.post(`${API_BASE}/admin/users`, newUserForm, { headers: authHeaders });
      setNewUserForm({ username: '', email: '', password: '', role: 'ROLE_USER', profileBio: '' });
      setStatusMessage('User created successfully.');
      await Promise.all([fetchUsers(1), fetchAnalytics()]);
      setUserPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage(error?.response?.data?.message || 'Failed to create user.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleUpdateUser = async (user) => {
    if (!isAdmin) return;
    const role = window.prompt('Enter role (ROLE_USER, ROLE_MODERATOR or ROLE_ADMIN):', user.role || 'ROLE_USER');
    if (!role) return;
    const profileBio = window.prompt('Enter profile bio:', user.profileBio || '') || '';
    try {
      await axios.put(`${API_BASE}/admin/users/${user.id}`, { role, profileBio }, { headers: authHeaders });
      setStatusMessage('User updated successfully.');
      await fetchUsers(userPage);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin || !window.confirm('Delete user?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/${userId}`, { headers: authHeaders });
      setStatusMessage('User deleted successfully.');
      await Promise.all([fetchUsers(userPage), fetchAnalytics()]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to delete user.');
    }
  };

  const handleBatchDeleteUsers = async () => {
    if (!isAdmin) return;
    if (selectedUsers.length === 0) return alert('Select at least one user.');
    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) return;
    setBusyAction(true);
    try {
      await axios.post(`${API_BASE}/admin/users/batch-delete`, { ids: selectedUsers }, { headers: authHeaders });
      setStatusMessage('Selected users deleted successfully.');
      setSelectedUsers([]);
      await Promise.all([fetchUsers(userPage), fetchActivity(1), fetchAnalytics()]);
      setActivityPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to delete selected users.');
    } finally {
      setBusyAction(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    if (!photoUploadFile) return setStatusMessage('Select an image file to upload.');
    setBusyAction(true);
    try {
      const formData = new FormData();
      formData.append('file', photoUploadFile);
      formData.append('title', photoUploadForm.title);
      formData.append('description', photoUploadForm.description);
      formData.append('category', photoUploadForm.category);
      formData.append('uploader', photoUploadForm.uploader || localStorage.getItem('username') || 'admin');
      await axios.post(`${API_BASE}/admin/photos/upload`, formData, {
        headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
      });
      setPhotoUploadForm({ title: '', description: '', category: '', uploader: '' });
      setPhotoUploadFile(null);
      setStatusMessage('Photo uploaded successfully.');
      await Promise.all([fetchPhotos(1), fetchPendingPhotos(1), fetchAnalytics(), fetchCategoryOptions()]);
      setPhotoPage(1);
      setPendingPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to upload photo.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleUpdatePhoto = async (photo) => {
    const title = window.prompt('Edit photo title:', photo.title || '');
    if (!title) return;
    const description = window.prompt('Edit description:', photo.description || '') || '';
    const category = window.prompt('Edit category:', photo.category || '') || '';
    try {
      await axios.put(`${API_BASE}/admin/photos/${photo.id}`, { title, description, category }, { headers: authHeaders });
      setStatusMessage('Photo updated successfully.');
      await Promise.all([fetchPhotos(photoPage), fetchPendingPhotos(pendingPage), fetchCategoryOptions()]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to update photo.');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!isAdmin || !window.confirm('Delete photo?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/photos/${photoId}`, { headers: authHeaders });
      setStatusMessage('Photo deleted successfully.');
      await Promise.all([fetchPhotos(photoPage), fetchAnalytics()]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to delete photo.');
    }
  };

  const handleBatchDeletePhotos = async () => {
    if (!isAdmin) return;
    if (selectedPhotos.length === 0) return alert('Select at least one photo.');
    if (!window.confirm(`Delete ${selectedPhotos.length} selected photos?`)) return;
    setBusyAction(true);
    try {
      await axios.post(`${API_BASE}/admin/photos/batch-delete`, { ids: selectedPhotos }, { headers: authHeaders });
      setStatusMessage('Selected photos deleted successfully.');
      setSelectedPhotos([]);
      await Promise.all([fetchPhotos(photoPage), fetchActivity(1), fetchAnalytics()]);
      setActivityPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to delete selected photos.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleApprovePhoto = async (photoId) => {
    const notes = window.prompt('Approval note (optional):', '') || '';
    try {
      await axios.post(`${API_BASE}/admin/photos/${photoId}/approve`, { notes }, { headers: authHeaders });
      setStatusMessage('Photo approved.');
      await Promise.all([fetchPendingPhotos(pendingPage), fetchPhotos(photoPage)]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to approve photo.');
    }
  };

  const handleRejectPhoto = async (photoId) => {
    const notes = window.prompt('Rejection reason (optional):', '') || '';
    try {
      await axios.post(`${API_BASE}/admin/photos/${photoId}/reject`, { notes }, { headers: authHeaders });
      setStatusMessage('Photo rejected.');
      await Promise.all([fetchPendingPhotos(pendingPage), fetchPhotos(photoPage)]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to reject photo.');
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    setBusyAction(true);
    try {
      await axios.post(`${API_BASE}/admin/categories`, categoryForm, { headers: authHeaders });
      setCategoryForm({ name: '', description: '' });
      setStatusMessage('Category created successfully.');
      await Promise.all([fetchCategories(1), fetchCategoryOptions()]);
      setCategoryPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to create category.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleUpdateCategory = async (category) => {
    if (!isAdmin) return;
    const name = window.prompt('Edit category name:', category.name || '');
    if (!name) return;
    const description = window.prompt('Edit category description:', category.description || '') || '';
    try {
      await axios.put(`${API_BASE}/admin/categories/${category.id}`, { name, description }, { headers: authHeaders });
      setStatusMessage('Category updated successfully.');
      await Promise.all([fetchCategories(categoryPage), fetchCategoryOptions()]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to update category.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!isAdmin || !window.confirm('Delete category?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/categories/${categoryId}`, { headers: authHeaders });
      setStatusMessage('Category deleted successfully.');
      await Promise.all([fetchCategories(categoryPage), fetchCategoryOptions()]);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to delete category.');
    }
  };

  const handleExportCsv = async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get(`${API_BASE}/admin/analytics/export/csv`, {
        headers: authHeaders,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to export analytics CSV.');
    }
  };

  const handleDeleteLog = async (id) => {
    if (!isAdmin || !window.confirm('Delete this log entry?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/activity-logs/${id}`, { headers: authHeaders });
      setStatusMessage('Activity log deleted successfully.');
      await fetchActivity(activityPage);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to delete activity log.');
    }
  };

  const handleClearLogs = async () => {
    if (!isAdmin || !window.confirm('Delete all activity logs?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/activity-logs`, { headers: authHeaders });
      setStatusMessage('All activity logs deleted successfully.');
      await fetchActivity(1);
      setActivityPage(1);
    } catch (error) {
      if (!applyAuthFailure(error)) setStatusMessage('Failed to clear activity logs.');
    }
  };

  const renderPagination = (page, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="pagination-row">
        <button className="tab-btn" onClick={() => setPage(page - 1)} disabled={page <= 1}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button className="tab-btn" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</button>
      </div>
    );
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <style>{`
        .admin-dashboard { padding: 20px; color: white; }
        .dashboard-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .dashboard-header h1 { display: flex; align-items: center; gap: 10px; font-size: 2em; margin-bottom: 8px; }
        .role-tag { padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.12); font-size: 0.85em; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab-btn { padding: 10px 20px; background: rgba(255,255,255,0.1); color: white; border: 2px solid transparent; border-radius: 6px; cursor: pointer; }
        .tab-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tab-btn.active { border-color: #007bff; background: #007bff; }
        .tab-btn:hover { background: rgba(0,123,255,0.35); }
        .card { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; backdrop-filter: blur(10px); margin-bottom: 20px; }
        .card h2 { margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .stat-box { background: rgba(255,255,255,0.05); padding: 14px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 1.8em; font-weight: bold; color: #00C49F; margin-bottom: 4px; }
        .stat-label { font-size: 0.9em; color: #ccc; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table thead { background: rgba(255,255,255,0.1); }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .table tbody tr:hover { background: rgba(255,255,255,0.05); }
        .action-btn { margin-right: 8px; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; color: white; }
        .delete-btn { background: #dc3545; }
        .edit-btn { background: #0d6efd; }
        .approve-btn { background: #198754; }
        .reject-btn { background: #dc3545; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 12px; }
        .form-grid input, .form-grid textarea, .form-grid select { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: white; }
        .form-grid textarea { min-height: 90px; resize: vertical; }
        .submit-btn { padding: 10px 14px; border: none; border-radius: 6px; cursor: pointer; background: #198754; color: white; font-weight: 600; }
        .status-message { margin: 10px 0 18px; color: #ffd166; }
        .filters-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px; }
        .filters-row input, .filters-row select { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: white; }
        .pagination-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; }
        .status-pill { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 0.8em; }
        .status-pill.pending { background: rgba(255,193,7,0.25); color: #ffd166; }
        .status-pill.approved { background: rgba(25,135,84,0.25); color: #7ddcaa; }
        .status-pill.rejected { background: rgba(220,53,69,0.25); color: #ff8f9c; }
        @media (max-width: 768px) {
          .table { font-size: 0.9em; }
          .table th, .table td { padding: 8px; }
        }
      `}</style>

      <div className="dashboard-header">
        <div>
          <h1><FaChartPie /> Admin Dashboard</h1>
          <span className="role-tag">Signed in as {isAdmin ? 'Admin' : 'Moderator'}</span>
        </div>
        {isAdmin && <button className="tab-btn" onClick={handleExportCsv}>Export Analytics CSV</button>}
      </div>

      {statusMessage && <div className="status-message">{statusMessage}</div>}

      <div className="tabs">
        {availableTabs.includes('analytics') && <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>}
        {availableTabs.includes('users') && <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users ({usersTotalElements})</button>}
        <button className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>Photos ({photosTotalElements})</button>
        <button className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>Moderation Queue ({pendingTotalElements})</button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories ({categoriesTotalElements})</button>
        {availableTabs.includes('activity') && <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity Logs ({activityTotalElements})</button>}
      </div>

      {activeTab === 'analytics' && isAdmin && (
        <>
          <div className="stats-grid">
            <div className="stat-box"><div className="stat-value">{analytics?.totalVisitors || 0}</div><div className="stat-label">Total Visitors</div></div>
            <div className="stat-box"><div className="stat-value">{analytics?.totalLogins || 0}</div><div className="stat-label">Total Logins</div></div>
            <div className="stat-box"><div className="stat-value">{analytics?.totalPhotosUploaded || 0}</div><div className="stat-label">Photos Uploaded</div></div>
            <div className="stat-box"><div className="stat-value">{analytics?.totalPhotosShared || 0}</div><div className="stat-label">Photos Shared</div></div>
            <div className="stat-box"><div className="stat-value">{analytics?.totalUsersCreated || 0}</div><div className="stat-label">Users Created</div></div>
            <div className="stat-box"><div className="stat-value">{analytics?.totalAnonymousVisitors || 0}</div><div className="stat-label">Anonymous Visitors</div></div>
          </div>
          <Suspense fallback={<div className="card">Loading charts...</div>}>
            <AdminAnalyticsCharts analytics={analytics || {}} categories={categoriesRows} />
          </Suspense>
        </>
      )}

      {activeTab === 'users' && isAdmin && (
        <>
          <div className="card">
            <h2>Create User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <input placeholder="Username" value={newUserForm.username} onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })} required />
                <input type="email" placeholder="Email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} required />
                <input type="password" placeholder="Password" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} required />
                <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}>
                  <option value="ROLE_USER">ROLE_USER</option>
                  <option value="ROLE_MODERATOR">ROLE_MODERATOR</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                </select>
              </div>
              <div className="form-grid">
                <textarea placeholder="Profile bio" value={newUserForm.profileBio} onChange={(e) => setNewUserForm({ ...newUserForm, profileBio: e.target.value })} />
              </div>
              <button className="submit-btn" type="submit" disabled={busyAction}>Create User</button>
            </form>
          </div>

          <div className="card">
            <h2><FaUsers /> User Management (Server Pagination)</h2>
            <div className="filters-row">
              <input placeholder="Search username/email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="ROLE_USER">ROLE_USER</option>
                <option value="ROLE_MODERATOR">ROLE_MODERATOR</option>
                <option value="ROLE_ADMIN">ROLE_ADMIN</option>
              </select>
            </div>
            <button className="action-btn delete-btn" onClick={handleBatchDeleteUsers} disabled={busyAction || selectedUsers.length === 0}><FaTrash /> Delete Selected ({selectedUsers.length})</button>
            <table className="table">
              <thead><tr><th>Select</th><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {usersRows.map((user) => (
                  <tr key={user.id}>
                    <td><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => setSelectedUsers((prev) => prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id])} /></td>
                    <td>{user.id}</td><td>{user.username}</td><td>{user.email}</td><td>{user.role}</td><td>{user.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => handleUpdateUser(user)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user.id)}><FaTrash /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(userPage, usersTotalPages, setUserPage)}
          </div>
        </>
      )}

      {activeTab === 'photos' && (
        <>
          {isAdmin && (
            <div className="card">
              <h2>Upload Photo As Admin</h2>
              <form onSubmit={handlePhotoUpload}>
                <div className="form-grid">
                  <input placeholder="Title" value={photoUploadForm.title} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, title: e.target.value })} required />
                  <input placeholder="Category" value={photoUploadForm.category} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, category: e.target.value })} />
                  <input placeholder="Uploader username (optional)" value={photoUploadForm.uploader} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, uploader: e.target.value })} />
                  <input type="file" accept="image/*" onChange={(e) => setPhotoUploadFile(e.target.files?.[0] || null)} required />
                </div>
                <div className="form-grid"><textarea placeholder="Description" value={photoUploadForm.description} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, description: e.target.value })} /></div>
                <button className="submit-btn" type="submit" disabled={busyAction}>Upload Photo</button>
              </form>
            </div>
          )}

          <div className="card">
            <h2><FaImages /> Photo Management (Server Pagination)</h2>
            <div className="filters-row">
              <input placeholder="Search title/uploader" value={photoSearch} onChange={(e) => setPhotoSearch(e.target.value)} />
              <select value={photoStatusFilter} onChange={(e) => setPhotoStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option>
              </select>
              <select value={photoCategoryFilter} onChange={(e) => setPhotoCategoryFilter(e.target.value)}>
                <option value="ALL">All Categories</option>
                {[...new Set(categoryOptions)].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            {isAdmin && <button className="action-btn delete-btn" onClick={handleBatchDeletePhotos} disabled={busyAction || selectedPhotos.length === 0}><FaTrash /> Delete Selected ({selectedPhotos.length})</button>}
            <table className="table">
              <thead><tr>{isAdmin && <th>Select</th>}<th>ID</th><th>Title</th><th>Uploader</th><th>Category</th><th>Status</th><th>Downloads</th><th>Shares</th><th>Actions</th></tr></thead>
              <tbody>
                {photosRows.map((photo) => {
                  const status = normalizePhotoStatus(photo.approvalStatus);
                  return (
                    <tr key={photo.id}>
                      {isAdmin && <td><input type="checkbox" checked={selectedPhotos.includes(photo.id)} onChange={() => setSelectedPhotos((prev) => prev.includes(photo.id) ? prev.filter((id) => id !== photo.id) : [...prev, photo.id])} /></td>}
                      <td>{photo.id}</td><td>{photo.title}</td><td>{photo.uploader}</td><td>{photo.category || 'N/A'}</td>
                      <td><span className={`status-pill ${status.toLowerCase()}`}>{status}</span></td>
                      <td>{photo.downloadCount || 0}</td><td>{photo.shareCount || 0}</td>
                      <td>
                        <button className="action-btn edit-btn" onClick={() => handleUpdatePhoto(photo)}>Edit</button>
                        {isAdmin && <button className="action-btn delete-btn" onClick={() => handleDeletePhoto(photo.id)}><FaTrash /> Delete</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {renderPagination(photoPage, photosTotalPages, setPhotoPage)}
          </div>
        </>
      )}

      {activeTab === 'moderation' && (
        <div className="card">
          <h2>Photo Approval Queue (Server Pagination)</h2>
          <div className="filters-row"><input placeholder="Search pending by title/uploader" value={pendingSearch} onChange={(e) => setPendingSearch(e.target.value)} /></div>
          <table className="table">
            <thead><tr><th>ID</th><th>Title</th><th>Uploader</th><th>Category</th><th>Uploaded</th><th>Actions</th></tr></thead>
            <tbody>
              {pendingRows.map((photo) => (
                <tr key={photo.id}>
                  <td>{photo.id}</td><td>{photo.title}</td><td>{photo.uploader}</td><td>{photo.category || 'N/A'}</td>
                  <td>{photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleString() : 'N/A'}</td>
                  <td>
                    <button className="action-btn approve-btn" onClick={() => handleApprovePhoto(photo.id)}><FaCheck /> Approve</button>
                    <button className="action-btn reject-btn" onClick={() => handleRejectPhoto(photo.id)}><FaTimes /> Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingRows.length === 0 && <p>No pending photos.</p>}
          {renderPagination(pendingPage, pendingTotalPages, setPendingPage)}
        </div>
      )}

      {activeTab === 'categories' && (
        <>
          {isAdmin && (
            <div className="card">
              <h2>Create Category</h2>
              <form onSubmit={handleCreateCategory}>
                <div className="form-grid">
                  <input placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                  <input placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                </div>
                <button className="submit-btn" type="submit" disabled={busyAction}>Create Category</button>
              </form>
            </div>
          )}

          <div className="card">
            <h2>Category Management {isModerator ? '(Read + Review)' : '(CRUD)'} (Server Pagination)</h2>
            <div className="filters-row"><input placeholder="Search category name/description" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} /></div>
            <table className="table">
              <thead><tr><th>ID</th><th>Name</th><th>Description</th>{isAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {categoriesRows.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td><td>{category.name}</td><td>{category.description || '-'}</td>
                    {isAdmin && <td><button className="action-btn edit-btn" onClick={() => handleUpdateCategory(category)}>Edit</button><button className="action-btn delete-btn" onClick={() => handleDeleteCategory(category.id)}><FaTrash /> Delete</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(categoryPage, categoriesTotalPages, setCategoryPage)}
          </div>
        </>
      )}

      {activeTab === 'activity' && isAdmin && (
        <div className="card">
          <h2>Activity Logs (Server Pagination)</h2>
          <div className="filters-row"><input placeholder="Search user/action/details" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} /></div>
          <button className="action-btn delete-btn" onClick={handleClearLogs}>Clear All Logs</button>
          <table className="table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th><th>IP</th><th>Actions</th></tr></thead>
            <tbody>
              {activityRows.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                  <td>{log.username || 'system'}</td><td>{log.action}</td><td>{log.details || '-'}</td><td>{log.ipAddress || 'N/A'}</td>
                  <td><button className="action-btn delete-btn" onClick={() => handleDeleteLog(log.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(activityPage, activityTotalPages, setActivityPage)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
