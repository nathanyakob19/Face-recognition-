import React, { useEffect, useState } from 'react';
import './Admindashboard.css';

const buttonStyle = {
  marginRight: '8px',
  padding: '6px 12px',
  border: 'none',
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '14px'
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', department: '', region: '' });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [adminDetails, setAdminDetails] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/all-users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const adminId = parsedUser.id;

      fetch(`http://localhost:5000/AdminDashboard/${adminId}`)
        .then(res => res.json())
        .then(data => setAdminDetails(data))
        .catch(err => console.error("Error fetching admin details:", err));

      fetch(`http://localhost:5000/login-history`)
        .then(res => res.json())
        .then(data => setLoginHistory(data))
        .catch(err => console.error("Error fetching login history:", err));
    }
  }, []);

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      department: user.department,
      region: user.region
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const { name, department, region } = editFormData;
    fetch(`http://localhost:5000/edit-user/${editingUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, department, region })
    })
      .then(res => res.json())
      .then(() => {
        fetch('http://localhost:5000/all-users')
          .then(res => res.json())
          .then(data => setUsers(data));
        setEditingUserId(null);
      });
  };

  const handleAssignTask = () => {
    if (!selectedUserId || !newTask) return;
    fetch('http://localhost:5000/assign-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedUserId, task: newTask })
    })
      .then(res => res.json())
      .then(() => {
        fetchTasks(selectedUserId);
        setNewTask('');
      });
  };

  const fetchTasks = (userId) => {
    fetch(`http://localhost:5000/get-tasks/${userId}`)
      .then(res => res.json())
      .then(data => setTasks(data));
  };

  const handleEditTask = (taskId, taskName) => {
    setEditingTaskId(taskId);
    setEditedTaskName(taskName);
  };

  const handleSaveTask = () => {
    fetch('http://localhost:5000/edit-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: editingTaskId, task: editedTaskName })
    })
      .then(res => res.json())
      .then(() => {
        fetchTasks(selectedUserId);
        setEditingTaskId(null);
        setEditedTaskName('');
      });
  };

  const handleMarkTaskDone = (taskId) => {
    fetch('http://localhost:5000/update-task-status',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, status: 'Done' })
    })
      .then(res => res.json())
      .then(() => fetchTasks(selectedUserId));
  };

  const handleDeleteLoginHistory = (loginId) => {
    fetch(`http://localhost:5000/delete-login-history/${loginId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        setLoginHistory(prev => prev.filter(history => history.id !== loginId));
      });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      fetch(`http://localhost:5000/delete-user/${userId}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        })
        .catch(err => console.error("Error deleting user:", err));
    }
  };

  return (
    <div className='container'>
      <h2>Admin Dashboard</h2>

      {adminDetails && adminDetails.admin && (
        <div>
          <h3>Admin Details</h3>
          <p><strong>Name:</strong> {adminDetails.admin.name}</p>
          <p><strong>Department:</strong> {adminDetails.admin.department}</p>
          <p><strong>Region:</strong> {adminDetails.admin.region}</p>
        </div>
      )}

      <h3>All Users</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} border="1">
        <thead>
          <tr>
            <th style={{ padding: '8px' }}>ID</th>
            <th style={{ padding: '8px' }}>Name</th>
            <th style={{ padding: '8px' }}>Department</th>
            <th style={{ padding: '8px' }}>Region</th>
         
            <th style={{ padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: '8px' }}>{user.id}</td>
              <td style={{ padding: '8px' }}>{user.name}</td>
              <td style={{ padding: '8px' }}>{user.department}</td>
              <td style={{ padding: '8px' }}>{user.region}</td>
              <td style={{ padding: '8px' }}>
                <button style={buttonStyle} onClick={() => handleEditClick(user)}>Edit</button>
                <button style={buttonStyle} onClick={() => {
                  setSelectedUserId(user.id);
                  fetchTasks(user.id);
                }}>View & Assign Tasks</button>
                <button style={buttonStyle} onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUserId && (
        <form onSubmit={handleEditSubmit} style={{ marginBottom: '20px' }}>
          <h3>Edit User</h3>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <br />
          <label>
            Department:
            <input
              type="text"
              name="department"
              value={editFormData.department}
              onChange={handleInputChange}
              required
            />
          </label>
          <br />
          <label>
            Region:
            <input
              type="text"
              name="region"
              value={editFormData.region}
              onChange={handleInputChange}
              required
            />
          </label>
          <br />
          <button type="submit" style={buttonStyle}>Save Changes</button>
          <button type="button" style={buttonStyle} onClick={() => setEditingUserId(null)}>Cancel</button>
        </form>
      )}

      {selectedUserId && (
        <div>
          <h3>Tasks for User ID {selectedUserId}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} border="1">
            <thead>
              <tr>
                <th style={{ padding: '8px' }}>ID</th>
                <th style={{ padding: '8px' }}>Task</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td style={{ padding: '8px' }}>{task.id}</td>
                  <td style={{ padding: '8px' }}>
                    {editingTaskId === task.id ? (
                      <input
                        value={editedTaskName}
                        onChange={(e) => setEditedTaskName(e.target.value)}
                      />
                    ) : (
                      task.task
                    )}
                  </td>
                  <td style={{ padding: '8px' }}>{task.status}</td>
                  <td style={{ padding: '8px' }}>
                    {editingTaskId === task.id ? (
                      <button style={buttonStyle} onClick={handleSaveTask}>Save</button>
                    ) : (
                      <>
                        <button style={buttonStyle} onClick={() => handleEditTask(task.id, task.task)}>Edit</button>
                        {task.status !== 'Done' && (
                          <button style={buttonStyle} onClick={() => handleMarkTaskDone(task.id)}>Mark as Done</button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Assign New Task</h4>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task"
          />
          <button style={buttonStyle} onClick={handleAssignTask}>Assign Task</button>
        </div>
      )}

      <h3>Login History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} border="1">
        <thead>
          <tr>
            <th style={{ padding: '8px' }}>Login ID</th>
            <th style={{ padding: '8px' }}>User ID</th>
            <th style={{ padding: '8px' }}>Login Time</th>
            <th style={{ padding: '8px' }}>IP ADDRESS</th>
            <th style={{ padding: '8px' }}>Actions</th>

          </tr>
        </thead>
        <tbody>
          {loginHistory.map(login => (
            <tr key={login.id}>
              <td style={{ padding: '8px' }}>{login.id}</td>
              <td style={{ padding: '8px' }}>{login.user_id}</td>
              <td style={{ padding: '8px' }}>{new Date(login.login_time).toLocaleString()}</td>
              <td style={{ padding: '8px' }}>{login.ip_address || 'N/A'}</td>
              <td style={{ padding: '8px' }}>
                <button style={buttonStyle} onClick={() => handleDeleteLoginHistory(login.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
