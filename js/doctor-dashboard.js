// ===== Doctor Dashboard JavaScript =====

// Check if user is logged in and is doctor
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'doctor') {
        window.location.href = '../index.html';
        return;
    }
    
    // Set doctor name
    document.getElementById('doctorName').textContent = currentUser.fullName;
    document.getElementById('welcomeName').textContent = currentUser.fullName;
    document.getElementById('profileName').textContent = currentUser.fullName;
    
    // Initialize dashboard
    loadDashboardData();
    loadTodayAppointments();
    loadAllAppointments();
    loadPatients();
    loadPrescriptions();
    loadPatientRecords();
    loadPatientsFromAppointments(); // Populate prescription patient dropdown
});

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Show dashboard section
function showDashboardSection(section) {
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    event.target.closest('li').classList.add('active');
    
    document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');
}

// Load dashboard data
function loadDashboardData() {
    const appointments = getAppointmentsFromStorage();
    
    const pending = appointments.filter(a => a.status === 'Pending').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    
    // Get unique patients count
    const uniquePatients = [...new Set(appointments.map(a => a.patient))].length;
    
    document.getElementById('todayAppointments').textContent = appointments.length;
    document.getElementById('pendingAppointments').textContent = pending;
    
    // Update additional stats if they exist
    const totalPatientsEl = document.getElementById('totalPatients');
    if (totalPatientsEl) totalPatientsEl.textContent = uniquePatients;
    
    const completedEl = document.getElementById('completedAppointments');
    if (completedEl) completedEl.textContent = completed;
}

