// Pharmacist Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'pharmacist') {
        alert('Please login as a pharmacist to access this dashboard');
        window.location.href = '../index.html';
        return;
    }

    // Update UI with pharmacist info
    document.getElementById('pharmacistName').textContent = currentUser.name;
    document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileFullName').value = currentUser.name;
    document.getElementById('profileEmailInput').value = currentUser.email;

    // Load dashboard data
    loadDashboardData();
});

// Sample data
let prescriptionsData = [];
let ordersData = [];
let inventoryData = [];
let dispensedData = [];
let currentPrescription = null;

// Medicine database
const medicineDatabase = [
    { name: 'Paracetamol 500mg', category: 'Pain Relief', uses: 'Fever, Headache, Body aches', dosage: '1-2 tablets every 4-6 hours', sideEffects: 'Nausea, Liver damage (overdose)', storage: 'Store below 25°C' },
    { name: 'Ibuprofen 400mg', category: 'Pain Relief', uses: 'Pain, Inflammation, Fever', dosage: '1 tablet 3 times daily after meals', sideEffects: 'Stomach upset, Dizziness', storage: 'Store in cool dry place' },
    { name: 'Azithromycin 500mg', category: 'Antibiotics', uses: 'Bacterial infections, Respiratory infections', dosage: '1 tablet daily for 3 days', sideEffects: 'Nausea, Diarrhea, Abdominal pain', storage: 'Store below 30°C' },
    { name: 'Metformin 500mg', category: 'Diabetes', uses: 'Type 2 Diabetes management', dosage: '1 tablet twice daily with meals', sideEffects: 'GI upset, Lactic acidosis (rare)', storage: 'Store at room temperature' },
    { name: 'Amlodipine 5mg', category: 'Cardiac', uses: 'High blood pressure, Angina', dosage: '1 tablet daily', sideEffects: 'Swelling, Dizziness, Flushing', storage: 'Store below 25°C' },
    { name: 'Cetirizine 10mg', category: 'Cold & Flu', uses: 'Allergies, Cold symptoms, Hay fever', dosage: '1 tablet daily', sideEffects: 'Drowsiness, Dry mouth', storage: 'Store at room temperature' },
    { name: 'Vitamin D3 1000IU', category: 'Vitamins', uses: 'Vitamin D deficiency, Bone health', dosage: '1 capsule daily with food', sideEffects: 'Hypercalcemia (excess)', storage: 'Store in cool dry place' },
    { name: 'Omeprazole 20mg', category: 'Gastric', uses: 'Acid reflux, GERD, Ulcers', dosage: '1 capsule before breakfast', sideEffects: 'Headache, Nausea, Diarrhea', storage: 'Store below 25°C' }
];

// Load dashboard data
function loadDashboardData() {
    loadPrescriptions();
    loadOrders();
    loadInventory();
    loadDispensedRecords();
    loadMedicineInfo();
    loadRecentPrescriptions();
}

