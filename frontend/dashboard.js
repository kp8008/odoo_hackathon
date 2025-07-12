// // Global variables
// let currentUser = null;
// let selectedUser = null;
// const API_BASE = 'http://localhost:5000/api';

// // Initialize dashboard
// document.addEventListener('DOMContentLoaded', function() {
//     try {
//         if (!isLoggedIn()) {
//             window.location.href = 'login.html';
//             return;
//         }
        
//         currentUser = getCurrentUser();
        
//         if (!currentUser || !currentUser._id) {
//             console.error('Invalid user data');
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             window.location.href = 'login.html';
//             return;
//         }
        
//         displayUserInfo();
//         loadSwapRequests();
//         loadAllUsers();
//         // Success message on redirect
//         const urlParams = new URLSearchParams(window.location.search);
//         if (urlParams.get('registered') === '1') {
//             showMessage('યુઝર સફળતાપૂર્વક રજિસ્ટર થયો!', 'success');
//         }
//         if (urlParams.get('login') === '1') {
//             alert('Login successful!');
//         }
//         if (urlParams.get('swapped') === '1') {
//             alert('Skill swapped successfully!');
//         }
//     } catch (error) {
//         console.error('Dashboard initialization error:', error);
//         alert('Error loading dashboard. Please refresh the page.');
//     }
// });

// function displayUserInfo() {
//     const userAvatar = document.getElementById('userAvatar');
//     const userName = document.getElementById('userName');
    
//     userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
//     userName.textContent = currentUser.name;
// }

// async function searchUsers() {
//     // હવે બીજું કોઈ user card ન બતાવવું
//     displayCurrentUserCard();
// }

// async function loadAllUsers() {
//     try {
//         const response = await fetch(`${API_BASE}/users/search?skill=`, {
//             headers: getAuthHeaders()
//         });
//         if (response.ok) {
//             const users = await response.json();
//             displayUsers(users);
//         } else {
//             console.error('Failed to load users');
//         }
//     } catch (error) {
//         console.error('Network error:', error);
//     }
// }

// function displayUsers(users) {
//     const resultsDiv = document.getElementById('results');
//     if (users.length === 0) {
//         resultsDiv.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">કોઈ યુઝર મળ્યા નથી</p>';
//         return;
//     }
//     resultsDiv.innerHTML = users.map(user => `
//         <div class="mini-user-card${user._id === currentUser._id ? ' current-user-card' : ''}">
//             <div class="mini-user-info">
//                 <div>
//                     <div class="mini-user-name">${user.name}</div>
//                     <div class="mini-user-meta">${user.location ? user.location + ' | ' : ''}${user.email}</div>
//                 </div>
//                 <div class="mini-user-actions">
//                     <span class="icon-btn" title="Edit" onclick="window.location.href='edit-profile.html?userId=${user._id}'">&#9998;</span>
//                     <span class="icon-btn" title="Delete" onclick="deleteUser('${user._id}')">&#128465;</span>
//                     <span class="icon-btn" title="Favorite">&#10084;</span>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// function displayCurrentUserCard() {
//     const resultsDiv = document.getElementById('results');
//     const user = currentUser;
//     resultsDiv.innerHTML = `
//         <div class="user-card">
//             <div class="user-header">
//                 <div class="user-avatar-small">${user.name.charAt(0).toUpperCase()}</div>
//                 <div class="user-details">
//                     <h3>${user.name}</h3>
//                     ${user.location ? `<div class="user-location">📍 ${user.location}</div>` : ''}
//                 </div>
//             </div>
//             <div class="user-rating">
//                 <div class="stars">${'★'.repeat(Math.floor(user.rating || 0))}${'☆'.repeat(5 - Math.floor(user.rating || 0))}</div>
//                 <span class="rating-text">${user.rating ? user.rating.toFixed(1) : 'No'} (${user.totalRatings || 0} reviews)</span>
//             </div>
//             <div class="skills-section">
//                 <h4>આપતા સ્કિલ્સ:</h4>
//                 <div class="skills-tags">
//                     ${user.skillsOffered.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
//                 </div>
//             </div>
//             <div class="skills-section">
//                 <h4>માગતા સ્કિલ્સ:</h4>
//                 <div class="skills-tags">
//                     ${user.skillsWanted.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
//                 </div>
//             </div>
//             <div class="availability">⏰ ઉપલબ્ધતા: ${user.availability || 'અજ્ઞાત'}</div>
//             <div class="user-actions">
//                 <button class="btn-secondary" onclick="window.location.href='edit-profile.html?userId=${user._id}'">Edit</button>
//             </div>
//         </div>
//     `;
// }