// Load today's appointments
function loadTodayAppointments() {
    const appointments = getAppointmentsFromStorage();
    
    const container = document.getElementById('todayAppointmentsList');
    if (appointments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #E8F4FD, #FFF0F5); border-radius: 20px;">
                <i class="fas fa-calendar-plus" style="font-size: 50px; color: #FF6B6B; margin-bottom: 15px;"></i>
                <h3 style="color: #1E3A5F; margin-bottom: 10px;">No Appointments Yet</h3>
                <p style="color: #5A6B7C; margin-bottom: 15px;">When patients book appointments, they will appear here.</p>
                <p style="color: #FF6B6B; font-size: 14px;"><i class="fas fa-info-circle"></i> Ask patients to book via their Patient Dashboard</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.slice(0, 4).map(apt => `
        <div class="appointment-card ${apt.status.toLowerCase()}">
            <div class="appointment-header">
                <div class="appointment-patient">
                    <img src="${apt.image || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${apt.patient}">
                    <div>
                        <h4>${apt.patient}</h4>
                        <p>${apt.reason || apt.specialty + ' Consultation'}</p>
                        ${apt.patientPhone ? `<p style="font-size: 12px; color: #666;"><i class="fas fa-phone"></i> ${apt.patientPhone}</p>` : ''}
                    </div>
                </div>
                <span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span>
            </div>
            <div class="appointment-details">
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${apt.time}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>${apt.date}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital'}"></i>
                    <span>${apt.type}</span>
                </div>
                ${apt.fee ? `<div class="detail-item"><i class="fas fa-rupee-sign"></i><span>₹${apt.fee}</span></div>` : ''}
            </div>
            <div class="appointment-actions">
                ${apt.status === 'Pending' ? `
                    <button class="accept-btn" onclick="acceptAppointment('${apt.id}')">Accept</button>
                    <button class="reject-btn" onclick="rejectAppointment('${apt.id}')">Reject</button>
                ` : apt.status === 'Confirmed' ? `
                    <button class="view-btn" onclick="viewAppointmentDetails('${apt.id}')">View Details</button>
                    <button class="prescription-btn" onclick="openPrescriptionForAppointment('${apt.id}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer;"><i class="fas fa-file-prescription"></i> Prescribe</button>
                ` : `
                    <button class="view-btn" onclick="viewAppointmentDetails('${apt.id}')">View Details</button>
                `}
            </div>
        </div>
    `).join('');
}

// Load all appointments
function loadAllAppointments() {
    const appointments = getAppointmentsFromStorage();
    
    const container = document.getElementById('appointmentsList');
    if (appointments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #E8F4FD, #FFF0F5); border-radius: 20px; grid-column: 1 / -1;">
                <i class="fas fa-user-injured" style="font-size: 60px; color: #FF6B6B; margin-bottom: 20px;"></i>
                <h3 style="color: #1E3A5F; font-size: 24px; margin-bottom: 10px;">No Patient Appointments</h3>
                <p style="color: #5A6B7C; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Patient appointment requests will appear here. When a patient books an appointment, you can accept or reject it.</p>
                <div style="background: white; padding: 20px; border-radius: 15px; max-width: 350px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <p style="color: #1E3A5F; font-weight: 600; margin-bottom: 10px;"><i class="fas fa-lightbulb" style="color: #F4B942;"></i> How it works:</p>
                    <ol style="text-align: left; color: #5A6B7C; font-size: 14px; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Patient logs into Patient Dashboard</li>
                        <li style="margin-bottom: 8px;">Patient clicks "Book Appointment"</li>
                        <li style="margin-bottom: 8px;">Patient selects doctor & time</li>
                        <li style="margin-bottom: 8px;">Appointment appears here as <span style="color: #FF6B6B;">Pending</span></li>
                        <li>You Accept/Reject the request</li>
                    </ol>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(apt => `
        <div class="appointment-card ${apt.status.toLowerCase()}">
            <div class="appointment-header">
                <div class="appointment-patient">
                    <img src="${apt.image || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${apt.patient}">
                    <div>
                        <h4>${apt.patient}</h4>
                        <p><strong>Reason:</strong> ${apt.reason || apt.specialty + ' Consultation'}</p>
                        ${apt.specialty ? `<p style="font-size: 12px; color: #888;"><i class="fas fa-stethoscope"></i> ${apt.specialty}</p>` : ''}
                        ${apt.patientEmail ? `<p style="font-size: 12px; color: #666;"><i class="fas fa-envelope"></i> ${apt.patientEmail}</p>` : ''}
                        ${apt.patientPhone ? `<p style="font-size: 12px; color: #666;"><i class="fas fa-phone"></i> ${apt.patientPhone}</p>` : ''}
                        ${apt.patientBloodGroup ? `<p style="font-size: 12px; color: #E11D48;"><i class="fas fa-tint"></i> Blood: ${apt.patientBloodGroup}</p>` : ''}
                    </div>
                </div>
                <span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span>
            </div>
            <div class="appointment-details">
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${apt.time}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>${apt.date}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital'}"></i>
                    <span>${apt.type}</span>
                </div>
                ${apt.fee ? `<div class="detail-item"><i class="fas fa-rupee-sign"></i><span>₹${apt.fee}</span></div>` : ''}
            </div>
            <div class="appointment-actions">
                ${apt.status === 'Pending' ? `
                    <button class="accept-btn" onclick="acceptAppointment('${apt.id}')">Accept</button>
                    <button class="reject-btn" onclick="rejectAppointment('${apt.id}')">Reject</button>
                ` : apt.status === 'Confirmed' ? `
                    <button class="view-btn" onclick="viewAppointmentDetails('${apt.id}')">View Details</button>
                    <button class="prescription-btn" onclick="openPrescriptionForAppointment('${apt.id}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer;"><i class="fas fa-file-prescription"></i> Write Prescription</button>
                ` : apt.status === 'Completed' ? `
                    <button class="view-btn" onclick="viewAppointmentDetails('${apt.id}')">View Details</button>
                    <button class="view-btn" onclick="viewPrescriptionForAppointment('${apt.id}')" style="background: #E0F2FE; color: #0891B2;"><i class="fas fa-file-medical"></i> View Prescription</button>
                ` : `
                    <button class="view-btn" onclick="viewAppointmentDetails('${apt.id}')">View Details</button>
                `}
            </div>
        </div>
    `).join('');
}

// Get appointments from localStorage filtered by current doctor
function getAppointmentsFromStorage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let allAppointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    
    // For demo: Show all appointments to all doctors so they can manage them
    // In production, this would filter by doctor's specific ID or exact name match
    if (allAppointments.length === 0) {
        return [];
    }
    
    // Return all appointments for doctors to see and manage
    // Filter out any invalid entries
    const validAppointments = allAppointments.filter(apt => apt && apt.patient && apt.doctor);
    
    return validAppointments;
}

// Sample appointments data (for demo purposes) - DEPRECATED, using real appointments only
function getSampleAppointments() {
    return []; // No sample data, only real patient bookings
}

// Load patients dynamically from appointments
function loadPatients() {
    const appointments = getAppointmentsFromStorage();
    
    // Get unique patients from appointments
    const patientMap = new Map();
    appointments.forEach(apt => {
        if (!patientMap.has(apt.patient)) {
            patientMap.set(apt.patient, {
                id: 'P' + (patientMap.size + 1).toString().padStart(3, '0'),
                name: apt.patient,
                email: apt.patientEmail || 'N/A',
                phone: apt.patientPhone || 'N/A',
                bloodGroup: apt.patientBloodGroup || 'N/A',
                lastVisit: apt.date,
                image: apt.image
            });
        } else {
            // Update last visit to most recent
            const existing = patientMap.get(apt.patient);
            existing.lastVisit = apt.date;
        }
    });
    
    const patients = Array.from(patientMap.values());
    
    const tbody = document.getElementById('patientsTableBody');
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #666;">No patients yet. Patients will appear here after they book appointments with you.</td></tr>';
        return;
    }
    
    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${patient.image || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${patient.name}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
                    <span>${patient.name}</span>
                </div>
            </td>
            <td>${patient.phone}</td>
            <td><span style="color: #E11D48; font-weight: 500;">${patient.bloodGroup}</span></td>
            <td>${patient.lastVisit}</td>
            <td>
                <div class="action-btns">
                    <button class="view-btn" onclick="viewPatientDetails('${patient.name}')" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="approve-btn" onclick="openPrescriptionModal('${patient.name}')" title="Write Prescription"><i class="fas fa-file-prescription"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load prescriptions from localStorage
function loadPrescriptions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allPrescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions') || '[]');
    
    // Filter prescriptions by this doctor
    const prescriptions = allPrescriptions.filter(rx => 
        rx.doctor && rx.doctor.toLowerCase() === currentUser.fullName.toLowerCase()
    );
    
    const container = document.getElementById('prescriptionsList');
    
    if (prescriptions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No prescriptions yet. Create prescriptions for your patients after consultation.</p>';
        return;
    }
    
    container.innerHTML = prescriptions.map(rx => {
        const medicines = rx.medications ? rx.medications.map(m => m.name).join(', ') : 
                         (rx.medicines ? rx.medicines.join(', ') : 'N/A');
        return `
        <div class="prescription-card">
            <div class="prescription-info">
                <div class="rx-icon">Rx</div>
                <div class="prescription-details">
                    <h4>${rx.patient} - ${rx.diagnosis ? rx.diagnosis.split('\n')[0].substring(0, 50) : 'Consultation'}</h4>
                    <p>Medicines: ${medicines}</p>
                    <p>Date: ${rx.date}</p>
                </div>
            </div>
            <div class="prescription-actions">
                <button class="view-btn" onclick="viewPrescriptionById('${rx.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="edit-btn" style="background: #FFF3E0; color: #FF9800;" onclick="printPrescription('${rx.id}')"><i class="fas fa-print"></i> Print</button>
            </div>
        </div>
    `}).join('');
}

// Load patient records
function loadPatientRecords() {
    const records = [
        { patient: 'John Doe', type: 'Lab Report', name: 'Complete Blood Count', date: '2024-01-20' },
        { patient: 'John Doe', type: 'Prescription', name: 'Viral Fever Treatment', date: '2024-01-22' },
        { patient: 'Jane Smith', type: 'Lab Report', name: 'Thyroid Profile', date: '2024-01-18' },
        { patient: 'Bob Williams', type: 'Lab Report', name: 'HbA1c Test', date: '2024-01-15' },
        { patient: 'Alice Johnson', type: 'X-Ray', name: 'Chest X-Ray', date: '2024-01-12' }
    ];
    
    const container = document.getElementById('patientRecordsList');
    container.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-info">
                <div class="icon">
                    <i class="fas fa-${record.type === 'Lab Report' ? 'flask' : record.type === 'X-Ray' ? 'x-ray' : 'file-prescription'}"></i>
                </div>
                <div class="record-details">
                    <h4>${record.name}</h4>
                    <p>${record.patient} - ${record.type}</p>
                </div>
            </div>
            <span class="record-date">${record.date}</span>
        </div>
    `).join('');
}

// Appointment actions
function acceptAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    
    appointments = appointments.map(apt => {
        if (apt.id === id || apt.id === parseInt(id)) {
            apt.status = 'Confirmed';
            apt.confirmedAt = new Date().toISOString();
        }
        return apt;
    });
    
    localStorage.setItem('ayushAppointments', JSON.stringify(appointments));
    
    // Also update patient's appointments
    let patientAppointments = JSON.parse(localStorage.getItem('patientAppointments')) || [];
    patientAppointments = patientAppointments.map(apt => {
        if (apt.id === id) {
            apt.status = 'Confirmed';
        }
        return apt;
    });
    localStorage.setItem('patientAppointments', JSON.stringify(patientAppointments));
    
    showToast('Appointment accepted! Patient has been notified.', 'success');
    loadTodayAppointments();
    loadAllAppointments();
    loadDashboardData();
}

function rejectAppointment(id) {
    if (confirm('Are you sure you want to reject this appointment?')) {
        let appointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
        
        appointments = appointments.map(apt => {
            if (apt.id === id || apt.id === parseInt(id)) {
                apt.status = 'Rejected';
                apt.rejectedAt = new Date().toISOString();
            }
            return apt;
        });
        
        localStorage.setItem('ayushAppointments', JSON.stringify(appointments));
        
        // Also update patient's appointments
        let patientAppointments = JSON.parse(localStorage.getItem('patientAppointments')) || [];
        patientAppointments = patientAppointments.map(apt => {
            if (apt.id === id) {
                apt.status = 'Rejected';
            }
            return apt;
        });
        localStorage.setItem('patientAppointments', JSON.stringify(patientAppointments));
        
        showToast('Appointment rejected. Patient has been notified.', 'warning');
        loadTodayAppointments();
        loadAllAppointments();
        loadDashboardData();
    }
}

function viewPatient(name) {
    showToast(`Viewing ${name}'s details...`);
}

function viewLabRecords(name) {
    showToast(`Viewing ${name}'s lab records...`);
}

// Prescription functions
function openPrescriptionModal(patientName) {
    document.getElementById('prescriptionModal').classList.add('active');
    if (patientName) {
        document.getElementById('prescriptionPatient').value = patientName;
    }
}

function closePrescriptionModal() {
    document.getElementById('prescriptionModal').classList.remove('active');
}

function addMedication() {
    const container = document.getElementById('medicationsList');
    const newItem = document.createElement('div');
    newItem.className = 'medication-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Medicine name" class="med-name">
        <input type="text" placeholder="Dosage" class="med-dosage">
        <input type="text" placeholder="Duration" class="med-duration">
        <input type="number" placeholder="Qty" class="med-quantity" value="10" min="1" style="width: 80px;">
        <button type="button" class="remove-med-btn" onclick="this.parentElement.remove()" style="background: #EF4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;"><i class="fas fa-times"></i></button>
    `       
    container.appendChild(newItem);
}

function createPrescription(event) {
    event.preventDefault();
    
    const patient = document.getElementById('prescriptionPatient').value;
    const diagnosis = document.getElementById('prescriptionDiagnosis').value;
    const notes = document.getElementById('prescriptionNotes').value;
    
    // Collect medications with quantity
    const medications = [];
    document.querySelectorAll('.medication-item').forEach(item => {
        const name = item.querySelector('.med-name').value;
        const dosage = item.querySelector('.med-dosage').value;
        const duration = item.querySelector('.med-duration').value;
        const quantity = item.querySelector('.med-quantity') ? parseInt(item.querySelector('.med-quantity').value) || 10 : 10;
        if (name) {
            medications.push({ name, dosage, duration, quantity });
        }
    });
    
    if (medications.length === 0) {
        showToast('Please add at least one medication');
        return;
    }
    
    // Get current appointment if exists
    const currentAppointment = window.currentPrescriptionAppointment;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get patient details from appointment or localStorage
    let patientEmail = '';
    let patientPhone = '';
    let patientAge = '';
    let patientBloodGroup = '';
    
    if (currentAppointment) {
        patientEmail = currentAppointment.patientEmail || '';
        patientPhone = currentAppointment.patientPhone || '';
        patientAge = currentAppointment.patientAge || '';
        patientBloodGroup = currentAppointment.patientBloodGroup || '';
    }
    
    // Save prescription with full details for pharmacist
    const prescription = {
        id: 'RX' + Date.now(),
        appointmentId: currentAppointment ? currentAppointment.id : null,
        patient,
        patientName: patient,
        patientEmail,
        patientPhone,
        patientAge,
        patientBloodGroup,
        diagnosis,
        medications,
        notes,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        doctor: currentUser.fullName,
        doctorId: currentUser.email,
        // Status for pharmacist workflow
        status: 'pending', // pending, processing, ready, dispensed
        urgent: false,
        // For order tracking
        orderId: null,
        orderStatus: null
    };
    
    let prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions') || '[]');
    prescriptions.push(prescription);
    localStorage.setItem('ayushPrescriptions', JSON.stringify(prescriptions));
    
    // Mark appointment as completed if linked
    if (currentAppointment) {
        let allAppointments = JSON.parse(localStorage.getItem('ayushAppointments') || '[]');
        allAppointments = allAppointments.map(apt => {
            if (apt.id === currentAppointment.id) {
                apt.status = 'Completed';
                apt.completedAt = new Date().toISOString();
                apt.prescriptionId = prescription.id;
            }
            return apt;
        });
        localStorage.setItem('ayushAppointments', JSON.stringify(allAppointments));
        
        // Also update patient's view
        let patientAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        patientAppointments = patientAppointments.map(apt => {
            if (apt.id === currentAppointment.id) {
                apt.status = 'Completed';
                apt.prescriptionId = prescription.id;
            }
            return apt;
        });
        localStorage.setItem('patientAppointments', JSON.stringify(patientAppointments));
    }
    
    // Clean up
    window.currentPrescriptionAppointment = null;
    
    // Re-enable patient dropdown
    const patientSelect = document.getElementById('prescriptionPatient');
    patientSelect.disabled = false;
    loadPatientsFromAppointments();
    
    closePrescriptionModal();
    showToast('Prescription created successfully! Sent to pharmacy for processing.');
    loadPrescriptions();
    loadTodayAppointments();
    loadAllAppointments();
    loadDashboardData();
}

// Consultation
function startConsultation() {
    showToast('Starting video consultation...');
    // In a real app, this would open a video call interface
}

// Schedule
function editSchedule() {
    showToast('Schedule editing coming soon!');
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Toast notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// View appointment details in modal
function viewAppointmentDetails(appointmentId) {
    const allAppointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    const apt = allAppointments.find(a => a.id === appointmentId);
    
    if (!apt) {
        showToast('Appointment not found');
        return;
    }
    
    // Create and show detail modal
    let modal = document.getElementById('appointmentDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'appointmentDetailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close-btn" onclick="closeAppointmentDetailModal()">&times;</span>
            <h2><i class="fas fa-calendar-check"></i> Appointment Details</h2>
            
            <div class="appointment-detail-content">
                <div class="patient-info-section" style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #E0F2FE, #F0FDFA); border-radius: 12px;">
                    <img src="${apt.image || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${apt.patient}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #0891B2;">
                    <div>
                        <h3 style="color: #0F172A; margin-bottom: 5px;">${apt.patient}</h3>
                        ${apt.patientEmail ? `<p style="color: #64748B; font-size: 14px;"><i class="fas fa-envelope"></i> ${apt.patientEmail}</p>` : ''}
                        ${apt.patientPhone ? `<p style="color: #64748B; font-size: 14px;"><i class="fas fa-phone"></i> ${apt.patientPhone}</p>` : ''}
                        ${apt.patientBloodGroup ? `<p style="color: #E11D48; font-size: 14px;"><i class="fas fa-tint"></i> Blood Group: ${apt.patientBloodGroup}</p>` : ''}
                    </div>
                </div>
                
                <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="detail-box" style="background: #FFF7ED; padding: 15px; border-radius: 10px;">
                        <label style="color: #EA580C; font-size: 12px; font-weight: 600;">REASON</label>
                        <p style="color: #0F172A; font-weight: 500;">${apt.reason || 'Consultation'}</p>
                    </div>
                    <div class="detail-box" style="background: #F0FDF4; padding: 15px; border-radius: 10px;">
                        <label style="color: #16A34A; font-size: 12px; font-weight: 600;">SPECIALTY</label>
                        <p style="color: #0F172A; font-weight: 500;">${apt.specialty || 'General'}</p>
                    </div>
                    <div class="detail-box" style="background: #EDE9FE; padding: 15px; border-radius: 10px;">
                        <label style="color: #7C3AED; font-size: 12px; font-weight: 600;">DATE & TIME</label>
                        <p style="color: #0F172A; font-weight: 500;">${apt.date} at ${apt.time}</p>
                    </div>
                    <div class="detail-box" style="background: #FCE7F3; padding: 15px; border-radius: 10px;">
                        <label style="color: #DB2777; font-size: 12px; font-weight: 600;">CONSULTATION TYPE</label>
                        <p style="color: #0F172A; font-weight: 500;"><i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital'}"></i> ${apt.type}</p>
                    </div>
                    <div class="detail-box" style="background: #ECFDF5; padding: 15px; border-radius: 10px;">
                        <label style="color: #059669; font-size: 12px; font-weight: 600;">STATUS</label>
                        <p style="color: #0F172A; font-weight: 500;"><span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></p>
                    </div>
                    <div class="detail-box" style="background: #E0F2FE; padding: 15px; border-radius: 10px;">
                        <label style="color: #0891B2; font-size: 12px; font-weight: 600;">CONSULTATION FEE</label>
                        <p style="color: #0F172A; font-weight: 500;">₹${apt.fee || 'N/A'}</p>
                    </div>
                </div>
                
                ${apt.bookedAt ? `<p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 15px;"><i class="fas fa-clock"></i> Booked on: ${new Date(apt.bookedAt).toLocaleString()}</p>` : ''}
                
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
                    ${apt.status === 'Confirmed' ? `
                        <button onclick="openPrescriptionForAppointment('${apt.id}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;"><i class="fas fa-file-prescription"></i> Write Prescription</button>
                    ` : ''}
                    <button onclick="closeAppointmentDetailModal()" style="background: #F1F5F9; color: #64748B; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeAppointmentDetailModal() {
    const modal = document.getElementById('appointmentDetailModal');
    if (modal) modal.classList.remove('active');
}

// Open prescription modal pre-filled with appointment data
function openPrescriptionForAppointment(appointmentId) {
    const allAppointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    const apt = allAppointments.find(a => a.id === appointmentId);
    
    if (!apt) {
        showToast('Appointment not found');
        return;
    }
    
    // Store current appointment for prescription
    window.currentPrescriptionAppointment = apt;
    
    // Close detail modal if open
    closeAppointmentDetailModal();
    
    // Update patient dropdown with the current patient
    const patientSelect = document.getElementById('prescriptionPatient');
    patientSelect.innerHTML = `<option value="${apt.patient}" selected>${apt.patient}</option>`;
    patientSelect.disabled = true;
    
    // Pre-fill reason as initial diagnosis text
    document.getElementById('prescriptionDiagnosis').value = `Patient Complaint: ${apt.reason || 'Consultation'}\n\nDiagnosis: `;
    
    // Clear previous medications
    document.getElementById('medicationsList').innerHTML = `
        <div class="medication-item">
            <input type="text" placeholder="Medicine name" class="med-name">
            <input type="text" placeholder="Dosage (e.g., 1-0-1)" class="med-dosage">
            <input type="text" placeholder="Duration (e.g., 7 days)" class="med-duration">
        </div>
    `;
    
    // Clear notes
    document.getElementById('prescriptionNotes').value = '';
    
    // Open modal
    document.getElementById('prescriptionModal').classList.add('active');
}

// View prescription for completed appointment
function viewPrescriptionForAppointment(appointmentId) {
    const prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
    const prescription = prescriptions.find(p => p.appointmentId === appointmentId);
    
    if (!prescription) {
        showToast('No prescription found for this appointment');
        return;
    }
    
    // Create and show prescription view modal
    let modal = document.getElementById('prescriptionViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'prescriptionViewModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const medicationsHtml = prescription.medications && prescription.medications.length > 0 
        ? prescription.medications.map((med, i) => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: ${i % 2 === 0 ? '#F8FAFC' : '#FFF'}; border-radius: 8px; margin-bottom: 5px;">
                <span style="background: #10B981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">${i + 1}</span>
                <div style="flex: 1;">
                    <p style="font-weight: 600; color: #0F172A;">${med.name}</p>
                    <p style="font-size: 12px; color: #64748B;">${med.dosage} | ${med.duration}</p>
                </div>
            </div>
        `).join('')
        : '<p style="color: #94A3B8;">No medications prescribed</p>';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close-btn" onclick="closePrescriptionViewModal()">&times;</span>
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px dashed #E2E8F0;">
                <div style="font-size: 32px; color: #10B981; margin-bottom: 10px;">Rx</div>
                <h2 style="color: #0F172A;">E-Prescription</h2>
                <p style="color: #64748B;">ID: ${prescription.id}</p>
            </div>
            
            <div style="padding: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <div>
                        <label style="color: #94A3B8; font-size: 12px;">PATIENT</label>
                        <p style="font-weight: 600; color: #0F172A;">${prescription.patient}</p>
                    </div>
                    <div style="text-align: right;">
                        <label style="color: #94A3B8; font-size: 12px;">DATE</label>
                        <p style="font-weight: 600; color: #0F172A;">${prescription.date}</p>
                    </div>
                </div>
                
                <div style="background: #FFF7ED; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <label style="color: #EA580C; font-size: 12px; font-weight: 600;">DIAGNOSIS</label>
                    <p style="color: #0F172A; white-space: pre-wrap;">${prescription.diagnosis}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #10B981; font-size: 12px; font-weight: 600;">MEDICATIONS</label>
                    <div style="margin-top: 10px;">${medicationsHtml}</div>
                </div>
                
                ${prescription.notes ? `
                <div style="background: #F0FDF4; padding: 15px; border-radius: 10px;">
                    <label style="color: #16A34A; font-size: 12px; font-weight: 600;">ADDITIONAL NOTES</label>
                    <p style="color: #0F172A;">${prescription.notes}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #E2E8F0;">
                    <p style="color: #64748B; font-size: 14px;">Prescribed by: <strong>${prescription.doctor}</strong></p>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button onclick="printPrescription('${prescription.id}')" style="background: #0891B2; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;"><i class="fas fa-print"></i> Print</button>
                <button onclick="closePrescriptionViewModal()" style="background: #F1F5F9; color: #64748B; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closePrescriptionViewModal() {
    const modal = document.getElementById('prescriptionViewModal');
    if (modal) modal.classList.remove('active');
}

function printPrescription(prescriptionId) {
    showToast('Preparing prescription for print...');
    window.print();
}

// Update loadPatients to show patients from appointments
function loadPatientsFromAppointments() {
    const appointments = getAppointmentsFromStorage();
    const uniquePatients = [...new Map(appointments.map(apt => [apt.patient, apt])).values()];
    
    // Update patient dropdown in prescription modal
    const patientSelect = document.getElementById('prescriptionPatient');
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">Choose patient</option>' + 
            uniquePatients.map(apt => `<option value="${apt.patient}">${apt.patient}</option>`).join('');
        patientSelect.disabled = false;
    }
}

// View prescription by ID
function viewPrescriptionById(prescriptionId) {
    const prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    
    if (!prescription) {
        showToast('Prescription not found');
        return;
    }
    
    // Create and show prescription view modal
    let modal = document.getElementById('prescriptionViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'prescriptionViewModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const medicationsHtml = prescription.medications && prescription.medications.length > 0 
        ? prescription.medications.map((med, i) => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: ${i % 2 === 0 ? '#F8FAFC' : '#FFF'}; border-radius: 8px; margin-bottom: 5px;">
                <span style="background: #10B981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">${i + 1}</span>
                <div style="flex: 1;">
                    <p style="font-weight: 600; color: #0F172A;">${med.name}</p>
                    <p style="font-size: 12px; color: #64748B;">${med.dosage} | ${med.duration}</p>
                </div>
            </div>
        `).join('')
        : '<p style="color: #94A3B8;">No medications prescribed</p>';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close-btn" onclick="closePrescriptionViewModal()">&times;</span>
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px dashed #E2E8F0;">
                <div style="font-size: 32px; color: #10B981; margin-bottom: 10px;">Rx</div>
                <h2 style="color: #0F172A;">E-Prescription</h2>
                <p style="color: #64748B;">ID: ${prescription.id}</p>
            </div>
            
            <div style="padding: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <div>
                        <label style="color: #94A3B8; font-size: 12px;">PATIENT</label>
                        <p style="font-weight: 600; color: #0F172A;">${prescription.patient}</p>
                    </div>
                    <div style="text-align: right;">
                        <label style="color: #94A3B8; font-size: 12px;">DATE</label>
                        <p style="font-weight: 600; color: #0F172A;">${prescription.date}</p>
                    </div>
                </div>
                
                <div style="background: #FFF7ED; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <label style="color: #EA580C; font-size: 12px; font-weight: 600;">DIAGNOSIS</label>
                    <p style="color: #0F172A; white-space: pre-wrap;">${prescription.diagnosis || 'N/A'}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #10B981; font-size: 12px; font-weight: 600;">MEDICATIONS</label>
                    <div style="margin-top: 10px;">${medicationsHtml}</div>
                </div>
                
                ${prescription.notes ? `
                <div style="background: #F0FDF4; padding: 15px; border-radius: 10px;">
                    <label style="color: #16A34A; font-size: 12px; font-weight: 600;">ADDITIONAL NOTES</label>
                    <p style="color: #0F172A;">${prescription.notes}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #E2E8F0;">
                    <p style="color: #64748B; font-size: 14px;">Prescribed by: <strong>${prescription.doctor}</strong></p>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button onclick="printPrescription('${prescription.id}')" style="background: #0891B2; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;"><i class="fas fa-print"></i> Print</button>
                <button onclick="closePrescriptionViewModal()" style="background: #F1F5F9; color: #64748B; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// View patient details
function viewPatientDetails(patientName) {
    const appointments = getAppointmentsFromStorage();
    const patientAppointments = appointments.filter(apt => apt.patient === patientName);
    
    if (patientAppointments.length === 0) {
        showToast('Patient details not found');
        return;
    }
    
    const patient = patientAppointments[0];
    const prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions') || '[]')
        .filter(p => p.patient === patientName);
    
    // Create modal
    let modal = document.getElementById('patientDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'patientDetailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const appointmentsHtml = patientAppointments.map(apt => `
        <div style="display: flex; justify-content: space-between; padding: 10px; background: #F8FAFC; border-radius: 8px; margin-bottom: 8px;">
            <div>
                <p style="font-weight: 500; color: #0F172A;">${apt.reason || 'Consultation'}</p>
                <p style="font-size: 12px; color: #64748B;">${apt.date} at ${apt.time}</p>
            </div>
            <span class="status-badge ${apt.status.toLowerCase()}" style="height: fit-content;">${apt.status}</span>
        </div>
    `).join('');
    
    const prescriptionsHtml = prescriptions.length > 0 
        ? prescriptions.map(rx => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F0FDF4; border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="viewPrescriptionById('${rx.id}')">
                <span style="color: #10B981; font-size: 20px;">Rx</span>
                <div>
                    <p style="font-weight: 500; color: #0F172A;">${rx.diagnosis ? rx.diagnosis.split('\n')[0].substring(0, 30) : 'Prescription'}</p>
                    <p style="font-size: 12px; color: #64748B;">${rx.date}</p>
                </div>
            </div>
        `).join('')
        : '<p style="color: #94A3B8; text-align: center;">No prescriptions yet</p>';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 650px;">
            <span class="close-btn" onclick="closePatientDetailModal()">&times;</span>
            <h2><i class="fas fa-user"></i> Patient Details</h2>
            
            <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #E0F2FE, #F0FDFA); border-radius: 12px;">
                <img src="${patient.image || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${patientName}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 4px solid #0891B2;">
                <div>
                    <h3 style="color: #0F172A; font-size: 22px; margin-bottom: 8px;">${patientName}</h3>
                    ${patient.patientEmail ? `<p style="color: #64748B;"><i class="fas fa-envelope"></i> ${patient.patientEmail}</p>` : ''}
                    ${patient.patientPhone ? `<p style="color: #64748B;"><i class="fas fa-phone"></i> ${patient.patientPhone}</p>` : ''}
                    ${patient.patientBloodGroup ? `<p style="color: #E11D48; font-weight: 500;"><i class="fas fa-tint"></i> Blood Group: ${patient.patientBloodGroup}</p>` : ''}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px;">
                    <h4 style="color: #7C3AED; margin-bottom: 10px;"><i class="fas fa-calendar-check"></i> Appointments (${patientAppointments.length})</h4>
                    <div style="max-height: 200px; overflow-y: auto;">${appointmentsHtml}</div>
                </div>
                <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px;">
                    <h4 style="color: #10B981; margin-bottom: 10px;"><i class="fas fa-file-prescription"></i> Prescriptions (${prescriptions.length})</h4>
                    <div style="max-height: 200px; overflow-y: auto;">${prescriptionsHtml}</div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button onclick="openPrescriptionModal('${patientName}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;"><i class="fas fa-file-prescription"></i> New Prescription</button>
                <button onclick="closePatientDetailModal()" style="background: #F1F5F9; color: #64748B; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closePatientDetailModal() {
    const modal = document.getElementById('patientDetailModal');
    if (modal) modal.classList.remove('active');
}
