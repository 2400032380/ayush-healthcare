// ===== Admin Dashboard JavaScript =====

// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        // Redirect to login
        window.location.href = '../index.html';
        return;
    }
    
    // Set admin name
    document.getElementById('adminName').textContent = currentUser.fullName;
    
    // Initialize dashboard
    loadDashboardData();
    loadUsers();
    loadDoctors();
    loadPatients();
    loadPharmacists();
    loadAppointments();
    loadOrders();
});

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Show dashboard section
function showDashboardSection(section) {
    // Update nav
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    event.target.closest('li').classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section + '-section').classList.add('active');
}

// Load dashboard data
function loadDashboardData() {
    const users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
    const appointments = JSON.parse(localStorage.getItem('ayushAppointments') || '[]');
    const orders = JSON.parse(localStorage.getItem('ayushOrders') || '[]');
    
    const doctors = users.filter(u => u.role === 'doctor').length || 25;
    const patients = users.filter(u => u.role === 'patient').length || 1250;
    const pharmacists = users.filter(u => u.role === 'pharmacist').length || 10;
    
    document.getElementById('totalDoctors').textContent = doctors;
    document.getElementById('totalPatients').textContent = patients.toLocaleString();
    document.getElementById('totalPharmacists').textContent = pharmacists;
    document.getElementById('totalAppointments').textContent = appointments.length || 458;
    document.getElementById('totalOrders').textContent = orders.length || 892;
}