// Show dashboard section
function showDashboardSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });

    document.getElementById(sectionId + '-section').classList.add('active');
    
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(sectionId.toLowerCase())) {
            item.classList.add('active');
        }
    });
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Load recent prescriptions for overview
function loadRecentPrescriptions() {
    const prescriptions = getPrescriptionsData().filter(p => p.status === 'pending').slice(0, 3);
    
    const recentEl = document.getElementById('recentPrescriptions');
    recentEl.innerHTML = prescriptions.map(pres => `
        <div class="prescription-queue-card ${pres.urgent ? 'urgent' : ''}">
            <div class="header">
                <div class="patient-info">
                    <h4>${pres.patientName}</h4>
                    <p>Prescription ID: ${pres.id} | Dr. ${pres.doctor}</p>
                </div>
                <span class="status-badge ${pres.status}">${pres.status}</span>
            </div>
            <div class="medications">
                <h5>Medications:</h5>
                <ul>
                    ${pres.medications.map(med => `<li>${med.name} - ${med.dosage}</li>`).join('')}
                </ul>
            </div>
            <div class="actions">
                <button class="dispense-btn" onclick="openDispenseModal('${pres.id}')">
                    <i class="fas fa-check"></i> Dispense
                </button>
                <button class="reject-btn" onclick="rejectPrescription('${pres.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

// Get prescriptions data
function getPrescriptionsData() {
    if (prescriptionsData.length === 0) {
        prescriptionsData = [
            {
                id: 'PRES001',
                patientName: 'Rahul Sharma',
                patientAge: 35,
                doctor: 'Rajesh Kumar',
                date: '2025-01-18',
                medications: [
                    { name: 'Paracetamol 500mg', dosage: '1 tablet 3 times daily', quantity: 15 },
                    { name: 'Cetirizine 10mg', dosage: '1 tablet at night', quantity: 10 }
                ],
                diagnosis: 'Viral Fever',
                status: 'pending',
                urgent: false
            },
            {
                id: 'PRES002',
                patientName: 'Priya Patel',
                patientAge: 28,
                doctor: 'Sunita Gupta',
                date: '2025-01-18',
                medications: [
                    { name: 'Azithromycin 500mg', dosage: '1 tablet daily', quantity: 3 },
                    { name: 'Paracetamol 500mg', dosage: '1 tablet SOS', quantity: 10 }
                ],
                diagnosis: 'Respiratory Infection',
                status: 'pending',
                urgent: true
            },
            {
                id: 'PRES003',
                patientName: 'Amit Singh',
                patientAge: 55,
                doctor: 'Vikram Verma',
                date: '2025-01-17',
                medications: [
                    { name: 'Metformin 500mg', dosage: '1 tablet twice daily', quantity: 60 },
                    { name: 'Amlodipine 5mg', dosage: '1 tablet daily', quantity: 30 }
                ],
                diagnosis: 'Diabetes Type 2, Hypertension',
                status: 'processing',
                urgent: false
            },
            {
                id: 'PRES004',
                patientName: 'Neha Gupta',
                patientAge: 42,
                doctor: 'Rajesh Kumar',
                date: '2025-01-17',
                medications: [
                    { name: 'Omeprazole 20mg', dosage: '1 capsule before breakfast', quantity: 30 }
                ],
                diagnosis: 'GERD',
                status: 'ready',
                urgent: false
            },
            {
                id: 'PRES005',
                patientName: 'Suresh Reddy',
                patientAge: 60,
                doctor: 'Amit Verma',
                date: '2025-01-16',
                medications: [
                    { name: 'Amlodipine 5mg', dosage: '1 tablet daily', quantity: 30 },
                    { name: 'Vitamin D3 1000IU', dosage: '1 capsule daily', quantity: 60 }
                ],
                diagnosis: 'Hypertension, Vitamin D Deficiency',
                status: 'dispensed',
                urgent: false
            }
        ];
    }
    return prescriptionsData;
}

// Load prescriptions
function loadPrescriptions() {
    const prescriptions = getPrescriptionsData();
    const prescriptionsEl = document.getElementById('prescriptionsQueue');
    
    prescriptionsEl.innerHTML = prescriptions.map(pres => `
        <div class="prescription-queue-card ${pres.urgent ? 'urgent' : ''}">
            <div class="header">
                <div class="patient-info">
                    <h4>${pres.patientName} (${pres.patientAge} yrs)</h4>
                    <p>ID: ${pres.id} | Dr. ${pres.doctor} | ${pres.date}</p>
                    <p><strong>Diagnosis:</strong> ${pres.diagnosis}</p>
                </div>
                <span class="status-badge ${pres.status}">${pres.status}</span>
            </div>
            <div class="medications">
                <h5>Medications:</h5>
                <ul>
                    ${pres.medications.map(med => `
                        <li>${med.name} - ${med.dosage} (Qty: ${med.quantity})</li>
                    `).join('')}
                </ul>
            </div>
            <div class="actions">
                ${pres.status === 'pending' ? `
                    <button class="dispense-btn" onclick="startProcessing('${pres.id}')">
                        <i class="fas fa-play"></i> Start Processing
                    </button>
                ` : pres.status === 'processing' ? `
                    <button class="dispense-btn" onclick="markReady('${pres.id}')">
                        <i class="fas fa-check"></i> Mark Ready
                    </button>
                ` : pres.status === 'ready' ? `
                    <button class="dispense-btn" onclick="openDispenseModal('${pres.id}')">
                        <i class="fas fa-hand-holding-medical"></i> Dispense
                    </button>
                ` : ''}
                ${pres.status !== 'dispensed' ? `
                    <button class="reject-btn" onclick="rejectPrescription('${pres.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Update stats
    document.getElementById('pendingPrescriptions').textContent = prescriptions.filter(p => p.status === 'pending' || p.status === 'processing').length;
}

// Filter prescriptions
function filterPrescriptions() {
    const filter = document.getElementById('prescriptionFilter').value;
    const prescriptions = getPrescriptionsData();
    const filtered = filter === 'all' ? prescriptions : prescriptions.filter(p => p.status === filter);
    
    const prescriptionsEl = document.getElementById('prescriptionsQueue');
    prescriptionsEl.innerHTML = filtered.map(pres => `
        <div class="prescription-queue-card ${pres.urgent ? 'urgent' : ''}">
            <div class="header">
                <div class="patient-info">
                    <h4>${pres.patientName} (${pres.patientAge} yrs)</h4>
                    <p>ID: ${pres.id} | Dr. ${pres.doctor} | ${pres.date}</p>
                    <p><strong>Diagnosis:</strong> ${pres.diagnosis}</p>
                </div>
                <span class="status-badge ${pres.status}">${pres.status}</span>
            </div>
            <div class="medications">
                <h5>Medications:</h5>
                <ul>
                    ${pres.medications.map(med => `
                        <li>${med.name} - ${med.dosage} (Qty: ${med.quantity})</li>
                    `).join('')}
                </ul>
            </div>
            <div class="actions">
                ${pres.status === 'pending' ? `
                    <button class="dispense-btn" onclick="startProcessing('${pres.id}')">
                        <i class="fas fa-play"></i> Start Processing
                    </button>
                ` : pres.status === 'processing' ? `
                    <button class="dispense-btn" onclick="markReady('${pres.id}')">
                        <i class="fas fa-check"></i> Mark Ready
                    </button>
                ` : pres.status === 'ready' ? `
                    <button class="dispense-btn" onclick="openDispenseModal('${pres.id}')">
                        <i class="fas fa-hand-holding-medical"></i> Dispense
                    </button>
                ` : ''}
                ${pres.status !== 'dispensed' ? `
                    <button class="reject-btn" onclick="rejectPrescription('${pres.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Start processing prescription
function startProcessing(prescriptionId) {
    const pres = prescriptionsData.find(p => p.id === prescriptionId);
    if (pres) {
        pres.status = 'processing';
        loadPrescriptions();
        loadRecentPrescriptions();
        alert(`Prescription ${prescriptionId} is now being processed`);
    }
}

// Mark prescription as ready
function markReady(prescriptionId) {
    const pres = prescriptionsData.find(p => p.id === prescriptionId);
    if (pres) {
        pres.status = 'ready';
        loadPrescriptions();
        loadRecentPrescriptions();
        alert(`Prescription ${prescriptionId} is ready for pickup`);
    }
}

// Open dispense modal
function openDispenseModal(prescriptionId) {
    currentPrescription = prescriptionsData.find(p => p.id === prescriptionId);
    if (currentPrescription) {
        const detailsEl = document.getElementById('dispenseDetails');
        detailsEl.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4>Patient: ${currentPrescription.patientName}</h4>
                <p style="color: var(--text-light);">Prescription ID: ${currentPrescription.id}</p>
            </div>
            <div style="background: var(--bg-light); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h5 style="margin-bottom: 10px; color: var(--primary-color);">Medications to Dispense:</h5>
                ${currentPrescription.medications.map(med => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E0E0E0;">
                        <span>${med.name}</span>
                        <span>Qty: ${med.quantity}</span>
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('dispenseModal').classList.add('active');
    }
}

// Close dispense modal
function closeDispenseModal() {
    document.getElementById('dispenseModal').classList.remove('active');
    currentPrescription = null;
}

// Confirm dispense
function confirmDispense() {
    if (currentPrescription) {
        currentPrescription.status = 'dispensed';
        
        const dispensedRecord = {
            id: 'DISP' + Date.now(),
            prescriptionId: currentPrescription.id,
            patientName: currentPrescription.patientName,
            medications: currentPrescription.medications,
            type: 'prescription',
            dispensedBy: JSON.parse(localStorage.getItem('currentUser')).name,
            dateTime: new Date().toISOString(),
            notes: document.getElementById('dispenseNotes').value
        };
        
        dispensedData.push(dispensedRecord);
        
        // Update inventory
        currentPrescription.medications.forEach(med => {
            const invItem = inventoryData.find(i => i.name === med.name);
            if (invItem) {
                invItem.stock -= med.quantity;
            }
        });
        
        closeDispenseModal();
        loadPrescriptions();
        loadRecentPrescriptions();
        loadInventory();
        loadDispensedRecords();
        
        alert(`Prescription ${currentPrescription.id} has been dispensed successfully!`);
        
        // Update stats
        document.getElementById('dispensedToday').textContent = dispensedData.filter(d => 
            new Date(d.dateTime).toDateString() === new Date().toDateString()
        ).length;
    }
}

// Reject prescription
function rejectPrescription(prescriptionId) {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
        prescriptionsData = prescriptionsData.filter(p => p.id !== prescriptionId);
        loadPrescriptions();
        loadRecentPrescriptions();
        alert(`Prescription ${prescriptionId} has been rejected.\nReason: ${reason}`);
    }
}

// Load orders
function loadOrders() {
    ordersData = [
        { id: 'ORD001', patient: 'Rahul Sharma', items: 3, total: 450, date: '2025-01-18', status: 'pending' },
        { id: 'ORD002', patient: 'Priya Patel', items: 2, total: 280, date: '2025-01-18', status: 'processing' },
        { id: 'ORD003', patient: 'Amit Singh', items: 5, total: 850, date: '2025-01-17', status: 'shipped' },
        { id: 'ORD004', patient: 'Neha Gupta', items: 1, total: 120, date: '2025-01-17', status: 'delivered' },
        { id: 'ORD005', patient: 'Suresh Reddy', items: 4, total: 560, date: '2025-01-16', status: 'delivered' }
    ];
    
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = ordersData.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.patient}</td>
            <td>${order.items} items</td>
            <td>₹${order.total}</td>
            <td>${order.date}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                ${order.status === 'pending' ? `
                    <button class="action-btn" onclick="processOrder('${order.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                ` : order.status === 'processing' ? `
                    <button class="action-btn" onclick="shipOrder('${order.id}')">
                        <i class="fas fa-truck"></i>
                    </button>
                ` : order.status === 'shipped' ? `
                    <button class="action-btn" onclick="deliverOrder('${order.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="action-btn" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('pendingOrders').textContent = ordersData.filter(o => o.status === 'pending' || o.status === 'processing').length;
}

// Filter orders
function filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    const filtered = filter === 'all' ? ordersData : ordersData.filter(o => o.status === filter);
    
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = filtered.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.patient}</td>
            <td>${order.items} items</td>
            <td>₹${order.total}</td>
            <td>${order.date}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                ${order.status === 'pending' ? `
                    <button class="action-btn" onclick="processOrder('${order.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                ` : order.status === 'processing' ? `
                    <button class="action-btn" onclick="shipOrder('${order.id}')">
                        <i class="fas fa-truck"></i>
                    </button>
                ` : order.status === 'shipped' ? `
                    <button class="action-btn" onclick="deliverOrder('${order.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="action-btn" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Process order
function processOrder(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        order.status = 'processing';
        loadOrders();
        alert(`Order ${orderId} is now being processed`);
    }
}

// Ship order
function shipOrder(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        order.status = 'shipped';
        loadOrders();
        alert(`Order ${orderId} has been shipped`);
    }
}

// Deliver order
function deliverOrder(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        order.status = 'delivered';
        loadOrders();
        alert(`Order ${orderId} has been delivered`);
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nID: ${order.id}\nPatient: ${order.patient}\nItems: ${order.items}\nTotal: ₹${order.total}\nDate: ${order.date}\nStatus: ${order.status}`);
    }
}

