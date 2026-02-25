// Patient Dashboard JavaScript

// Toast notification function
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
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
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'patient') {
        alert('Please login as a patient to access this dashboard');
        window.location.href = '../index.html';
        return;
    }

    // Load patient profile from localStorage or use currentUser
    const patientProfile = JSON.parse(localStorage.getItem('patientProfile')) || {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        dob: '',
        bloodGroup: '',
        gender: '',
        address: '',
        emergencyContact: '',
        image: getPatientImage(currentUser.name)
    };

    // Update UI with patient info
    document.getElementById('patientName').textContent = patientProfile.name;
    document.getElementById('welcomeName').textContent = patientProfile.name.split(' ')[0];
    document.getElementById('profileName').textContent = patientProfile.name;
    document.getElementById('profileEmail').textContent = patientProfile.email;
    document.getElementById('profileFullName').value = patientProfile.name;
    document.getElementById('profileEmailInput').value = patientProfile.email;
    
    // Update profile images
    if (patientProfile.image) {
        document.getElementById('headerProfileImg').src = patientProfile.image;
        document.getElementById('profileImage').src = patientProfile.image;
    }
    
    // Load additional profile fields if they exist
    if (document.getElementById('profilePhone')) {
        document.getElementById('profilePhone').value = patientProfile.phone || '';
    }
    if (document.getElementById('profileDOB')) {
        document.getElementById('profileDOB').value = patientProfile.dob || '';
    }
    if (document.getElementById('profileBloodGroup')) {
        document.getElementById('profileBloodGroup').value = patientProfile.bloodGroup || '';
    }
    if (document.getElementById('profileGender')) {
        document.getElementById('profileGender').value = patientProfile.gender || '';
    }
    if (document.getElementById('profileAddress')) {
        document.getElementById('profileAddress').value = patientProfile.address || '';
    }

    // Load dashboard data
    loadDashboardData();
});

// Professional doctor images (doctors with white coats/aprons)
const doctorImages = {
    male: [
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=200&h=200&fit=crop&crop=face'
    ],
    female: [
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=200&h=200&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&h=200&fit=crop&crop=face'
    ]
};

// Get doctor image based on name
function getDoctorImage(name) {
    const femaleNames = ['priya', 'sunita', 'meena', 'ananya', 'kavita', 'sneha', 'anjali', 'neha', 'pooja', 'ritu', 'swati', 'asha', 'rekha', 'anita', 'nisha', 'meera'];
    const isFemale = femaleNames.some(fn => name.toLowerCase().includes(fn));
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const images = isFemale ? doctorImages.female : doctorImages.male;
    const index = Math.abs(hash) % images.length;
    return images[index];
}

// Generate consistent patient image based on name
function getPatientImage(name) {
    const maleImages = [
        'https://randomuser.me/api/portraits/men/11.jpg',
        'https://randomuser.me/api/portraits/men/15.jpg',
        'https://randomuser.me/api/portraits/men/22.jpg',
        'https://randomuser.me/api/portraits/men/33.jpg',
        'https://randomuser.me/api/portraits/men/44.jpg'
    ];
    const femaleImages = [
        'https://randomuser.me/api/portraits/women/12.jpg',
        'https://randomuser.me/api/portraits/women/18.jpg',
        'https://randomuser.me/api/portraits/women/25.jpg',
        'https://randomuser.me/api/portraits/women/35.jpg',
        'https://randomuser.me/api/portraits/women/45.jpg'
    ];
    
    // Simple hash based on name to get consistent image
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 5;
    
    // Simple gender detection (can be improved)
    const femaleNames = ['priya', 'sita', 'anita', 'meera', 'kavita', 'sunita', 'neha', 'pooja', 'ritu', 'swati', 'jane', 'alice', 'carol', 'mary', 'sarah'];
    const isLikelyFemale = femaleNames.some(fn => name.toLowerCase().includes(fn));
    
    return isLikelyFemale ? femaleImages[index] : maleImages[index];
}

// Change profile photo
function changeProfilePhoto() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const newUrl = prompt('Enter new profile image URL:');
    if (newUrl && newUrl.trim()) {
        // Update profile
        let patientProfile = JSON.parse(localStorage.getItem('patientProfile')) || {};
        patientProfile.image = newUrl.trim();
        localStorage.setItem('patientProfile', JSON.stringify(patientProfile));
        
        // Update UI
        document.getElementById('headerProfileImg').src = newUrl;
        document.getElementById('profileImage').src = newUrl;
        alert('Profile photo updated!');
    }
}