// async function loadSwapRequests() {
//     try {
//         const response = await fetch(`${API_BASE}/swaps/by-user/${currentUser._id}`, {
//             headers: getAuthHeaders()
//         });
        
//         if (response.ok) {
//             const swaps = await response.json();
//             displaySwapRequests(swaps);
//         } else {
//             console.error('Failed to load swap requests');
//         }
//     } catch (error) {
//         console.error('Network error:', error);
//     }
// }

// function displaySwapRequests(swaps) {
//     const swapRequestsDiv = document.getElementById('swapRequests');
    
//     if (swaps.length === 0) {
//         swapRequestsDiv.innerHTML = '<p style="text-align: center; color: #666;">No swap requests yet</p>';
//         return;
//     }
    
//     swapRequestsDiv.innerHTML = swaps.map(swap => {
//         const isReceiver = swap.receiverId._id === currentUser._id;
//         const otherUser = isReceiver ? swap.senderId : swap.receiverId;
        
//         let actions = '';
//         if (swap.status === 'Pending') {
//             if (isReceiver) {
//                 actions = `
//                     <div class="swap-actions">
//                         <button class="btn-accept" onclick="handleSwapAction('${swap._id}', 'accept')">Accept</button>
//                         <button class="btn-reject" onclick="handleSwapAction('${swap._id}', 'reject')">Reject</button>
//                     </div>
//                 `;
//             } else {
//                 actions = `
//                     <div class="swap-actions">
//                         <button class="btn-cancel" onclick="handleSwapAction('${swap._id}', 'cancel')">Cancel</button>
//                     </div>
//                 `;
//             }
//         } else if (swap.status === 'Accepted') {
//             actions = `
//                 <div class="swap-actions">
//                     <button class="btn-primary" onclick="completeSwap('${swap._id}')">Complete & Rate</button>
//                 </div>
//             `;
//         }
        
//         return `
//             <div class="swap-card">
//                 <div class="swap-header">
//                     <div>
//                         <strong>${isReceiver ? 'From' : 'To'}:</strong> ${otherUser.name}
//                     </div>
//                     <span class="swap-status status-${swap.status.toLowerCase()}">${swap.status}</span>
//                 </div>
//                 <div>
//                     <strong>You ${isReceiver ? 'receive' : 'offer'}:</strong> ${swap.skillOffered}<br>
//                     <strong>You ${isReceiver ? 'offer' : 'receive'}:</strong> ${swap.skillWanted}
//                 </div>
//                 ${swap.message ? `<div style="margin-top: 10px;"><strong>Message:</strong> ${swap.message}</div>` : ''}
//                 ${actions}
//             </div>
//         `;
//     }).join('');
// }

// async function handleSwapAction(swapId, action) {
//     try {
//         const response = await fetch(`${API_BASE}/swaps/${action}/${swapId}`, {
//             method: 'PUT',
//             headers: getAuthHeaders()
//         });
        
//         if (response.ok) {
//             loadSwapRequests();
//             loadAllUsers(); // user list update
//         } else {
//             const data = await response.json();
//             alert(data.message || 'Action failed');
//         }
//     } catch (error) {
//         alert('Network error. Please try again.');
//     }
// }

// function completeSwap(swapId) {
//     const rating = prompt('Rate this swap (1-5 stars):');
//     const feedback = prompt('Leave feedback (optional):');
    
//     if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
//         fetch(`${API_BASE}/swaps/complete/${swapId}`, {
//             method: 'PUT',
//             headers: getAuthHeaders(),
//             body: JSON.stringify({
//                 rating: parseInt(rating),
//                 feedback: feedback || ''
//             })
//         })
//         .then(response => {
//             if (response.ok) {
//                 alert('Swap completed successfully!');
//                 loadSwapRequests();
//             } else {
//                 alert('Failed to complete swap');
//             }
//         })
//         .catch(error => {
//             alert('Network error. Please try again.');
//         });
//     }
// }

// function goToSwapSkill(userId) {
//     window.location.href = `swap-skill.html?userId=${userId}`;
// }

// function editUser(userId) {
//     window.location.href = `swap-skill.html?userId=${userId}`;
// }

// // Add deleteUser dummy function for now
// function deleteUser(userId) {
//     alert('Delete action for userId: ' + userId);
// }

// // Show message utility (Gujarati)
// function showMessage(msg, type = 'info') {
//     const existing = document.getElementById('msgBox');
//     if (existing) existing.remove();
//     const div = document.createElement('div');
//     div.id = 'msgBox';
//     div.className = `msg-box ${type}`;
//     div.innerText = msg;
//     document.body.appendChild(div);
//     setTimeout(() => div.remove(), 3000);
// }

 

// dashboard.js