// Load inventory
function loadInventory() {
    if (inventoryData.length === 0) {
        inventoryData = [
            { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 500, price: 4.5, expiry: '2026-06-15', status: 'in-stock' },
            { id: 2, name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 250, price: 6.5, expiry: '2026-03-20', status: 'in-stock' },
            { id: 3, name: 'Azithromycin 500mg', category: 'Antibiotics', stock: 45, price: 35, expiry: '2025-08-10', status: 'low-stock' },
            { id: 4, name: 'Metformin 500mg', category: 'Diabetes', stock: 300, price: 8, expiry: '2026-12-01', status: 'in-stock' },
            { id: 5, name: 'Amlodipine 5mg', category: 'Cardiac', stock: 20, price: 12, expiry: '2025-04-15', status: 'low-stock' },
            { id: 6, name: 'Cetirizine 10mg', category: 'Cold & Flu', stock: 400, price: 3.5, expiry: '2026-09-30', status: 'in-stock' },
            { id: 7, name: 'Vitamin D3 1000IU', category: 'Vitamins', stock: 150, price: 4.7, expiry: '2025-02-28', status: 'expiring' },
            { id: 8, name: 'Omeprazole 20mg', category: 'Gastric', stock: 30, price: 15, expiry: '2025-11-15', status: 'low-stock' }
        ];
    }
    
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = inventoryData.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>₹${item.price}</td>
            <td>${item.expiry}</td>
            <td><span class="status-badge ${item.status}">${item.status.replace('-', ' ')}</span></td>
            <td>
                <button class="action-btn" onclick="updateStock(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn danger" onclick="deleteStock(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Update stats
    document.getElementById('lowStock').textContent = inventoryData.filter(i => i.status === 'low-stock').length;
    document.getElementById('lowStockCount').textContent = `${inventoryData.filter(i => i.status === 'low-stock').length} items need reordering`;
    document.getElementById('expiringCount').textContent = `${inventoryData.filter(i => i.status === 'expiring').length} items expiring soon`;
}

