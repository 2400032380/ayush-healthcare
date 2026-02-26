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

// Get prescriptions data from shared storage
function getPrescriptionsData() {
    // Load from shared storage (prescriptions created by doctors)
    let sharedPrescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
    
    // Map to pharmacist format and combine with any existing prescriptions
    const mappedPrescriptions = sharedPrescriptions.map(pres => ({
        id: pres.id,
        patientName: pres.patient || pres.patientName,
        patientAge: pres.patientAge || 'N/A',
        patientEmail: pres.patientEmail,
        patientPhone: pres.patientPhone,
        doctor: pres.doctor ? pres.doctor.replace('Dr. ', '') : 'Unknown',
        date: pres.date,
        medications: pres.medications.map(med => ({
            name: med.name,
            dosage: med.dosage,
            quantity: med.quantity || 10
        })),
        diagnosis: pres.diagnosis ? pres.diagnosis.split('\n')[0] : 'Consultation',
        status: pres.status || 'pending',
        urgent: pres.urgent || false,
        appointmentId: pres.appointmentId,
        notes: pres.notes
    }));
    
    // If no shared prescriptions, use sample data
    if (mappedPrescriptions.length === 0) {
        return [
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
    return mappedPrescriptions;
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

// Start processing prescription - Updates shared storage
function startProcessing(prescriptionId) {
    // Update shared storage
    let sharedPrescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
    sharedPrescriptions = sharedPrescriptions.map(p => {
        if (p.id === prescriptionId) {
            p.status = 'processing';
        }
        return p;
    });
    localStorage.setItem('ayushPrescriptions', JSON.stringify(sharedPrescriptions));
    
    loadPrescriptions();
    loadRecentPrescriptions();
    showPharmacistToast(`Prescription ${prescriptionId} is now being processed`, 'info');
}

// Mark prescription as ready - Updates shared storage
function markReady(prescriptionId) {
    // Update shared storage
    let sharedPrescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
    sharedPrescriptions = sharedPrescriptions.map(p => {
        if (p.id === prescriptionId) {
            p.status = 'ready';
        }
        return p;
    });
    localStorage.setItem('ayushPrescriptions', JSON.stringify(sharedPrescriptions));
    
    loadPrescriptions();
    loadRecentPrescriptions();
    showPharmacistToast(`Prescription ${prescriptionId} is ready for pickup! Patient notified.`, 'success');
}

// Open dispense modal
function openDispenseModal(prescriptionId) {
    const prescriptions = getPrescriptionsData();
    currentPrescription = prescriptions.find(p => p.id === prescriptionId);
    if (currentPrescription) {
        const detailsEl = document.getElementById('dispenseDetails');
        detailsEl.innerHTML = `
            <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <h4>${currentPrescription.patientName}</h4>
                    <p style="color: var(--text-light);">Prescription ID: ${currentPrescription.id}</p>
                    ${currentPrescription.patientPhone ? `<p style="color: #3B82F6; font-size: 13px;"><i class="fas fa-phone"></i> ${currentPrescription.patientPhone}</p>` : ''}
                </div>
            </div>
            <div style="background: #FFF7ED; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: #EA580C;"><i class="fas fa-stethoscope"></i> Diagnosis:</strong>
                <span style="color: #0F172A;">${currentPrescription.diagnosis}</span>
            </div>
            <div style="background: var(--bg-light); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h5 style="margin-bottom: 10px; color: var(--primary-color);"><i class="fas fa-pills"></i> Medications to Dispense:</h5>
                ${currentPrescription.medications.map(med => `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E0E0E0;">
                        <div>
                            <strong>${med.name}</strong>
                            <p style="font-size: 12px; color: #64748B;">${med.dosage}</p>
                        </div>
                        <span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px;">Qty: ${med.quantity}</span>
                    </div>
                `).join('')}
            </div>
            ${currentPrescription.notes ? `
            <div style="background: #F0FDF4; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: #16A34A;"><i class="fas fa-sticky-note"></i> Doctor's Notes:</strong>
                <span style="color: #0F172A;">${currentPrescription.notes}</span>
            </div>
            ` : ''}
        `;
        document.getElementById('dispenseModal').classList.add('active');
    }
}

// Close dispense modal
function closeDispenseModal() {
    document.getElementById('dispenseModal').classList.remove('active');
    currentPrescription = null;
}

// Confirm dispense - Updates shared storage
function confirmDispense() {
    if (currentPrescription) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Update shared prescription storage
        let sharedPrescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
        sharedPrescriptions = sharedPrescriptions.map(p => {
            if (p.id === currentPrescription.id) {
                p.status = 'dispensed';
                p.dispensedAt = new Date().toISOString();
                p.dispensedBy = currentUser.name;
            }
            return p;
        });
        localStorage.setItem('ayushPrescriptions', JSON.stringify(sharedPrescriptions));
        
        // Create dispensed record
        const dispensedRecord = {
            id: 'DISP' + Date.now(),
            prescriptionId: currentPrescription.id,
            patientName: currentPrescription.patientName,
            patientEmail: currentPrescription.patientEmail,
            patientPhone: currentPrescription.patientPhone,
            medications: currentPrescription.medications,
            type: 'prescription',
            dispensedBy: currentUser.name,
            dateTime: new Date().toISOString(),
            notes: document.getElementById('dispenseNotes').value
        };
        
        // Save to dispensed records
        let dispensedRecords = JSON.parse(localStorage.getItem('ayushDispensedRecords')) || [];
        dispensedRecords.push(dispensedRecord);
        localStorage.setItem('ayushDispensedRecords', JSON.stringify(dispensedRecords));
        
        // Also update any related orders
        let orders = JSON.parse(localStorage.getItem('ayushOrders')) || [];
        orders = orders.map(order => {
            if (order.prescriptionId === currentPrescription.id) {
                order.status = 'delivered';
                order.deliveredAt = new Date().toISOString();
            }
            return order;
        });
        localStorage.setItem('ayushOrders', JSON.stringify(orders));
        
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
        loadOrders();
        
        showPharmacistToast(`Prescription ${currentPrescription.id} dispensed to ${currentPrescription.patientName}!`, 'success');
        
        // Update stats
        const dispensedRecordsAll = JSON.parse(localStorage.getItem('ayushDispensedRecords')) || [];
        document.getElementById('dispensedToday').textContent = dispensedRecordsAll.filter(d => 
            new Date(d.dateTime).toDateString() === new Date().toDateString()
        ).length;
    }
}

// Toast notification for pharmacist
function showPharmacistToast(message, type = 'success') {
    const existingToast = document.querySelector('.pharmacist-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'pharmacist-toast';
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                     type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                     type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                     'linear-gradient(135deg, #3b82f6, #2563eb)'};
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Reject prescription - Updates shared storage
function rejectPrescription(prescriptionId) {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
        // Update shared storage
        let sharedPrescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
        sharedPrescriptions = sharedPrescriptions.map(p => {
            if (p.id === prescriptionId) {
                p.status = 'rejected';
                p.rejectedAt = new Date().toISOString();
                p.rejectionReason = reason;
            }
            return p;
        });
        localStorage.setItem('ayushPrescriptions', JSON.stringify(sharedPrescriptions));
        
        loadPrescriptions();
        loadRecentPrescriptions();
        showPharmacistToast(`Prescription ${prescriptionId} rejected. Patient notified.`, 'warning');
    }
}

// Load orders from shared storage
function loadOrders() {
    // Load from shared storage
    let sharedOrders = JSON.parse(localStorage.getItem('ayushOrders')) || [];
    
    // Add sample data if empty
    if (sharedOrders.length === 0) {
        sharedOrders = [
            { id: 'ORD001', patientName: 'Rahul Sharma', items: 3, total: 450, date: '2025-02-20', status: 'pending' },
            { id: 'ORD002', patientName: 'Priya Patel', items: 2, total: 280, date: '2025-02-20', status: 'processing' },
            { id: 'ORD003', patientName: 'Amit Singh', items: 5, total: 850, date: '2025-02-19', status: 'shipped' },
            { id: 'ORD004', patientName: 'Neha Gupta', items: 1, total: 120, date: '2025-02-19', status: 'delivered' }
        ];
    }
    
    ordersData = sharedOrders.map(order => ({
        id: order.id,
        patient: order.patientName || order.patient,
        patientEmail: order.patientEmail,
        patientPhone: order.patientPhone,
        items: order.medications ? order.medications.length : (order.items || 0),
        medications: order.medications,
        total: order.total,
        date: order.date,
        status: order.status,
        prescriptionId: order.prescriptionId,
        doctor: order.doctor
    }));
    
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = ordersData.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>
                <div>
                    <strong>${order.patient}</strong>
                    ${order.patientPhone ? `<br><small style="color: #64748B;"><i class="fas fa-phone"></i> ${order.patientPhone}</small>` : ''}
                </div>
            </td>
            <td>${typeof order.items === 'number' ? order.items : order.items} items</td>
            <td style="font-weight: 600; color: #10B981;">₹${order.total}</td>
            <td>${order.date}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                ${order.status === 'pending' ? `
                    <button class="action-btn" onclick="processOrder('${order.id}')" title="Confirm Order">
                        <i class="fas fa-check"></i>
                    </button>
                ` : order.status === 'confirmed' || order.status === 'processing' ? `
                    <button class="action-btn" onclick="shipOrder('${order.id}')" title="Ship Order">
                        <i class="fas fa-truck"></i>
                    </button>
                ` : order.status === 'shipped' ? `
                    <button class="action-btn" onclick="deliverOrder('${order.id}')" title="Mark Delivered">
                        <i class="fas fa-check-double"></i>
                    </button>
                ` : ''}
                <button class="action-btn" onclick="viewOrderDetails('${order.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('pendingOrders').textContent = ordersData.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'confirmed').length;
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

// Process order - Updates shared storage
function processOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('ayushOrders')) || [];
    orders = orders.map(o => {
        if (o.id === orderId) {
            o.status = 'confirmed';
            o.confirmedAt = new Date().toISOString();
        }
        return o;
    });
    localStorage.setItem('ayushOrders', JSON.stringify(orders));
    
    // Also update prescription status
    const order = orders.find(o => o.id === orderId);
    if (order && order.prescriptionId) {
        let prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
        prescriptions = prescriptions.map(p => {
            if (p.id === order.prescriptionId) {
                p.orderStatus = 'confirmed';
            }
            return p;
        });
        localStorage.setItem('ayushPrescriptions', JSON.stringify(prescriptions));
    }
    
    loadOrders();
    showPharmacistToast(`Order ${orderId} confirmed`, 'success');
}

// Ship order - Updates shared storage
function shipOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('ayushOrders')) || [];
    orders = orders.map(o => {
        if (o.id === orderId) {
            o.status = 'shipped';
            o.shippedAt = new Date().toISOString();
        }
        return o;
    });
    localStorage.setItem('ayushOrders', JSON.stringify(orders));
    
    // Also update prescription status
    const order = orders.find(o => o.id === orderId);
    if (order && order.prescriptionId) {
        let prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
        prescriptions = prescriptions.map(p => {
            if (p.id === order.prescriptionId) {
                p.orderStatus = 'shipped';
            }
            return p;
        });
        localStorage.setItem('ayushPrescriptions', JSON.stringify(prescriptions));
    }
    
    loadOrders();
    showPharmacistToast(`Order ${orderId} shipped! Patient notified.`, 'success');
}