// let currentUser = null;
// const API_BASE = 'http://localhost:5000/api';

// document.addEventListener('DOMContentLoaded', () => {
//   if (!localStorage.getItem('token')) {
//     return window.location.href = 'login.html';
//   }

//   currentUser = getCurrentUser();
//   if (!currentUser?._id) {
//     localStorage.clear();
//     return window.location.href = 'login.html';
//   }

//   displayUserInfo();
//   loadAllUsers();

//   const params = new URLSearchParams(location.search);
//   if (params.get('login') === '1') {
//     alert('Login successful!');
//   }
// });

// function getCurrentUser() {
//   try {
//     const u = JSON.parse(localStorage.getItem('user') || 'null');
//     return u;
//   } catch {
//     return null;
//   }
// }

// function displayUserInfo() {
//   document.getElementById('userAvatar').textContent = currentUser.name[0].toUpperCase();
//   document.getElementById('userName').textContent = currentUser.name;
// }

// function logout() {
//   localStorage.clear();
//   window.location = 'login.html';
// }

// function getAuthHeaders() {
//   return {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   };
// }

// async function loadAllUsers() {
//   try {
//     const res = await fetch(`${API_BASE}/users/search?skill=`, {
//       headers: getAuthHeaders()
//     });
//     if (!res.ok) throw new Error('Failed to fetch users');
//     const users = await res.json();
//     displayUsers(users);
//   } catch (err) {
//     console.error(err);
//     document.getElementById('results').innerHTML = `<p style="text-align:center;color:#666;">Error loading users</p>`;
//   }
// }

// function displayUsers(users) {
//   const container = document.getElementById('results');
//   if (!users.length) {
//     return container.innerHTML = `<p style="text-align:center;color:#666;">No users found</p>`;
//   }

//   container.innerHTML = users.map(u => {
//     const offer = (u.skillsOffered || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
//     const want = (u.skillsWanted || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
//     return `
//       <div class="mini-user-card${u._id === currentUser._id ? ' current-user-card' : ''}">
//         <div class="mini-user-info">
//           <div>
//             <div class="mini-user-name">${u.name}</div>
//             <div class="mini-user-meta">${u.location ? u.location + ' | ' : ''}${u.email}</div>
//           </div>
//           <div class="mini-user-actions">
//             <span class="icon-btn" title="Edit" onclick="window.location='edit-profile.html?userId=${u._id}'">✏️</span>
//             <span class="icon-btn" title="Delete" onclick="deleteUser('${u._id}')">🗑️</span>
//           </div>
//         </div>
//         <div class="skills-section">
//           <h4>Offers:</h4><div class="skills-tags">${offer}</div>
//         </div>
//         <div class="skills-section">
//           <h4>Wants:</h4><div class="skills-tags">${want}</div>
//         </div>
//       </div>`;
//   }).join('');
// }

// function deleteUser(id) {
//   alert(`Would delete user ${id}`);
// }

// dashboard.js

let currentUser = null;
let selectedUser = null;
const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    try {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = getCurrentUser();

        if (!currentUser || !currentUser._id) {
            console.error('Invalid user data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return;
        }

        displayUserInfo();
        loadSwapRequests();
        loadAllUsers();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registered') === '1') {
            showMessage('યુઝર સફળતાપૂર્વક રજિસ્ટર થયો!', 'success');
        }
        if (urlParams.get('login') === '1') {
            alert('Login successful!');
        }
        if (urlParams.get('swapped') === '1') {
            alert('Skill swapped successfully!');
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Error loading dashboard. Please refresh the page.');
    }
});

function displayUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    userName.textContent = currentUser.name;
}

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        if (!user._id || !user.name || !user.email) return null;
        return user;
    } catch (e) {
        console.error('User parse error:', e);
        return null;
    }
}

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    window.location.href = 'login.html';
}

async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE}/users/search?skill=`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        } else {
            console.error('Failed to load users');
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

function displayUsers(users) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    if (users.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">કોઈ યુઝર મળ્યા નથી</p>';
        return;
    }

    resultsDiv.innerHTML = users.map(user => `
        <div class="mini-user-card${user._id === currentUser._id ? ' current-user-card' : ''}">
            <div class="mini-user-info">
                <div>
                    <div class="mini-user-name">${user.name}</div>
                    <div class="mini-user-meta">${user.location ? user.location + ' | ' : ''}${user.email}</div>
                    <div class="mini-user-skills">
                        <strong>Offers:</strong> ${(user.skillsOffered || []).map(skill => `<span class="skill-tag">${skill}</span>`).join(' ')}
                        <strong>Wants:</strong> ${(user.skillsWanted || []).map(skill => `<span class="skill-tag">${skill}</span>`).join(' ')}
                    </div>
                </div>
                <div class="mini-user-actions">
                    
                <span class="icon-btn" onclick="confirmSwap('${user._id}')">✏️</span>

                    <span class="icon-btn" title="Delete" onclick="deleteUser('${user._id}')">🗑️</span>
                </div>
            </div>
        </div>
    `).join('');
}

function confirmSwap(userId) {
    const confirmBox = document.createElement('div');
    confirmBox.innerHTML = `
        <div class="popup-overlay">
            <div class="popup-box">
                <p>Are you sure you want to swap the skills?</p>
                <button onclick="proceedToRequest('${userId}')">Yes</button>
                <button onclick="this.closest('.popup-overlay').remove()">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmBox);
}