// Show add medicine modal
function showAddMedicineModal() {
    document.getElementById('addStockModal').classList.add('active');
}

// Close add stock modal
function closeAddStockModal() {
    document.getElementById('addStockModal').classList.remove('active');
    document.getElementById('addStockForm').reset();
}

// Add stock
function addStock(event) {
    event.preventDefault();
    
    const newItem = {
        id: inventoryData.length + 1,
        name: document.getElementById('stockMedicineName').value,
        category: document.getElementById('stockCategory').value,
        stock: parseInt(document.getElementById('stockQuantity').value),
        price: parseFloat(document.getElementById('stockPrice').value),
        expiry: document.getElementById('stockExpiry').value,
        batch: document.getElementById('stockBatch').value,
        status: 'in-stock'
    };
    
    // Check if medicine already exists
    const existing = inventoryData.find(i => i.name.toLowerCase() === newItem.name.toLowerCase());
    if (existing) {
        existing.stock += newItem.stock;
        alert(`Stock updated! ${existing.name} now has ${existing.stock} units.`);
    } else {
        inventoryData.push(newItem);
        alert(`New medicine added to inventory: ${newItem.name}`);
    }
    
    closeAddStockModal();
    loadInventory();
}

// Update stock
function updateStock(itemId) {
    const item = inventoryData.find(i => i.id === itemId);
    if (item) {
        const newStock = prompt(`Enter new stock quantity for ${item.name}:`, item.stock);
        if (newStock !== null && !isNaN(newStock)) {
            item.stock = parseInt(newStock);
            item.status = item.stock <= 50 ? 'low-stock' : 'in-stock';
            loadInventory();
            alert('Stock updated successfully!');
        }
    }
}