// Load users
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
    const tbody = document.getElementById('usersTableBody');
    
    // Add sample users if empty
    const allUsers = users.length > 0 ? users : getSampleUsers();
    
    tbody.innerHTML = allUsers.map((user, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td><span class="status-badge ${user.role}">${capitalizeFirst(user.role)}</span></td>
            <td>${user.mobile || 'N/A'}</td>
            <td><span class="status-badge active">Active</span></td>
            <td>
                <div class="action-btns">
                    <button class="view-btn" onclick="viewUser(${index})"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" onclick="editUser(${index})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteUser(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Sample users data
function getSampleUsers() {
    return [
        { fullName: 'Dr. Sarah Johnson', email: 'sarah@ayush247.com', role: 'doctor', mobile: '+91 9876543210' },
        { fullName: 'John Doe', email: 'john@email.com', role: 'patient', mobile: '+91 9876543211' },
        { fullName: 'Dr. Michael Chen', email: 'michael@ayush247.com', role: 'doctor', mobile: '+91 9876543212' },
        { fullName: 'Jane Smith', email: 'jane@email.com', role: 'patient', mobile: '+91 9876543213' },
        { fullName: 'Robert Wilson', email: 'robert@pharmacy.com', role: 'pharmacist', mobile: '+91 9876543214' },
        { fullName: 'Dr. Emily Brown', email: 'emily@ayush247.com', role: 'doctor', mobile: '+91 9876543215' },
        { fullName: 'Alice Johnson', email: 'alice@email.com', role: 'patient', mobile: '+91 9876543216' },
        { fullName: 'Mark Taylor', email: 'mark@pharmacy.com', role: 'pharmacist', mobile: '+91 9876543217' }
    ];
}

// Load doctors
function loadDoctors() {
    const doctors = [
        { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', experience: '15 years', status: 'Active', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face' },
        { name: 'Dr. Michael Chen', specialty: 'Neurology', experience: '12 years', status: 'Active', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face' },
        { name: 'Dr. Emily Brown', specialty: 'Pediatrics', experience: '10 years', status: 'Active', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face' },
        { name: 'Dr. James Wilson', specialty: 'Orthopedics', experience: '18 years', status: 'Active', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face' }
    ];
    
    const grid = document.getElementById('doctorsGrid');
    grid.innerHTML = doctors.map(doc => `
        <div class="doctor-card-admin">
            <img src="${doc.image}" alt="${doc.name}">
            <div class="info">
                <h4>${doc.name}</h4>
                <p><i class="fas fa-stethoscope"></i> ${doc.specialty}</p>
                <p><i class="fas fa-clock"></i> ${doc.experience}</p>
                <div class="status">
                    <span class="status-badge active">${doc.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load patients
function loadPatients() {
    const patients = [
        { id: 'P001', name: 'John Doe', email: 'john@email.com', age: 32, bloodGroup: 'O+', lastVisit: '2024-01-15' },
        { id: 'P002', name: 'Jane Smith', email: 'jane@email.com', age: 28, bloodGroup: 'A+', lastVisit: '2024-01-18' },
        { id: 'P003', name: 'Alice Johnson', email: 'alice@email.com', age: 45, bloodGroup: 'B-', lastVisit: '2024-01-20' },
        { id: 'P004', name: 'Bob Williams', email: 'bob@email.com', age: 55, bloodGroup: 'AB+', lastVisit: '2024-01-22' }
    ];
    
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.email}</td>
            <td>${patient.age}</td>
            <td>${patient.bloodGroup}</td>
            <td>${patient.lastVisit}</td>
            <td>
                <div class="action-btns">
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load pharmacists
function loadPharmacists() {
    const pharmacists = [
        { name: 'Robert Wilson', email: 'robert@pharmacy.com', store: 'Ayush Pharmacy - Main', status: 'Active', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop&crop=face' },
        { name: 'Mark Taylor', email: 'mark@pharmacy.com', store: 'Ayush Pharmacy - Branch 1', status: 'Active', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face' }
    ];
    
    const grid = document.getElementById('pharmacistsGrid');
    grid.innerHTML = pharmacists.map(pharma => `
        <div class="pharmacist-card">
            <img src="${pharma.image}" alt="${pharma.name}">
            <div class="info">
                <h4>${pharma.name}</h4>
                <p><i class="fas fa-envelope"></i> ${pharma.email}</p>
                <p><i class="fas fa-store"></i> ${pharma.store}</p>
                <div class="status">
                    <span class="status-badge active">${pharma.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load appointments
function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('ayushAppointments') || '[]');
    
    const allAppointments = appointments.length > 0 ? appointments : [
        { id: 'A001', patient: 'John Doe', doctor: 'Dr. Sarah Johnson', date: '24 Feb', time: '09:15 AM', type: 'Hospital Visit', status: 'Pending' },
        { id: 'A002', patient: 'Jane Smith', doctor: 'Dr. Michael Chen', date: '24 Feb', time: '10:00 AM', type: 'Online Consult', status: 'Confirmed' },
        { id: 'A003', patient: 'Alice Johnson', doctor: 'Dr. Emily Brown', date: '24 Feb', time: '02:30 PM', type: 'Hospital Visit', status: 'Completed' },
        { id: 'A004', patient: 'Bob Williams', doctor: 'Dr. James Wilson', date: '25 Feb', time: '11:00 AM', type: 'Online Consult', status: 'Pending' }
    ];
    
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = allAppointments.map((apt, index) => `
        <tr>
            <td>${apt.id || 'A00' + (index + 1)}</td>
            <td>${apt.patient || 'Patient'}</td>
            <td>${apt.doctor}</td>
            <td>${apt.date}</td>
            <td>${apt.time}</td>
            <td>${apt.type || 'Hospital Visit'}</td>
            <td><span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="approve-btn"><i class="fas fa-check"></i></button>
                    <button class="delete-btn"><i class="fas fa-times"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load orders
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('ayushOrders') || '[]');
    
    const allOrders = orders.length > 0 ? orders : [
        { id: 'ORD12458', customer: 'John Doe', items: ['Dolo 650', 'Crocin'], total: 57, date: '2024-01-22', status: 'Processing' },
        { id: 'ORD12459', customer: 'Jane Smith', items: ['Becosules', 'Vitamin D3'], total: 182, date: '2024-01-22', status: 'Shipped' },
        { id: 'ORD12460', customer: 'Alice Johnson', items: ['Metformin', 'Aspirin'], total: 70, date: '2024-01-21', status: 'Delivered' }
    ];
    
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = allOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer || 'Customer'}</td>
            <td>${Array.isArray(order.items) ? order.items.join(', ') : order.items.length + ' items'}</td>
            <td>₹${order.total}</td>
            <td>${order.date}</td>
            <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter functions
function filterUsers() {
    const role = document.getElementById('userRoleFilter').value;
    // Implement filtering logic
}

function searchUsers() {
    const search = document.getElementById('userSearch').value.toLowerCase();
    // Implement search logic
}

function filterAppointments() {
    // Implement filtering logic
}

function filterOrders() {
    // Implement filtering logic
}

// Modal functions
function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
}

function addNewUser(event) {
    event.preventDefault();
    
    const user = {
        fullName: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        mobile: document.getElementById('newUserMobile').value,
        role: document.getElementById('newUserRole').value,
        password: document.getElementById('newUserPassword').value
    };
    
    let users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
    users.push(user);
    localStorage.setItem('ayushUsers', JSON.stringify(users));
    
    closeAddUserModal();
    loadUsers();
    showToast('User added successfully!');
}

// Action functions
function viewUser(index) {
    showToast('Viewing user details...');
}

function editUser(index) {
    showToast('Edit functionality coming soon!');
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
        users.splice(index, 1);
        localStorage.setItem('ayushUsers', JSON.stringify(users));
        loadUsers();
        showToast('User deleted successfully!');
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Helper functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}