function proceedToRequest(userId) {
    window.location.href = `request.html?userId=${userId}`;
}

async function loadSwapRequests() {
    try {
        const response = await fetch(`${API_BASE}/swaps/by-user/${currentUser._id}`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const swaps = await response.json();
            displaySwapRequests(swaps);
        } else {
            console.error('Failed to load swap requests');
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

function displaySwapRequests(swaps) {
    const swapRequestsDiv = document.getElementById('swapRequests');

    if (!swapRequestsDiv) return;

    if (swaps.length === 0) {
        swapRequestsDiv.innerHTML = '<p style="text-align: center; color: #666;">No swap requests yet</p>';
        return;
    }

    swapRequestsDiv.innerHTML = swaps.map(swap => {
        const isReceiver = swap.receiverId._id === currentUser._id;
        const otherUser = isReceiver ? swap.senderId : swap.receiverId;

        let actions = '';
        if (swap.status === 'Pending') {
            if (isReceiver) {
                actions = `
                    <div class="swap-actions">
                        <button class="btn-accept" onclick="handleSwapAction('${swap._id}', 'accept')">Accept</button>
                        <button class="btn-reject" onclick="handleSwapAction('${swap._id}', 'reject')">Reject</button>
                    </div>
                `;
            } else {
                actions = `
                    <div class="swap-actions">
                        <button class="btn-cancel" onclick="handleSwapAction('${swap._id}', 'cancel')">Cancel</button>
                    </div>
                `;
            }
        } else if (swap.status === 'Accepted') {
            actions = `
                <div class="swap-actions">
                    <button class="btn-primary" onclick="completeSwap('${swap._id}')">Complete & Rate</button>
                </div>
            `;
        }

        return `
            <div class="swap-card">
                <div class="swap-header">
                    <div><strong>${isReceiver ? 'From' : 'To'}:</strong> ${otherUser.name}</div>
                    <span class="swap-status status-${swap.status.toLowerCase()}">${swap.status}</span>
                </div>
                <div>
                    <strong>You ${isReceiver ? 'receive' : 'offer'}:</strong> ${swap.skillOffered}<br>
                    <strong>You ${isReceiver ? 'offer' : 'receive'}:</strong> ${swap.skillWanted}
                </div>
                ${swap.message ? `<div style="margin-top: 10px;"><strong>Message:</strong> ${swap.message}</div>` : ''}
                ${actions}
            </div>
        `;
    }).join('');
}

async function handleSwapAction(swapId, action) {
    try {
        const response = await fetch(`${API_BASE}/swaps/${action}/${swapId}`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            loadSwapRequests();
            loadAllUsers();
        } else {
            const data = await response.json();
            alert(data.message || 'Action failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

function completeSwap(swapId) {
    const rating = prompt('Rate this swap (1-5 stars):');
    const feedback = prompt('Leave feedback (optional):');

    if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
        fetch(`${API_BASE}/swaps/complete/${swapId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                rating: parseInt(rating),
                feedback: feedback || ''
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Swap completed successfully!');
                loadSwapRequests();
            } else {
                alert('Failed to complete swap');
            }
        })
        .catch(error => {
            alert('Network error. Please try again.');
        });
    }
}

function deleteUser(userId) {
    alert('Delete action for userId: ' + userId);
}

function showMessage(msg, type = 'info') {
    const existing = document.getElementById('msgBox');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'msgBox';
    div.className = `msg-box ${type}`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}


function confirmSwap(userId) {
    const confirmBox = document.createElement('div');
    confirmBox.innerHTML = `
        <div class="popup-overlay">
            <div class="popup-box">
                <p>Are you sure you want to swap the skills?</p>
                <button onclick="proceedToRequest('${userId}')">Yes</button>
                <button onclick="this.closest('.popup-overlay').remove()">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmBox);
}


function proceedToRequest(userId) {
    window.location.href = `swap-request.html?userId=${userId}`;
}