// Delete stock
function deleteStock(itemId) {
    if (confirm('Are you sure you want to remove this item from inventory?')) {
        inventoryData = inventoryData.filter(i => i.id !== itemId);
        loadInventory();
        alert('Item removed from inventory');
    }
}

// Load dispensed records
function loadDispensedRecords() {
    if (dispensedData.length === 0) {
        dispensedData = [
            { id: 'DISP001', prescriptionId: 'PRES005', patientName: 'Suresh Reddy', medications: [{name: 'Amlodipine 5mg'}, {name: 'Vitamin D3'}], type: 'prescription', dispensedBy: 'Pharmacist', dateTime: '2025-01-18T10:30:00' },
            { id: 'DISP002', prescriptionId: null, patientName: 'Walk-in Customer', medications: [{name: 'Paracetamol 500mg'}], type: 'order', dispensedBy: 'Pharmacist', dateTime: '2025-01-18T11:15:00' }
        ];
    }
    
    const tableBody = document.getElementById('dispensedTableBody');
    tableBody.innerHTML = dispensedData.map(record => `
        <tr>
            <td>${record.id}</td>
            <td>${record.patientName}</td>
            <td>${record.medications.map(m => m.name).join(', ')}</td>
            <td><span class="status-badge ${record.type}">${record.type}</span></td>
            <td>${record.dispensedBy}</td>
            <td>${new Date(record.dateTime).toLocaleString()}</td>
        </tr>
    `).join('');

    document.getElementById('dispensedToday').textContent = dispensedData.filter(d => 
        new Date(d.dateTime).toDateString() === new Date().toDateString()
    ).length;
}

