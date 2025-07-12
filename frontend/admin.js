// Global variables
let currentUser = null;
const API_BASE = 'http://localhost:5000/api';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = getCurrentUser();
    
    // Check if user is admin
    if (!currentUser.isAdmin) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }
    
    displayUserInfo();
    loadDashboardData();
});

function displayUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    userName.textContent = `${currentUser.name} (Admin)`;
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}Section`).style.display = 'block';
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'swaps':
            loadSwaps();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Dashboard Overview
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDashboardStats(data);
            displayRecentActivity(data);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

function displayDashboardStats(data) {
    document.getElementById('totalUsers').textContent = data.users.total;
    document.getElementById('activeUsers').textContent = data.users.active;
    document.getElementById('totalSwaps').textContent = data.swaps.total;
    document.getElementById('completedSwaps').textContent = data.swaps.completed;
}

function displayRecentActivity(data) {
    const recentUsersDiv = document.getElementById('recentUsers');
    const recentSwapsDiv = document.getElementById('recentSwaps');
    
    recentUsersDiv.innerHTML = `
        <h4>Recent Users</h4>
        ${data.recentUsers.map(user => `
            <div class="activity-item">
                <strong>${user.name}</strong> - ${user.email}
                <small>${new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('')}
    `;
    
    recentSwapsDiv.innerHTML = `
        <h4>Recent Swaps</h4>
        ${data.recentSwaps.map(swap => `
            <div class="activity-item">
                <strong>${swap.senderId.name}</strong> → <strong>${swap.receiverId.name}</strong>
                <small>${swap.status} - ${new Date(swap.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('')}
    `;
}

// Users Management
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users/all`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

function displayUsers(users) {
    const usersListDiv = document.getElementById('usersList');
    
    usersListDiv.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-avatar-small">${user.name.charAt(0).toUpperCase()}</div>
                <div class="user-details">
                    <h3>${user.name}</h3>
                    <p>${user.email}</p>
                    <p>Rating: ${user.rating ? user.rating.toFixed(1) : 'No'} (${user.totalRatings || 0} reviews)</p>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn-${user.isBanned ? 'primary' : 'reject'}" 
                        onclick="toggleUserBan('${user._id}', ${!user.isBanned})">
                    ${user.isBanned ? 'Unban' : 'Ban'} User
                </button>
                <span class="status-badge ${user.isBanned ? 'banned' : 'active'}">
                    ${user.isBanned ? 'Banned' : 'Active'}
                </span>
            </div>
        </div>
    `).join('');
}

async function toggleUserBan(userId, banStatus) {
    try {
        const response = await fetch(`${API_BASE}/users/ban/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isBanned: banStatus })
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            alert('Failed to update user status');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Swaps Management
async function loadSwaps() {
    try {
        const response = await fetch(`${API_BASE}/swaps/all`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const swaps = await response.json();
            displaySwaps(swaps);
        }
    } catch (error) {
        console.error('Failed to load swaps:', error);
    }
}

function displaySwaps(swaps) {
    const swapsListDiv = document.getElementById('swapsList');
    
    swapsListDiv.innerHTML = swaps.map(swap => `
        <div class="swap-card">
            <div class="swap-header">
                <div>
                    <strong>${swap.senderId.name}</strong> → <strong>${swap.receiverId.name}</strong>
                </div>
                <span class="swap-status status-${swap.status.toLowerCase()}">${swap.status}</span>
            </div>
            <div>
                <strong>Offering:</strong> ${swap.skillOffered}<br>
                <strong>Wanting:</strong> ${swap.skillWanted}
            </div>
            ${swap.message ? `<div style="margin-top: 10px;"><strong>Message:</strong> ${swap.message}</div>` : ''}
            <div style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                Created: ${new Date(swap.createdAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

// Platform Messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE}/admin/messages`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const messages = await response.json();
            displayMessages(messages);
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

function displayMessages(messages) {
    const messagesListDiv = document.getElementById('messagesList');
    
    messagesListDiv.innerHTML = messages.map(message => `
        <div class="message-card">
            <div class="message-header">
                <h4>${message.title}</h4>
                <span class="message-type ${message.type}">${message.type}</span>
            </div>
            <p>${message.message}</p>
            <div class="message-footer">
                <small>By: ${message.createdBy.name} on ${new Date(message.createdAt).toLocaleDateString()}</small>
                <button class="btn-${message.isActive ? 'reject' : 'primary'}" 
                        onclick="toggleMessage('${message._id}', ${!message.isActive})">
                    ${message.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

function openMessageModal() {
    document.getElementById('messageModal').style.display = 'block';
}

function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
    document.getElementById('messageForm').reset();
}

// Handle message form submission
document.getElementById('messageForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('messageTitle').value;
    const message = document.getElementById('messageContent').value;
    const type = document.getElementById('messageType').value;
    
    try {
        const response = await fetch(`${API_BASE}/admin/message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, message, type })
        });
        
        if (response.ok) {
            alert('Message sent successfully!');
            closeMessageModal();
            loadMessages();
        } else {
            alert('Failed to send message');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

async function toggleMessage(messageId, isActive) {
    try {
        const response = await fetch(`${API_BASE}/admin/message/${messageId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isActive })
        });
        
        if (response.ok) {
            loadMessages();
        } else {
            alert('Failed to update message');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Reports
async function loadReports() {
    try {
        const response = await fetch(`${API_BASE}/admin/reports`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const reports = await response.json();
            displayReports(reports);
        }
    } catch (error) {
        console.error('Failed to load reports:', error);
    }
}

function displayReports(reports) {
    const reportsListDiv = document.getElementById('reportsList');
    
    reportsListDiv.innerHTML = reports.map(report => `
        <div class="report-card">
            <h4>${report.type.replace('-', ' ').toUpperCase()}</h4>
            <p>Generated by: ${report.generatedBy.name}</p>
            <p>Date: ${new Date(report.generatedAt).toLocaleDateString()}</p>
            <button class="btn-primary" onclick="viewReport('${report._id}')">View Report</button>
        </div>
    `).join('');
}

async function generateReport(reportType) {
    try {
        const response = await fetch(`${API_BASE}/admin/report/${reportType}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const reportData = await response.json();
            alert(`${reportType.replace('-', ' ')} report generated successfully!`);
            loadReports();
        } else {
            alert('Failed to generate report');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

function viewReport(reportId) {
    // This would typically open a detailed view or download the report
    alert('Report viewing functionality would be implemented here');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeMessageModal();
    }
} 