// Sample data
const doctorsData = {
    'General Physician': [
        { id: 1, name: 'Dr. Rajesh Kumar', experience: '12 years', rating: 4.8, fee: 500, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face' },
        { id: 2, name: 'Dr. Priya Sharma', experience: '8 years', rating: 4.6, fee: 400, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face' }
    ],
    'Cardiology': [
        { id: 3, name: 'Dr. Amit Verma', experience: '15 years', rating: 4.9, fee: 800, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face' },
        { id: 4, name: 'Dr. Sunita Patel', experience: '10 years', rating: 4.7, fee: 700, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face' }
    ],
    'Neurology': [
        { id: 5, name: 'Dr. Vikram Singh', experience: '14 years', rating: 4.8, fee: 900, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face' }
    ],
    'Pediatrics': [
        { id: 6, name: 'Dr. Meena Gupta', experience: '11 years', rating: 4.9, fee: 600, image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face' }
    ],
    'Dermatology': [
        { id: 7, name: 'Dr. Ananya Reddy', experience: '7 years', rating: 4.5, fee: 550, image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face' }
    ],
    'Orthopedics': [
        { id: 8, name: 'Dr. Suresh Menon', experience: '16 years', rating: 4.8, fee: 750, image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face' }
    ]
};

const medicinesData = {
    'Pain Relief': [
        { id: 1, name: 'Paracetamol 500mg', type: 'Tablet', price: 45, qty: '10 tablets' },
        { id: 2, name: 'Ibuprofen 400mg', type: 'Tablet', price: 65, qty: '10 tablets' },
        { id: 3, name: 'Diclofenac Gel', type: 'Topical', price: 120, qty: '30g' }
    ],
    'Cold & Flu': [
        { id: 4, name: 'Cetirizine 10mg', type: 'Tablet', price: 35, qty: '10 tablets' },
        { id: 5, name: 'Vicks Vaporub', type: 'Ointment', price: 95, qty: '50g' },
        { id: 6, name: 'Strepsils', type: 'Lozenges', price: 55, qty: '8 lozenges' }
    ],
    'Vitamins': [
        { id: 7, name: 'Vitamin D3 1000IU', type: 'Capsule', price: 280, qty: '60 capsules' },
        { id: 8, name: 'Vitamin B Complex', type: 'Tablet', price: 150, qty: '60 tablets' },
        { id: 9, name: 'Multivitamins', type: 'Tablet', price: 320, qty: '60 tablets' }
    ],
    'Diabetes': [
        { id: 10, name: 'Metformin 500mg', type: 'Tablet', price: 85, qty: '30 tablets' },
        { id: 11, name: 'Glimepiride 2mg', type: 'Tablet', price: 120, qty: '30 tablets' }
    ]
};

let patientCart = [];
let selectedSpecialty = '';
let selectedMedicineCategory = '';

// Load dashboard data
function loadDashboardData() {
    loadUpcomingAppointments();
    loadPrescriptions();
    loadOrders();
    loadMedicalRecords();
    loadBookedTests();
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

// Load upcoming appointments
function loadUpcomingAppointments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const patientName = currentUser ? currentUser.name : '';
    const patientEmail = currentUser ? currentUser.email : '';
    
    // Get appointments from shared storage (synced with doctor's actions)
    let allAppointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    
    // Filter appointments for current patient
    let appointments = allAppointments.filter(apt => {
        return apt.patientEmail === patientEmail || 
               apt.patient === patientName ||
               !apt.patientEmail; // Include sample appointments
    });
    
    // If no appointments, use sample data
    if (appointments.length === 0) {
        appointments = getSampleAppointments();
    }
    
    // Also update patientAppointments localStorage for consistency
    localStorage.setItem('patientAppointments', JSON.stringify(appointments));
    
    const upcomingList = document.getElementById('upcomingAppointmentsList');
    const cardsContainer = document.getElementById('appointmentCardsContainer');
    
    // Overview section - handle both lowercase and capitalized status
    const upcoming = appointments.filter(apt => {
        const status = apt.status.toLowerCase();
        return status === 'confirmed' || status === 'pending';
    });
    
    upcomingList.innerHTML = upcoming.length === 0 ? 
        '<p style="text-align: center; color: #666; padding: 20px;">No upcoming appointments</p>' :
        upcoming.slice(0, 3).map(apt => {
        const statusLower = apt.status.toLowerCase();
        const statusDisplay = apt.status.charAt(0).toUpperCase() + apt.status.slice(1).toLowerCase();
        return `
        <div class="appointment-item">
            <div class="info">
                <h4>${apt.doctor}</h4>
                <p><i class="fas fa-calendar"></i> ${apt.date} at ${apt.time}</p>
                <p><i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital'}"></i> ${apt.type} Consultation</p>
            </div>
            <span class="status-badge ${statusLower}">${statusDisplay}</span>
        </div>
    `}).join('');

    // Store appointments for filtering
    window.allPatientAppointments = appointments;

    // Appointment Cards View
    renderAppointmentCards(appointments);

    // Update stats
    document.getElementById('upcomingAppointments').textContent = upcoming.length;
}

// Render appointment cards
function renderAppointmentCards(appointments) {
    const cardsContainer = document.getElementById('appointmentCardsContainer');
    
    if (appointments.length === 0) {
        cardsContainer.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-calendar-times"></i>
                <h3>No Appointments Found</h3>
                <p>Book an appointment to get started with your healthcare journey.</p>
                <button onclick="showDashboardSection('book')" class="book-now-btn">
                    <i class="fas fa-plus"></i> Book Appointment
                </button>
            </div>
        `;
        return;
    }
    
    cardsContainer.innerHTML = appointments.map(apt => {
        const statusLower = apt.status.toLowerCase();
        const statusDisplay = apt.status.charAt(0).toUpperCase() + apt.status.slice(1).toLowerCase();
        
        // Get doctor image using professional medical images
        const doctorImg = getDoctorImage(apt.doctor);
        
        // Status colors
        const statusColors = {
            'pending': { bg: '#FFF8E1', border: '#FFC107', icon: 'fa-clock', color: '#F57C00' },
            'confirmed': { bg: '#E8F5E9', border: '#4CAF50', icon: 'fa-check-circle', color: '#2E7D32' },
            'completed': { bg: '#E3F2FD', border: '#2196F3', icon: 'fa-check-double', color: '#1565C0' },
            'cancelled': { bg: '#FFEBEE', border: '#F44336', icon: 'fa-times-circle', color: '#C62828' },
            'rejected': { bg: '#FCE4EC', border: '#E91E63', icon: 'fa-ban', color: '#AD1457' }
        };
        
        const statusStyle = statusColors[statusLower] || statusColors['pending'];
        
        return `
            <div class="appointment-card" style="border-left: 4px solid ${statusStyle.border};">
                <div class="apt-card-header">
                    <div class="apt-doctor-info">
                        <img src="${doctorImg}" alt="${apt.doctor}" class="apt-doctor-img">
                        <div>
                            <h3>${apt.doctor}</h3>
                            <p class="apt-specialty"><i class="fas fa-stethoscope"></i> ${apt.specialty || 'General Physician'}</p>
                        </div>
                    </div>
                    <div class="apt-status" style="background: ${statusStyle.bg}; color: ${statusStyle.color};">
                        <i class="fas ${statusStyle.icon}"></i> ${statusDisplay}
                    </div>
                </div>
                
                <div class="apt-card-body">
                    <div class="apt-detail-row">
                        <div class="apt-detail">
                            <i class="fas fa-calendar-alt" style="color: #9C27B0;"></i>
                            <span><strong>Date:</strong> ${apt.date}</span>
                        </div>
                        <div class="apt-detail">
                            <i class="fas fa-clock" style="color: #2196F3;"></i>
                            <span><strong>Time:</strong> ${apt.time}</span>
                        </div>
                    </div>
                    <div class="apt-detail-row">
                        <div class="apt-detail">
                            <i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital-alt'}" style="color: ${apt.type === 'Online' ? '#E91E63' : '#00796B'};"></i>
                            <span><strong>Type:</strong> ${apt.type} Consultation</span>
                        </div>
                        <div class="apt-detail">
                            <i class="fas fa-rupee-sign" style="color: #FF5722;"></i>
                            <span><strong>Fee:</strong> ₹${apt.fee || '500'}</span>
                        </div>
                    </div>
                    ${apt.reason ? `
                    <div class="apt-reason">
                        <i class="fas fa-notes-medical" style="color: #607D8B;"></i>
                        <span><strong>Reason:</strong> ${apt.reason}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="apt-card-footer">
                    <button class="apt-btn view" onclick="viewAppointmentDetails('${apt.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${statusLower === 'confirmed' ? `
                        <button class="apt-btn join" onclick="joinConsultation('${apt.id}')">
                            <i class="fas fa-video"></i> Join Now
                        </button>
                    ` : ''}
                    ${statusLower === 'completed' ? `
                        <button class="apt-btn prescription" onclick="viewMyPrescription('${apt.id}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white;">
                            <i class="fas fa-file-prescription"></i> View Prescription
                        </button>
                    ` : ''}
                    ${statusLower === 'pending' ? `
                        <button class="apt-btn cancel" onclick="cancelAppointment('${apt.id}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter appointments
function filterAppointments(filter) {
    let appointments = window.allPatientAppointments || [];
    
    if (filter !== 'all') {
        appointments = appointments.filter(apt => apt.status.toLowerCase() === filter);
    }
    
    renderAppointmentCards(appointments);
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    const appointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    const apt = appointments.find(a => a.id === appointmentId);
    
    if (!apt) {
        showToast('Appointment not found', 'error');
        return;
    }
    
    // Get doctor image using professional medical images
    const doctorImg = getDoctorImage(apt.doctor);
    
    const statusLower = apt.status.toLowerCase();
    const statusDisplay = apt.status.charAt(0).toUpperCase() + apt.status.slice(1).toLowerCase();
    
    const detailsBody = document.getElementById('appointmentDetailsBody');
    detailsBody.innerHTML = `
        <div class="detail-doctor-card">
            <img src="${doctorImg}" alt="${apt.doctor}">
            <div>
                <h3>${apt.doctor}</h3>
                <p>${apt.specialty || 'General Physician'}</p>
            </div>
            <span class="detail-status ${statusLower}">${statusDisplay}</span>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-calendar-check"></i> Appointment Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Appointment ID</label>
                    <span>${apt.id}</span>
                </div>
                <div class="detail-item">
                    <label>Date</label>
                    <span>${apt.date}</span>
                </div>
                <div class="detail-item">
                    <label>Time</label>
                    <span>${apt.time}</span>
                </div>
                <div class="detail-item">
                    <label>Consultation Type</label>
                    <span><i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital-alt'}"></i> ${apt.type}</span>
                </div>
                <div class="detail-item">
                    <label>Consultation Fee</label>
                    <span style="color: #E91E63; font-weight: 600;">₹${apt.fee || '500'}</span>
                </div>
                <div class="detail-item">
                    <label>Booked On</label>
                    <span>${apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i class="fas fa-user"></i> Patient Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Name</label>
                    <span>${apt.patient}</span>
                </div>
                <div class="detail-item">
                    <label>Email</label>
                    <span>${apt.patientEmail || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Phone</label>
                    <span>${apt.patientPhone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Blood Group</label>
                    <span>${apt.patientBloodGroup || 'N/A'}</span>
                </div>
            </div>
        </div>
        
        ${apt.reason ? `
        <div class="detail-section">
            <h4><i class="fas fa-notes-medical"></i> Reason for Visit</h4>
            <p class="reason-text">${apt.reason}</p>
        </div>
        ` : ''}
        
        <div class="detail-actions">
            ${statusLower === 'confirmed' ? `
                <button class="detail-btn join" onclick="joinConsultation('${apt.id}'); closeAppointmentDetails();">
                    <i class="fas fa-video"></i> Join Consultation
                </button>
            ` : ''}
            ${statusLower === 'pending' ? `
                <button class="detail-btn cancel" onclick="cancelAppointment('${apt.id}'); closeAppointmentDetails();">
                    <i class="fas fa-times"></i> Cancel Appointment
                </button>
            ` : ''}
            <button class="detail-btn close" onclick="closeAppointmentDetails()">Close</button>
        </div>
    `;
    
    document.getElementById('appointmentDetailsModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAppointmentDetails() {
    document.getElementById('appointmentDetailsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Get sample appointments
function getSampleAppointments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return [
        {
            id: 'APT001',
            patient: currentUser?.name || 'Patient',
            patientEmail: currentUser?.email || '',
            patientPhone: '9876543210',
            patientBloodGroup: 'O+',
            doctor: 'Dr. Rajesh Kumar',
            specialty: 'General Physician',
            reason: 'General health checkup and consultation',
            date: '28 Feb',
            rawDate: '2026-02-28',
            time: '10:00 AM',
            type: 'Online',
            fee: 500,
            status: 'confirmed',
            bookedAt: new Date().toISOString()
        },
        {
            id: 'APT002',
            patient: currentUser?.name || 'Patient',
            patientEmail: currentUser?.email || '',
            patientPhone: '9876543210',
            patientBloodGroup: 'O+',
            doctor: 'Dr. Amit Verma',
            specialty: 'Cardiology',
            reason: 'Heart palpitations and chest discomfort',
            date: '02 Mar',
            rawDate: '2026-03-02',
            time: '02:30 PM',
            type: 'Hospital',
            fee: 800,
            status: 'pending',
            bookedAt: new Date().toISOString()
        },
        {
            id: 'APT003',
            patient: currentUser?.name || 'Patient',
            patientEmail: currentUser?.email || '',
            patientPhone: '9876543210',
            patientBloodGroup: 'O+',
            doctor: 'Dr. Meena Gupta',
            specialty: 'Pediatrics',
            reason: 'Child vaccination and health check',
            date: '20 Feb',
            rawDate: '2026-02-20',
            time: '11:00 AM',
            type: 'Online',
            fee: 600,
            status: 'completed',
            bookedAt: new Date().toISOString()
        }
    ];
}

// Select specialty
function selectSpecialty(specialty) {
    console.log('selectSpecialty called:', specialty);
    selectedSpecialty = specialty;
    document.querySelector('.specialists-grid').style.display = 'none';
    document.getElementById('doctorsList').style.display = 'block';
    document.getElementById('specialtyTitle').textContent = specialty + ' Doctors';
    
    const doctors = doctorsData[specialty] || [];
    console.log('Doctors found:', doctors.length);
    const doctorsListEl = document.getElementById('doctorsListPatient');
    
    doctorsListEl.innerHTML = doctors.map(doc => {
        // Escape quotes in doc.name for the onclick attribute
        const escapedName = doc.name.replace(/'/g, "\\'");
        const escapedSpecialty = specialty.replace(/'/g, "\\'");
        return `
        <div class="doctor-card-patient">
            <img src="${doc.image}" alt="${doc.name}">
            <div class="info">
                <h4>${doc.name}</h4>
                <p><i class="fas fa-briefcase"></i> ${doc.experience} experience</p>
                <p><i class="fas fa-star" style="color: #FFB800;"></i> ${doc.rating} rating</p>
                <div class="fee">₹${doc.fee} per consultation</div>
                <button type="button" class="book-btn" onclick="bookAppointment(${doc.id}, '${escapedName}', '${escapedSpecialty}', ${doc.fee})">
                    Book Appointment
                </button>
            </div>
        </div>
    `}).join('');
}

// Back to specialties
function backToSpecialties() {
    document.querySelector('.specialists-grid').style.display = 'grid';
    document.getElementById('doctorsList').style.display = 'none';
}

// Book appointment - show modal
let currentBookingDoctor = {};

function bookAppointment(doctorId, doctorName, specialty, fee) {
    console.log('bookAppointment called:', doctorId, doctorName, specialty, fee);
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const patientProfile = JSON.parse(localStorage.getItem('patientProfile')) || {};
        
        // Store doctor info for confirmation
        currentBookingDoctor = {
            id: doctorId,
            name: doctorName,
            specialty: specialty,
            fee: fee
        };
        
        // Check if modal elements exist
        const modal = document.getElementById('bookingModal');
        if (!modal) {
            console.error('Booking modal not found!');
            alert('Error: Booking modal not found. Please refresh the page.');
            return;
        }
        
        // Populate modal with doctor info
        document.getElementById('modalDoctorName').textContent = doctorName;
        document.getElementById('modalDoctorSpecialty').textContent = specialty;
        document.getElementById('modalDoctorFee').textContent = fee;
        document.getElementById('summaryFee').textContent = '₹' + fee;
        document.getElementById('summaryTotal').textContent = '₹' + fee;
        
        // Set doctor image using professional medical images
        const doctorImg = document.getElementById('modalDoctorImg');
        doctorImg.src = getDoctorImage(doctorName);
        
        // Populate patient info
        document.getElementById('bookingPatientName').value = currentUser?.name || patientProfile.name || '';
        document.getElementById('bookingPatientEmail').value = currentUser?.email || patientProfile.email || '';
        document.getElementById('bookingPatientPhone').value = currentUser?.phone || patientProfile.phone || '';
        document.getElementById('bookingBloodGroup').value = patientProfile.bloodGroup || '';
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookingDate').min = today;
        document.getElementById('bookingDate').value = '';
        document.getElementById('bookingTime').value = '';
        document.getElementById('bookingReason').value = '';
        
        // Reset consultation type to Online
        const onlineRadio = document.querySelector('input[name="consultationType"][value="Online"]');
        if (onlineRadio) onlineRadio.checked = true;
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('Modal shown successfully');
    } catch (error) {
        console.error('Error in bookAppointment:', error);
        alert('Error opening booking form: ' + error.message);
    }
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    loadUpcomingAppointments();
    backToSpecialties();
}

function confirmBooking(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const patientProfile = JSON.parse(localStorage.getItem('patientProfile')) || {};
    
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const consultationType = document.querySelector('input[name="consultationType"]:checked').value;
    const reason = document.getElementById('bookingReason').value || currentBookingDoctor.specialty + ' Consultation';
    const phone = document.getElementById('bookingPatientPhone').value;
    const bloodGroup = document.getElementById('bookingBloodGroup').value;
    
    // Get patient image
    const patientName = currentUser?.name || 'Patient';
    const imgNum = Math.abs(patientName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 50) + 1;
    const patientGender = patientProfile.gender === 'Female' ? 'women' : 'men';
    const patientImage = `https://randomuser.me/api/portraits/${patientGender}/${imgNum}.jpg`;
    
    const appointment = {
        id: 'APT' + Date.now(),
        patient: patientName,
        patientEmail: currentUser?.email || '',
        patientPhone: phone,
        patientBloodGroup: bloodGroup,
        doctor: currentBookingDoctor.name,
        specialty: currentBookingDoctor.specialty,
        reason: reason,
        date: formatDate(date),
        rawDate: date,
        time: time,
        type: consultationType,
        fee: currentBookingDoctor.fee,
        status: 'Pending',
        image: patientImage,
        bookedAt: new Date().toISOString()
    };
    
    // Save to shared appointments (for doctor to see)
    let allAppointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    allAppointments.push(appointment);
    localStorage.setItem('ayushAppointments', JSON.stringify(allAppointments));
    
    // Also save to patient's appointments
    let patientAppointments = JSON.parse(localStorage.getItem('patientAppointments')) || [];
    patientAppointments.push(appointment);
    localStorage.setItem('patientAppointments', JSON.stringify(patientAppointments));
    
    // Close booking modal
    closeBookingModal();
    
    // Show success modal
    const successDetails = document.getElementById('successDetails');
    const dateObj = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const fullDate = `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    
    successDetails.innerHTML = `
        <div class="success-item"><i class="fas fa-user-md"></i> <strong>Doctor:</strong> ${currentBookingDoctor.name}</div>
        <div class="success-item"><i class="fas fa-stethoscope"></i> <strong>Specialty:</strong> ${currentBookingDoctor.specialty}</div>
        <div class="success-item"><i class="fas fa-calendar"></i> <strong>Date:</strong> ${fullDate}</div>
        <div class="success-item"><i class="fas fa-clock"></i> <strong>Time:</strong> ${time}</div>
        <div class="success-item"><i class="fas fa-${consultationType === 'Online' ? 'video' : 'hospital-alt'}"></i> <strong>Type:</strong> ${consultationType} Consultation</div>
        <div class="success-item"><i class="fas fa-rupee-sign"></i> <strong>Fee:</strong> ₹${currentBookingDoctor.fee}</div>
        <div class="success-note"><i class="fas fa-info-circle"></i> Please wait for doctor's confirmation. You will be notified once the appointment is confirmed.</div>
    `;
    
    document.getElementById('successModal').style.display = 'flex';
}

// Format date helper
function formatDate(dateStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + months[d.getMonth()];
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        // Update shared appointments (doctor will see this)
        let allAppointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
        allAppointments = allAppointments.map(apt => {
            if (apt.id === appointmentId) {
                apt.status = 'Cancelled';
                apt.cancelledAt = new Date().toISOString();
            }
            return apt;
        });
        localStorage.setItem('ayushAppointments', JSON.stringify(allAppointments));
        
        loadUpcomingAppointments();
        alert('Appointment cancelled successfully. Doctor has been notified.');
    }
}

// Join consultation
function joinConsultation(appointmentId) {
    alert('Joining video consultation...\n\nThis feature will open a video call interface.');
}

// View prescription for completed appointment
function viewMyPrescription(appointmentId) {
    const prescriptions = JSON.parse(localStorage.getItem('ayushPrescriptions')) || [];
    const prescription = prescriptions.find(p => p.appointmentId === appointmentId);
    
    if (!prescription) {
        // Try to find by patient name
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const patientPrescriptions = prescriptions.filter(p => p.patient === currentUser?.name);
        
        if (patientPrescriptions.length > 0) {
            showPrescriptionModal(patientPrescriptions[patientPrescriptions.length - 1]);
        } else {
            alert('Prescription not available yet. Please wait for your doctor to create the prescription.');
        }
        return;
    }
    
    showPrescriptionModal(prescription);
}

function showPrescriptionModal(prescription) {
    // Create modal
    let modal = document.getElementById('patientPrescriptionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'patientPrescriptionModal';
        modal.className = 'modal apt-modal';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;';
        document.body.appendChild(modal);
    }
    
    const medicationsHtml = prescription.medications && prescription.medications.length > 0 
        ? prescription.medications.map((med, i) => `
            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: ${i % 2 === 0 ? '#F8FAFC' : '#FFF'}; border-radius: 10px; margin-bottom: 8px;">
                <span style="background: linear-gradient(135deg, #10B981, #059669); color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${i + 1}</span>
                <div style="flex: 1;">
                    <p style="font-weight: 600; color: #0F172A; margin-bottom: 4px;">${med.name}</p>
                    <p style="font-size: 13px; color: #64748B;"><i class="fas fa-pills" style="color: #7C3AED; margin-right: 5px;"></i>${med.dosage || 'As directed'}</p>
                    <p style="font-size: 13px; color: #64748B;"><i class="fas fa-calendar-day" style="color: #EC4899; margin-right: 5px;"></i>${med.duration || 'Until advised'}</p>
                </div>
            </div>
        `).join('')
        : '<p style="color: #94A3B8; text-align: center; padding: 20px;">No medications prescribed</p>';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 25px; text-align: center; border-radius: 20px 20px 0 0; position: relative;">
                <button onclick="closePrescriptionModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; width: 35px; height: 35px; border-radius: 50%; color: white; cursor: pointer; font-size: 18px;">&times;</button>
                <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 28px; color: #10B981;">Rx</div>
                <h2 style="color: white; font-size: 24px; margin-bottom: 5px;">E-Prescription</h2>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">ID: ${prescription.id}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 25px;">
                <!-- Doctor & Date -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #E2E8F0;">
                    <div>
                        <p style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;">PRESCRIBED BY</p>
                        <p style="font-weight: 600; color: #0F172A;">${prescription.doctor}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;">DATE</p>
                        <p style="font-weight: 600; color: #0F172A;">${prescription.date}</p>
                    </div>
                </div>
                
                <!-- Diagnosis -->
                <div style="background: linear-gradient(135deg, #FFF7ED, #FEF3C7); padding: 18px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #F59E0B;">
                    <p style="font-size: 12px; color: #92400E; font-weight: 600; margin-bottom: 8px;"><i class="fas fa-stethoscope" style="margin-right: 5px;"></i>DIAGNOSIS</p>
                    <p style="color: #0F172A; white-space: pre-wrap; line-height: 1.6;">${prescription.diagnosis || 'General Consultation'}</p>
                </div>
                
                <!-- Medications -->
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 12px; color: #10B981; font-weight: 600; margin-bottom: 12px;"><i class="fas fa-prescription-bottle-alt" style="margin-right: 5px;"></i>MEDICATIONS</p>
                    ${medicationsHtml}
                </div>
                
                <!-- Notes -->
                ${prescription.notes ? `
                <div style="background: linear-gradient(135deg, #F0FDF4, #ECFDF5); padding: 18px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #10B981;">
                    <p style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 8px;"><i class="fas fa-clipboard" style="margin-right: 5px;"></i>ADDITIONAL NOTES</p>
                    <p style="color: #0F172A; line-height: 1.6;">${prescription.notes}</p>
                </div>
                ` : ''}
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 15px; border-top: 1px dashed #E2E8F0;">
                    <p style="color: #64748B; font-size: 13px; margin-bottom: 15px;">
                        <i class="fas fa-info-circle" style="color: #3B82F6;"></i>
                        Please follow the prescribed medications and consult your doctor if symptoms persist.
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="window.print()" style="background: #0891B2; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;"><i class="fas fa-print"></i> Print</button>
                        <button onclick="closePrescriptionModal()" style="background: #F1F5F9; color: #64748B; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePrescriptionModal() {
    const modal = document.getElementById('patientPrescriptionModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    const appointments = JSON.parse(localStorage.getItem('ayushAppointments')) || [];
    const apt = appointments.find(a => a.id === appointmentId);
    
    if (!apt) {
        alert('Appointment not found');
        return;
    }
    
    // Get doctor image
    const doctorImg = getDoctorImage(apt.doctor);
    
    // Status styling
    const statusStyles = {
        'pending': { bg: '#FFF8E1', color: '#F57C00', icon: 'fa-clock' },
        'confirmed': { bg: '#E8F5E9', color: '#2E7D32', icon: 'fa-check-circle' },
        'completed': { bg: '#E3F2FD', color: '#1565C0', icon: 'fa-check-double' },
        'cancelled': { bg: '#FFEBEE', color: '#C62828', icon: 'fa-times-circle' },
        'rejected': { bg: '#FCE4EC', color: '#AD1457', icon: 'fa-ban' }
    };
    
    const status = statusStyles[apt.status.toLowerCase()] || statusStyles['pending'];
    
    // Create modal
    let modal = document.getElementById('appointmentDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'appointmentDetailModal';
        modal.className = 'modal apt-modal';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 550px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 25px; border-radius: 20px 20px 0 0; position: relative;">
                <button onclick="closeAppointmentDetailModal()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; width: 35px; height: 35px; border-radius: 50%; color: white; cursor: pointer; font-size: 18px;">&times;</button>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="${doctorImg}" alt="${apt.doctor}" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; object-fit: cover;">
                    <div>
                        <h2 style="color: white; font-size: 22px; margin-bottom: 5px;">${apt.doctor}</h2>
                        <p style="color: rgba(255,255,255,0.9);"><i class="fas fa-stethoscope"></i> ${apt.specialty || 'General Physician'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Status Badge -->
            <div style="display: flex; justify-content: center; margin-top: -18px;">
                <div style="background: ${status.bg}; color: ${status.color}; padding: 10px 25px; border-radius: 20px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <i class="fas ${status.icon}"></i> ${apt.status}
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 25px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #F0F5FF; padding: 15px; border-radius: 12px;">
                        <p style="font-size: 12px; color: #6366F1; font-weight: 600; margin-bottom: 5px;"><i class="fas fa-calendar-alt"></i> DATE</p>
                        <p style="color: #0F172A; font-weight: 500;">${apt.date}</p>
                    </div>
                    <div style="background: #FFF0F5; padding: 15px; border-radius: 12px;">
                        <p style="font-size: 12px; color: #EC4899; font-weight: 600; margin-bottom: 5px;"><i class="fas fa-clock"></i> TIME</p>
                        <p style="color: #0F172A; font-weight: 500;">${apt.time}</p>
                    </div>
                    <div style="background: #F0FDF4; padding: 15px; border-radius: 12px;">
                        <p style="font-size: 12px; color: #10B981; font-weight: 600; margin-bottom: 5px;"><i class="fas fa-${apt.type === 'Online' ? 'video' : 'hospital-alt'}"></i> TYPE</p>
                        <p style="color: #0F172A; font-weight: 500;">${apt.type} Consultation</p>
                    </div>
                    <div style="background: #FFF7ED; padding: 15px; border-radius: 12px;">
                        <p style="font-size: 12px; color: #F59E0B; font-weight: 600; margin-bottom: 5px;"><i class="fas fa-rupee-sign"></i> FEE</p>
                        <p style="color: #0F172A; font-weight: 500;">₹${apt.fee || 'N/A'}</p>
                    </div>
                </div>
                
                ${apt.reason ? `
                <div style="background: #F8FAFC; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #7C3AED;">
                    <p style="font-size: 12px; color: #7C3AED; font-weight: 600; margin-bottom: 8px;"><i class="fas fa-notes-medical"></i> REASON FOR VISIT</p>
                    <p style="color: #0F172A;">${apt.reason}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; color: #94A3B8; font-size: 13px; margin-bottom: 20px;">
                    <i class="fas fa-clock"></i> Booked on: ${apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    ${apt.status.toLowerCase() === 'completed' ? `
                        <button onclick="closeAppointmentDetailModal(); viewMyPrescription('${apt.id}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;"><i class="fas fa-file-prescription"></i> View Prescription</button>
                    ` : ''}
                    ${apt.status.toLowerCase() === 'confirmed' && apt.type === 'Online' ? `
                        <button onclick="joinConsultation('${apt.id}')" style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;"><i class="fas fa-video"></i> Join Call</button>
                    ` : ''}
                    <button onclick="closeAppointmentDetailModal()" style="background: #F1F5F9; color: #64748B; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 500;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAppointmentDetailModal() {
    const modal = document.getElementById('appointmentDetailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Load prescriptions
function loadPrescriptions() {
    const prescriptions = JSON.parse(localStorage.getItem('patientPrescriptions')) || getSamplePrescriptions();
    
    const prescriptionsList = document.getElementById('patientPrescriptionsList');
    
    prescriptionsList.innerHTML = prescriptions.map(pres => `
        <div class="prescription-card">
            <div class="prescription-header">
                <h4>${pres.doctor}</h4>
                <span class="prescription-date">${pres.date}</span>
            </div>
            <div class="prescription-diagnosis">
                <strong>Diagnosis:</strong> ${pres.diagnosis}
            </div>
            <div class="prescription-medications">
                <strong>Medications:</strong>
                <ul>
                    ${pres.medications.map(med => `
                        <li>${med.name} - ${med.dosage} (${med.duration})</li>
                    `).join('')}
                </ul>
            </div>
            <div class="prescription-actions">
                <button class="action-btn" onclick="orderMedicinesFromPrescription('${pres.id}')">
                    <i class="fas fa-shopping-cart"></i> Order Medicines
                </button>
                <button class="action-btn" onclick="downloadPrescription('${pres.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');

    document.getElementById('activePrescriptions').textContent = prescriptions.length;
}

// Get sample prescriptions
function getSamplePrescriptions() {
    return [
        {
            id: 'PRES001',
            doctor: 'Dr. Rajesh Kumar',
            date: '2025-01-15',
            diagnosis: 'Viral Fever',
            medications: [
                { name: 'Paracetamol 500mg', dosage: '1 tablet 3 times daily', duration: '5 days' },
                { name: 'Cetirizine 10mg', dosage: '1 tablet at night', duration: '5 days' }
            ]
        },
        {
            id: 'PRES002',
            doctor: 'Dr. Amit Verma',
            date: '2025-01-10',
            diagnosis: 'Blood Pressure Management',
            medications: [
                { name: 'Amlodipine 5mg', dosage: '1 tablet daily morning', duration: '30 days' },
                { name: 'Aspirin 75mg', dosage: '1 tablet daily after lunch', duration: '30 days' }
            ]
        }
    ];
}

// Order medicines from prescription
function orderMedicinesFromPrescription(prescriptionId) {
    showDashboardSection('medicines');
    alert('Prescription medicines added to list. Please select from available medicines.');
}

// Download prescription
function downloadPrescription(prescriptionId) {
    alert('Downloading prescription PDF...');
}

// Show medicine category
function showMedicineCategory(category) {
    selectedMedicineCategory = category;
    document.querySelector('.medicine-categories-patient').style.display = 'none';
    document.getElementById('medicinesList').style.display = 'block';
    document.getElementById('medicineCategoryTitle').textContent = category + ' Medicines';
    
    const medicines = medicinesData[category] || [];
    const medicinesGrid = document.getElementById('medicinesGridPatient');
    
    medicinesGrid.innerHTML = medicines.map(med => `
        <div class="medicine-card-patient">
            <div class="img-placeholder">
                <i class="fas fa-pills"></i>
            </div>
            <div class="info">
                <h4>${med.name}</h4>
                <p>${med.type} • ${med.qty}</p>
                <div class="price-row">
                    <span class="price">₹${med.price}</span>
                    <button class="add-btn" onclick="addToCart(${med.id}, '${med.name}', ${med.price})">
                        Add <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Back to medicine categories
function backToMedicineCategories() {
    document.querySelector('.medicine-categories-patient').style.display = 'grid';
    document.getElementById('medicinesList').style.display = 'none';
}

// Add to cart
function addToCart(medicineId, name, price) {
    const existingItem = patientCart.find(item => item.id === medicineId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        patientCart.push({ id: medicineId, name: name, price: price, quantity: 1 });
    }
    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    const cartEl = document.getElementById('cartDashboard');
    const cartItemsList = document.getElementById('cartItemsList');
    
    if (patientCart.length > 0) {
        cartEl.style.display = 'block';
        
        cartItemsList.innerHTML = patientCart.map(item => `
            <div class="cart-item-dash">
                <span>${item.name}</span>
                <div>
                    <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
                    <span style="margin-left: 15px;">₹${item.price * item.quantity}</span>
                </div>
            </div>
        `).join('');
        
        const total = patientCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartTotalDash').textContent = '₹' + total;
    } else {
        cartEl.style.display = 'none';
    }
}

// Update cart quantity
function updateCartQuantity(medicineId, change) {
    const item = patientCart.find(item => item.id === medicineId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            patientCart = patientCart.filter(i => i.id !== medicineId);
        }
    }
    updateCartUI();
}

// Place order
function placeOrder() {
    if (patientCart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const total = patientCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        id: 'ORD' + Date.now(),
        items: [...patientCart],
        total: total,
        status: 'processing',
        date: new Date().toISOString().split('T')[0],
        deliveryDate: 'Expected in 2-3 days'
    };
    
    let orders = JSON.parse(localStorage.getItem('patientOrders')) || [];
    orders.push(order);
    localStorage.setItem('patientOrders', JSON.stringify(orders));
    
    patientCart = [];
    updateCartUI();
    
    alert(`Order placed successfully!\n\nOrder ID: ${order.id}\nTotal: ₹${total}\n\nExpected delivery in 2-3 days.`);
    loadOrders();
}

// Load orders
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('patientOrders')) || getSampleOrders();
    
    const ordersList = document.getElementById('ordersTrackList');
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-track-card">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="status-badge ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><i class="fas fa-calendar"></i> Ordered on: ${order.date}</p>
                <p><i class="fas fa-truck"></i> ${order.deliveryDate}</p>
                <p><i class="fas fa-rupee-sign"></i> Total: ₹${order.total}</p>
            </div>
            <div class="order-items">
                <strong>Items:</strong>
                <ul>
                    ${order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('')}
                </ul>
            </div>
            ${order.status === 'shipped' ? `
                <div class="track-status">
                    <div class="track-step completed"><i class="fas fa-check"></i> Order Placed</div>
                    <div class="track-step completed"><i class="fas fa-check"></i> Confirmed</div>
                    <div class="track-step active"><i class="fas fa-truck"></i> Shipped</div>
                    <div class="track-step"><i class="fas fa-home"></i> Delivered</div>
                </div>
            ` : ''}
        </div>
    `).join('');

    const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

// Get sample orders
function getSampleOrders() {
    return [
        {
            id: 'ORD123456',
            items: [
                { name: 'Paracetamol 500mg', quantity: 2 },
                { name: 'Vitamin D3 1000IU', quantity: 1 }
            ],
            total: 370,
            status: 'shipped',
            date: '2025-01-16',
            deliveryDate: 'Arriving by Jan 19, 2025'
        }
    ];
}

// Load medical records
function loadMedicalRecords() {
    const records = JSON.parse(localStorage.getItem('medicalRecords')) || getSampleRecords();
    
    const recordsEl = document.getElementById('patientRecords');
    
    recordsEl.innerHTML = records.map(record => `
        <div class="record-card">
            <div class="record-icon ${record.type}">
                <i class="fas fa-${getRecordIcon(record.type)}"></i>
            </div>
            <div class="record-info">
                <h4>${record.title}</h4>
                <p>${record.date}</p>
                <small>${record.doctor || ''}</small>
            </div>
            <button class="action-btn" onclick="viewRecord('${record.id}')">
                <i class="fas fa-eye"></i> View
            </button>
        </div>
    `).join('');

    document.getElementById('labReports').textContent = records.filter(r => r.type === 'lab').length;
}

// Get record icon
function getRecordIcon(type) {
    const icons = {
        'prescription': 'file-prescription',
        'lab': 'flask',
        'diagnosis': 'notes-medical',
        'scan': 'x-ray'
    };
    return icons[type] || 'file';
}

// Get sample records
function getSampleRecords() {
    return [
        { id: 'REC001', title: 'Complete Blood Count', type: 'lab', date: '2025-01-10', doctor: 'Dr. Lab Tech' },
        { id: 'REC002', title: 'Prescription - Viral Fever', type: 'prescription', date: '2025-01-15', doctor: 'Dr. Rajesh Kumar' },
        { id: 'REC003', title: 'HbA1c Test', type: 'lab', date: '2025-01-05', doctor: 'Dr. Lab Tech' },
        { id: 'REC004', title: 'ECG Report', type: 'diagnosis', date: '2025-01-08', doctor: 'Dr. Amit Verma' },
        { id: 'REC005', title: 'Chest X-Ray', type: 'scan', date: '2024-12-20', doctor: 'Dr. Radiology' }
    ];
}

// Show records tab
function showRecordsTab(type) {
    document.querySelectorAll('.records-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const allRecords = JSON.parse(localStorage.getItem('medicalRecords')) || getSampleRecords();
    const filtered = type === 'all' ? allRecords : allRecords.filter(r => r.type === type || r.type.includes(type));
    
    const recordsEl = document.getElementById('patientRecords');
    recordsEl.innerHTML = filtered.map(record => `
        <div class="record-card">
            <div class="record-icon ${record.type}">
                <i class="fas fa-${getRecordIcon(record.type)}"></i>
            </div>
            <div class="record-info">
                <h4>${record.title}</h4>
                <p>${record.date}</p>
                <small>${record.doctor || ''}</small>
            </div>
            <button class="action-btn" onclick="viewRecord('${record.id}')">
                <i class="fas fa-eye"></i> View
            </button>
        </div>
    `).join('');
}

// View record
function viewRecord(recordId) {
    alert('Opening medical record viewer...\n\nRecord ID: ' + recordId);
}

// Book lab test
function bookLabTest(category) {
    const tests = {
        'Diabetes': ['Fasting Blood Sugar - ₹120', 'HbA1c - ₹450', 'Sugar PP - ₹150'],
        'Heart': ['Lipid Profile - ₹380', 'Cardiac Enzymes - ₹850', 'ECG - ₹300'],
        'Thyroid': ['T3 T4 TSH - ₹450', 'Free T3 T4 - ₹550'],
        'Full Body': ['Comprehensive Health Package - ₹2500', 'Master Health Checkup - ₹4500']
    };
    
    const testList = tests[category];
    const selected = prompt(`Select a ${category} test:\n\n${testList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nEnter number:`);
    
    if (selected && selected >= 1 && selected <= testList.length) {
        const date = prompt('Enter preferred date (YYYY-MM-DD):');
        if (date) {
            const test = {
                id: 'LAB' + Date.now(),
                name: testList[parseInt(selected) - 1].split(' - ')[0],
                category: category,
                date: date,
                status: 'scheduled',
                type: 'Home Collection'
            };
            
            let bookedTests = JSON.parse(localStorage.getItem('bookedLabTests')) || [];
            bookedTests.push(test);
            localStorage.setItem('bookedLabTests', JSON.stringify(bookedTests));
            
            alert(`Lab test booked successfully!\n\nTest: ${test.name}\nDate: ${date}\nType: Home Collection\n\nOur technician will visit for sample collection.`);
            loadBookedTests();
        }
    }
}

// Load booked tests
function loadBookedTests() {
    const tests = JSON.parse(localStorage.getItem('bookedLabTests')) || [];
    
    const testsList = document.getElementById('bookedTestsList');
    
    if (tests.length === 0) {
        testsList.innerHTML = '<p style="color: var(--text-light); text-align: center;">No tests booked yet</p>';
        return;
    }
    
    testsList.innerHTML = tests.map(test => `
        <div class="booked-test-item" style="display: flex; justify-content: space-between; padding: 15px; background: var(--bg-light); border-radius: 8px; margin-bottom: 10px;">
            <div>
                <strong>${test.name}</strong>
                <p style="color: var(--text-light); font-size: 13px;">
                    <i class="fas fa-calendar"></i> ${test.date} | 
                    <i class="fas fa-home"></i> ${test.type}
                </p>
            </div>
            <span class="status-badge ${test.status}">${test.status}</span>
        </div>
    `).join('');
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const patientProfile = JSON.parse(localStorage.getItem('patientProfile')) || {};
    
    // Get form values
    const name = document.getElementById('profileFullName').value;
    const email = document.getElementById('profileEmailInput').value;
    const phone = document.getElementById('profilePhone').value;
    const dob = document.getElementById('profileDOB').value;
    const bloodGroup = document.getElementById('profileBloodGroup').value;
    const gender = document.getElementById('profileGender').value;
    const address = document.getElementById('profileAddress').value;
    
    // Update currentUser
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.dob = dob;
    currentUser.bloodGroup = bloodGroup;
    currentUser.gender = gender;
    currentUser.address = address;
    
    // Update patientProfile
    patientProfile.name = name;
    patientProfile.email = email;
    patientProfile.phone = phone;
    patientProfile.dob = dob;
    patientProfile.bloodGroup = bloodGroup;
    patientProfile.gender = gender;
    patientProfile.address = address;
    if (!patientProfile.image) {
        patientProfile.image = getPatientImage(name);
    }
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('patientProfile', JSON.stringify(patientProfile));
    
    // Update UI elements
    document.getElementById('patientName').textContent = name;
    document.getElementById('welcomeName').textContent = name.split(' ')[0];
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;
    
    // Update header profile image
    const headerImg = document.getElementById('headerProfileImg');
    if (headerImg) {
        headerImg.src = patientProfile.image;
    }
    
    // Show success message
    if (typeof showToast === 'function') {
        showToast('Profile updated successfully!', 'success');
    } else {
        alert('Profile updated successfully!');
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Add missing styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .order-track-card {
        background: var(--white);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        margin-bottom: 20px;
    }
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    .order-details p {
        color: var(--text-light);
        margin-bottom: 5px;
        font-size: 14px;
    }
    .order-details p i {
        width: 20px;
        color: var(--primary-color);
    }
    .order-items {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #E0E0E0;
    }
    .order-items ul {
        margin-top: 8px;
        padding-left: 20px;
        color: var(--text-light);
    }
    .track-status {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #E0E0E0;
    }
    .track-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #ccc;
        font-size: 12px;
    }
    .track-step i {
        font-size: 20px;
        margin-bottom: 5px;
    }
    .track-step.completed {
        color: var(--primary-color);
    }
    .track-step.active {
        color: var(--secondary-color);
    }
    .record-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: var(--bg-light);
        border-radius: 10px;
        margin-bottom: 10px;
    }
    .record-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-light);
        color: var(--primary-color);
    }
    .record-icon.lab {
        background: #E3F2FD;
        color: #1976D2;
    }
    .record-icon.diagnosis {
        background: #FFF3E0;
        color: #E65100;
    }
    .record-icon.scan {
        background: #F3E5F5;
        color: #7B1FA2;
    }
    .record-info {
        flex: 1;
    }
    .record-info h4 {
        color: var(--text-dark);
        margin-bottom: 3px;
    }
    .record-info p {
        color: var(--text-light);
        font-size: 13px;
    }
    .record-info small {
        color: var(--primary-color);
    }
`;
document.head.appendChild(additionalStyles);