// Deliver order - Updates shared storage
function deliverOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('ayushOrders')) || [];
    orders = orders.map(o => {
        if (o.id === orderId) {
            o.status = 'delivered';
            o.deliveredAt = new Date().toISOString();
        }
        return o;
    });
    localStorage.setItem('ayushOrders', JSON.stringify(orders));
    
    // Also update prescription status
    const order = orders.find(o => o.id === orderId);
    if (order && order.prescriptionId) {
        let prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
        prescriptions = prescriptions.map(p => {
            if (p.id === order.prescriptionId) {
                p.orderStatus = 'delivered';
                p.status = 'dispensed';
            }
            return p;
        });
        localStorage.setItem('ayushPrescriptions', JSON.stringify(prescriptions));
    }
    
    loadOrders();
    showPharmacistToast(`Order ${orderId} delivered successfully!`, 'success');
}

// View order details
function viewOrderDetails(orderId) {
    let orders = JSON.parse(localStorage.getItem('ayushOrders')) || ordersData;
    const order = orders.find(o => o.id === orderId);
    if (order) {
        let modal = document.getElementById('orderDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'orderDetailModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        const medicationsList = order.medications ? 
            order.medications.map(med => `<li>${med.name} - ${med.dosage || ''} (Qty: ${med.quantity || 1})</li>`).join('') :
            '<li>No medications data</li>';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-shopping-bag"></i> Order Details</h3>
                    <button class="close-modal" onclick="document.getElementById('orderDetailModal').classList.remove('active')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div style="background: #E0F2FE; padding: 12px; border-radius: 8px;">
                            <label style="color: #0369A1; font-size: 11px;">ORDER ID</label>
                            <p style="font-weight: 600;">${order.id}</p>
                        </div>
                        <div style="background: #FCE7F3; padding: 12px; border-radius: 8px;">
                            <label style="color: #BE185D; font-size: 11px;">STATUS</label>
                            <p style="font-weight: 600; text-transform: capitalize;">${order.status}</p>
                        </div>
                    </div>
                    
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin-bottom: 10px; color: #0F172A;"><i class="fas fa-user"></i> Patient: ${order.patientName || order.patient}</h4>
                        ${order.patientEmail ? `<p style="color: #64748B;"><i class="fas fa-envelope"></i> ${order.patientEmail}</p>` : ''}
                        ${order.patientPhone ? `<p style="color: #64748B;"><i class="fas fa-phone"></i> ${order.patientPhone}</p>` : ''}
                        ${order.doctor ? `<p style="color: #64748B;"><i class="fas fa-user-md"></i> Prescribed by: ${order.doctor}</p>` : ''}
                    </div>
                    
                    <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h5 style="color: #16A34A; margin-bottom: 10px;"><i class="fas fa-pills"></i> Medications:</h5>
                        <ul style="margin: 0; padding-left: 20px;">${medicationsList}</ul>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #FEF3C7; padding: 12px; border-radius: 8px;">
                        <span style="font-weight: 600;">Total Amount:</span>
                        <span style="font-size: 20px; font-weight: 700; color: #D97706;">₹${order.total}</span>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
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

// Load dispensed records from shared storage
function loadDispensedRecords() {
    // Load from shared storage
    let sharedDispensedRecords = JSON.parse(localStorage.getItem('ayushDispensedRecords')) || [];
    
    // If empty, use sample data
    if (sharedDispensedRecords.length === 0) {
        sharedDispensedRecords = [
            { id: 'DISP001', prescriptionId: 'PRES005', patientName: 'Suresh Reddy', medications: [{name: 'Amlodipine 5mg'}, {name: 'Vitamin D3'}], type: 'prescription', dispensedBy: 'Pharmacist', dateTime: '2025-02-20T10:30:00' },
            { id: 'DISP002', prescriptionId: null, patientName: 'Walk-in Customer', medications: [{name: 'Paracetamol 500mg'}], type: 'order', dispensedBy: 'Pharmacist', dateTime: '2025-02-20T11:15:00' }
        ];
    }
    
    dispensedData = sharedDispensedRecords;
    
    const tableBody = document.getElementById('dispensedTableBody');
    tableBody.innerHTML = dispensedData.map(record => `
        <tr>
            <td><strong>${record.id}</strong></td>
            <td>
                <strong>${record.patientName}</strong>
                ${record.patientPhone ? `<br><small style="color: #64748B;"><i class="fas fa-phone"></i> ${record.patientPhone}</small>` : ''}
            </td>
            <td>
                <div style="max-width: 200px;">
                    ${record.medications.map(m => `<span style="background: #E0F2FE; color: #0369A1; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin: 2px; display: inline-block;">${m.name}</span>`).join('')}
                </div>
            </td>
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