// Filter dispensed records
function filterDispensed() {
    const dateFilter = document.getElementById('dispensedDateFilter').value;
    const typeFilter = document.getElementById('dispensedTypeFilter').value;
    
    let filtered = [...dispensedData];
    
    if (dateFilter) {
        filtered = filtered.filter(d => d.dateTime.includes(dateFilter));
    }
    
    if (typeFilter !== 'all') {
        filtered = filtered.filter(d => d.type === typeFilter);
    }
    
    const tableBody = document.getElementById('dispensedTableBody');
    tableBody.innerHTML = filtered.map(record => `
        <tr>
            <td>${record.id}</td>
            <td>${record.patientName}</td>
            <td>${record.medications.map(m => m.name).join(', ')}</td>
            <td><span class="status-badge ${record.type}">${record.type}</span></td>
            <td>${record.dispensedBy}</td>
            <td>${new Date(record.dateTime).toLocaleString()}</td>
        </tr>
    `).join('');
}

// Load medicine info
function loadMedicineInfo() {
    const gridEl = document.getElementById('medicineInfoGrid');
    gridEl.innerHTML = medicineDatabase.map(med => `
        <div class="medicine-info-card">
            <div class="header">
                <h4>${med.name}</h4>
                <p>${med.category}</p>
            </div>
            <div class="details">
                <div class="detail-row">
                    <span class="label">Uses</span>
                    <span class="value">${med.uses}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Dosage</span>
                    <span class="value">${med.dosage}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Side Effects</span>
                    <span class="value">${med.sideEffects}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Storage</span>
                    <span class="value">${med.storage}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Search medicine
function searchMedicine() {
    const query = document.getElementById('medicineSearch').value.toLowerCase();
    const filtered = medicineDatabase.filter(med => 
        med.name.toLowerCase().includes(query) || 
        med.category.toLowerCase().includes(query) ||
        med.uses.toLowerCase().includes(query)
    );
    
    const gridEl = document.getElementById('medicineInfoGrid');
    gridEl.innerHTML = filtered.map(med => `
        <div class="medicine-info-card">
            <div class="header">
                <h4>${med.name}</h4>
                <p>${med.category}</p>
            </div>
            <div class="details">
                <div class="detail-row">
                    <span class="label">Uses</span>
                    <span class="value">${med.uses}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Dosage</span>
                    <span class="value">${med.dosage}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Side Effects</span>
                    <span class="value">${med.sideEffects}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Storage</span>
                    <span class="value">${med.storage}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    currentUser.name = document.getElementById('profileFullName').value;
    currentUser.email = document.getElementById('profileEmailInput').value;
    currentUser.license = document.getElementById('profileLicense').value;
    currentUser.phone = document.getElementById('profilePhone').value;
    currentUser.pharmacy = document.getElementById('profilePharmacy').value;
    currentUser.experience = document.getElementById('profileExperience').value;
    currentUser.specialization = document.getElementById('profileSpecialization').value;
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('pharmacistName').textContent = currentUser.name;
    document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    alert('Profile updated successfully!');
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}
