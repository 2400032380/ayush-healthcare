// ===== Global Variables =====
let selectedRole = '';
let cart = [];
let currentUser = null;

// ===== Location Functions =====
function openLocationModal() {
    document.getElementById('locationModal').classList.add('active');
    document.getElementById('pincodeSection').style.display = 'none';
    document.getElementById('locationResults').style.display = 'none';
    document.getElementById('locationConfirmed').style.display = 'none';
}

function closeLocationModal() {
    document.getElementById('locationModal').classList.remove('active');
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        showToast('Detecting your location...', 'info');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // Use OpenStreetMap Nominatim API for reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const address = data.address;
                        const location = {
                            village: address.neighbourhood || address.suburb || address.village || address.town || address.city_district || 'Local Area',
                            city: address.city || address.town || address.county || address.state_district || 'Unknown City',
                            state: address.state || 'Unknown State',
                            country: address.country || 'India',
                            pincode: address.postcode || '000000'
                        };
                        updateLocation(location);
                        showToast('Location detected successfully!', 'success');
                    } else {
                        throw new Error('Could not get address');
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    showToast('Could not detect exact location. Please enter pincode.', 'error');
                    showPincodeInput();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMsg = 'Unable to get location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg += 'Location permission denied.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg += 'Location unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMsg += 'Location request timed out.';
                        break;
                }
                showToast(errorMsg + ' Please enter pincode manually.', 'error');
                showPincodeInput();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        showToast('Geolocation not supported. Please enter pincode manually.', 'error');
        showPincodeInput();
    }
}

function showPincodeInput() {
    document.getElementById('pincodeSection').style.display = 'flex';
    document.getElementById('pincodeInput').focus();
}

async function searchByPincode() {
    const pincode = document.getElementById('pincodeInput').value.trim();
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        showToast('Please enter a valid 6-digit pincode', 'error');
        return;
    }

    showToast('Looking up pincode...', 'info');
    
    try {
        // Use India Post API for pincode lookup
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
            const postOffices = data[0].PostOffice;
            const locations = postOffices.map(po => ({
                village: po.Name,
                city: po.Block || po.Division || po.District,
                district: po.District,
                state: po.State,
                country: po.Country || 'India',
                region: po.Region,
                pincode: po.Pincode
            }));
            
            displayLocationResults(locations, pincode);
        } else {
            // Fallback for unrecognized pincodes
            showToast('Pincode not found in database. Showing generic location.', 'warning');
            const fallbackLocations = [{
                village: 'Area ' + pincode,
                city: 'City',
                district: 'District',
                state: 'State',
                country: 'India',
                pincode: pincode
            }];
            displayLocationResults(fallbackLocations, pincode);
        }
    } catch (error) {
        console.error('Pincode lookup error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function displayLocationResults(locations, pincode) {
    const resultsContainer = document.getElementById('locationResults');
    const listContainer = document.getElementById('locationList');
    
    listContainer.innerHTML = '';
    
    locations.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
            <div class="village"><strong>${loc.village}</strong></div>
            <div class="details">${loc.district || loc.city}, ${loc.state}, ${loc.country} - ${loc.pincode || pincode}</div>
        `;
        item.onclick = () => updateLocation({ ...loc, pincode: loc.pincode || pincode });
        listContainer.appendChild(item);
    });
    
    resultsContainer.style.display = 'block';
}

function updateLocation(location) {
    document.getElementById('locationResults').style.display = 'none';
    document.getElementById('pincodeSection').style.display = 'none';
    
    // Show confirmation
    document.getElementById('locationConfirmed').style.display = 'flex';
    
    // Save location to localStorage
    localStorage.setItem('userLocation', JSON.stringify(location));
    
    // Update address display
    setTimeout(() => {
        const displayText = location.village + ', ' + (location.district || location.city);
        document.getElementById('currentAddress').textContent = displayText;
        closeLocationModal();
        showToast(`Delivery location set to ${displayText}`, 'success');
    }, 1500);
}

// ===== Auth Functions =====
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function openRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
    document.getElementById('roleSelection').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
}

function switchToRegister() {
    closeLoginModal();
    setTimeout(() => openRegisterModal(), 300);
}

function switchToLogin() {
    closeRegisterModal();
    setTimeout(() => openLoginModal(), 300);
}

function selectRole(role) {
    selectedRole = role;
    document.getElementById('roleSelection').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    
    const roleLabels = {
        admin: '<i class="fas fa-user-shield"></i> Admin',
        doctor: '<i class="fas fa-user-md"></i> Doctor',
        patient: '<i class="fas fa-user"></i> Patient',
        pharmacist: '<i class="fas fa-prescription-bottle-alt"></i> Pharmacist'
    };
    
    document.getElementById('selectedRoleDisplay').innerHTML = 'Registering as: ' + roleLabels[role];
}

function backToRoleSelection() {
    document.getElementById('roleSelection').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const mobile = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    
    // Store user data
    const userData = {
        name: fullName,
        email,
        mobile,
        password,
        role: selectedRole
    };
    
    // Save to localStorage
    let users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
    users.push(userData);
    localStorage.setItem('ayushUsers', JSON.stringify(users));
    
    showToast('Account created successfully! Please login.', 'success');
    closeRegisterModal();
    
    // Clear form
    document.getElementById('registerForm').reset();
    
    // Open login modal
    setTimeout(() => openLoginModal(), 500);
}

function handleLogin(event) {
    event.preventDefault();
    
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check credentials
    const users = JSON.parse(localStorage.getItem('ayushUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast('Login successful!', 'success');
        closeLoginModal();
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            window.location.href = `dashboards/${role}-dashboard.html`;
        }, 1000);
    } else {
        showToast('Invalid credentials or role mismatch', 'error');
    }
}

// ===== Navigation Functions =====
function showSection(section) {
    // Update nav links
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show selected section
    let sectionElement;
    switch(section) {
        case 'home':
            sectionElement = document.getElementById('home-section');
            break;
        case 'appointments':
            sectionElement = document.getElementById('appointments-section');
            resetAppointmentView();
            break;
        case 'lab-tests':
            sectionElement = document.getElementById('lab-tests-section');
            resetLabTestView();
            break;
        case 'medicines':
            sectionElement = document.getElementById('medicines-section');
            resetMedicineView();
            break;
    }
    
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
}

// ===== Appointments Functions =====
const doctorsData = {
    'General Physician': [
        { id: 1, name: 'Dr. M S Chaudhary', qualification: 'MBBS, MD - Internal Medicine', experience: 28, hospital: 'Apollo Hospitals Indraprastha', fee: 2500, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face' },
        { id: 2, name: 'Dr. Priya Sharma', qualification: 'MBBS, DNB - General Medicine', experience: 15, hospital: 'Max Super Specialty Hospital', fee: 1800, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face' },
        { id: 3, name: 'Dr. Rajesh Kumar', qualification: 'MBBS, MD', experience: 20, hospital: 'Fortis Hospital', fee: 2000, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face' }
    ],
    'Neurology': [
        { id: 4, name: 'Dr. Arun Verma', qualification: 'MBBS, DM - Neurology', experience: 22, hospital: 'AIIMS Delhi', fee: 3000, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face' },
        { id: 5, name: 'Dr. Meera Gupta', qualification: 'MBBS, MD, DM - Neurology', experience: 18, hospital: 'Medanta Hospital', fee: 2800, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face' }
    ],
    'Paediatrics': [
        { id: 6, name: 'Dr. Sunita Rao', qualification: 'MBBS, MD - Pediatrics', experience: 16, hospital: "Rainbow Children's Hospital", fee: 1500, image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face' },
        { id: 7, name: 'Dr. Vikram Joshi', qualification: 'MBBS, DCH, DNB - Pediatrics', experience: 12, hospital: 'Cloudnine Hospital', fee: 1200, image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face' }
    ],
    'Cardiology': [
        { id: 8, name: 'Dr. Ashok Mehta', qualification: 'MBBS, DM - Cardiology', experience: 25, hospital: 'Escorts Heart Institute', fee: 3500, image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=200&h=200&fit=crop&crop=face' },
        { id: 9, name: 'Dr. Kavita Singh', qualification: 'MBBS, MD, DM - Cardiology', experience: 20, hospital: 'Max Heart Centre', fee: 3200, image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face' }
    ],
    'Dermatology': [
        { id: 10, name: 'Dr. Neha Kapoor', qualification: 'MBBS, MD - Dermatology', experience: 14, hospital: 'Skin & Hair Clinic', fee: 1500, image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face' },
        { id: 11, name: 'Dr. Amit Shah', qualification: 'MBBS, DVD, DNB - Dermatology', experience: 18, hospital: 'Apollo Derma Clinic', fee: 1800, image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=200&h=200&fit=crop&crop=face' }
    ],
    'Orthopedics': [
        { id: 12, name: 'Dr. Suresh Iyer', qualification: 'MBBS, MS - Orthopedics', experience: 24, hospital: 'Indian Spinal Injuries Centre', fee: 2500, image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=200&h=200&fit=crop&crop=face' },
        { id: 13, name: 'Dr. Pooja Reddy', qualification: 'MBBS, DNB - Orthopedics', experience: 12, hospital: 'Fortis Bone & Joint', fee: 2000, image: 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=200&h=200&fit=crop&crop=face' }
    ],
    'Ophthalmology': [
        { id: 14, name: 'Dr. Rahul Bhatia', qualification: 'MBBS, MS - Ophthalmology', experience: 20, hospital: 'Centre for Sight', fee: 1800, image: 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=200&h=200&fit=crop&crop=face' },
        { id: 15, name: 'Dr. Anita Desai', qualification: 'MBBS, DNB - Ophthalmology', experience: 15, hospital: 'Dr. Shroffs Charity Eye', fee: 1500, image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face' }
    ],
    'ENT': [
        { id: 16, name: 'Dr. Karan Malhotra', qualification: 'MBBS, MS - ENT', experience: 16, hospital: 'ENT Care Centre', fee: 1200, image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop&crop=face' },
        { id: 17, name: 'Dr. Ritu Agarwal', qualification: 'MBBS, DNB - ENT', experience: 13, hospital: 'Max ENT Hospital', fee: 1400, image: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=200&h=200&fit=crop&crop=face' }
    ],
    'Dentistry': [
        { id: 18, name: 'Dr. Sanjay Patel', qualification: 'BDS, MDS - Orthodontics', experience: 18, hospital: 'Clove Dental', fee: 800, image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&h=200&fit=crop&crop=face' },
        { id: 19, name: 'Dr. Swati Arora', qualification: 'BDS, MDS - Prosthodontics', experience: 10, hospital: 'Dental Solutions', fee: 1000, image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&h=200&fit=crop&crop=face' }
    ],
    'Psychiatry': [
        { id: 20, name: 'Dr. Deepak Sharma', qualification: 'MBBS, MD - Psychiatry', experience: 22, hospital: 'NIMHANS', fee: 2000, image: 'https://images.unsplash.com/photo-1612349316228-5942a9b489c2?w=200&h=200&fit=crop&crop=face' },
        { id: 21, name: 'Dr. Nisha Menon', qualification: 'MBBS, DNB - Psychiatry', experience: 14, hospital: 'Mind Care Clinic', fee: 1800, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face' }
    ],
    'Gynecology': [
        { id: 22, name: 'Dr. Asha Pillai', qualification: 'MBBS, MD - Obstetrics & Gynecology', experience: 20, hospital: 'Cloudnine Hospital', fee: 2000, image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face' },
        { id: 23, name: 'Dr. Rekha Natarajan', qualification: 'MBBS, DNB - OB/GYN', experience: 16, hospital: 'Motherhood Hospital', fee: 1800, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face' }
    ],
    'Urology': [
        { id: 24, name: 'Dr. Vinod Kumar', qualification: 'MBBS, MCh - Urology', experience: 24, hospital: 'Fortis C-DOC', fee: 2500, image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=200&h=200&fit=crop&crop=face' },
        { id: 25, name: 'Dr. Rakesh Jain', qualification: 'MBBS, MS, MCh - Urology', experience: 18, hospital: 'Max Urology Centre', fee: 2200, image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=200&h=200&fit=crop&crop=face' }
    ]
};

function showDoctorsBySpecialty(specialty) {
    document.getElementById('specialistsGrid').parentElement.style.display = 'none';
    document.getElementById('doctorsListContainer').style.display = 'block';
    document.getElementById('specialtyTitle').textContent = specialty + ' Doctors';
    
    const doctors = doctorsData[specialty] || [];
    const listContainer = document.getElementById('doctorsList');
    listContainer.innerHTML = '';
    
    doctors.forEach(doctor => {
        const card = document.createElement('div');
        card.className = 'doctor-list-card';
        card.innerHTML = `
            <img src="${doctor.image}" alt="${doctor.name}">
            <div class="doctor-details">
                <h4>${doctor.name}</h4>
                <p class="qualification">${doctor.qualification}</p>
                <p class="experience">${doctor.experience} years experience</p>
                <p class="hospital"><i class="fas fa-hospital"></i> ${doctor.hospital}</p>
                <div class="doctor-fee">₹${doctor.fee}</div>
                <button class="book-btn" onclick="openAppointmentModal(${JSON.stringify(doctor).replace(/"/g, '&quot;')})">
                    Book Appointment
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function backToSpecialists() {
    document.getElementById('specialistsGrid').parentElement.style.display = 'block';
    document.getElementById('doctorsListContainer').style.display = 'none';
}

function resetAppointmentView() {
    document.getElementById('specialistsGrid').parentElement.style.display = 'block';
    document.getElementById('doctorsListContainer').style.display = 'none';
}

function openAppointmentModal(doctor) {
    document.getElementById('appointmentModal').classList.add('active');
    
    // Generate dates for next 7 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            full: date.toISOString().split('T')[0]
        });
    }
    
    // Generate time slots
    const timeSlots = ['09:15 AM', '09:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
    
    const content = document.getElementById('appointmentContent');
    content.innerHTML = `
        <div class="appointment-doctor-info">
            <img src="${doctor.image}" alt="${doctor.name}">
            <div class="appointment-doctor-details">
                <h3>${doctor.name}</h3>
                <p>${doctor.qualification}</p>
                <p>${doctor.experience} years experience</p>
            </div>
        </div>
        
        <div class="appointment-type-toggle">
            <button class="type-btn" onclick="selectAppointmentType(this, 'online')">ONLINE CONSULT</button>
            <button class="type-btn active" onclick="selectAppointmentType(this, 'hospital')">HOSPITAL VISIT</button>
        </div>
        
        <div class="hospital-info" style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #f5f5f5; border-radius: 8px; margin-bottom: 20px;">
            <i class="fas fa-hospital" style="color: var(--primary-color);"></i>
            <div>
                <strong>${doctor.hospital}</strong>
                <small style="display: block; color: #666;">26 KM</small>
            </div>
            <i class="fas fa-map-marker-alt" style="margin-left: auto; color: var(--primary-color);"></i>
        </div>
        
        <div class="date-selection">
            <h4>Select Date</h4>
            <div class="date-grid">
                ${dates.map((d, i) => `
                    <div class="date-item ${i === 1 ? 'selected' : ''}" onclick="selectDate(this)">
                        <div class="day">${d.day}</div>
                        <div class="date">${d.date}</div>
                        <div class="month">${d.month}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="time-selection">
            <h4>Morning <span>${Math.floor(Math.random() * 5) + 3} SLOTS</span></h4>
            <div class="time-grid">
                ${timeSlots.slice(0, 6).map((t, i) => `
                    <div class="time-slot ${i === 0 ? 'selected' : ''}" onclick="selectTime(this)">${t}</div>
                `).join('')}
            </div>
        </div>
        
        <div class="time-selection">
            <h4>Afternoon <span>${Math.floor(Math.random() * 4) + 2} SLOTS</span></h4>
            <div class="time-grid">
                ${timeSlots.slice(6).map(t => `
                    <div class="time-slot" onclick="selectTime(this)">${t}</div>
                `).join('')}
            </div>
        </div>
        
        <div class="appointment-footer">
            <div class="appointment-fee">
                ₹${doctor.fee}
                <small>Pay at Hospital</small>
            </div>
            <button class="continue-btn" onclick="confirmAppointment('${doctor.name}', ${doctor.fee})">Continue</button>
        </div>
    `;
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').classList.remove('active');
}

function selectAppointmentType(btn, type) {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selectDate(element) {
    document.querySelectorAll('.date-item').forEach(d => d.classList.remove('selected'));
    element.classList.add('selected');
}

function selectTime(element) {
    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
    element.classList.add('selected');
}

function confirmAppointment(doctorName, fee) {
    const selectedDate = document.querySelector('.date-item.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    if (!selectedDate || !selectedTime) {
        showToast('Please select date and time', 'error');
        return;
    }
    
    const date = selectedDate.querySelector('.date').textContent + ' ' + selectedDate.querySelector('.month').textContent;
    const time = selectedTime.textContent;
    
    // Save appointment
    const appointment = {
        id: Date.now(),
        doctor: doctorName,
        date: date,
        time: time,
        fee: fee,
        status: 'Pending'
    };
    
    let appointments = JSON.parse(localStorage.getItem('ayushAppointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('ayushAppointments', JSON.stringify(appointments));
    
    closeAppointmentModal();
    showToast(`Appointment booked with ${doctorName} on ${date} at ${time}`, 'success');
}

// ===== Lab Tests Functions =====
const labTestsData = {
    'Diabetes': [
        { name: 'Fasting Blood Sugar (FBS)', includes: 'Blood glucose level after fasting', price: 150, originalPrice: 200 },
        { name: 'HbA1c Test', includes: 'Average blood sugar for past 3 months', price: 450, originalPrice: 600 },
        { name: 'Random Blood Sugar', includes: 'Blood glucose at any time', price: 100, originalPrice: 150 },
        { name: 'Complete Diabetes Panel', includes: 'FBS, PP Sugar, HbA1c, Lipid Profile', price: 999, originalPrice: 1500 }
    ],
    'Heart': [
        { name: 'Lipid Profile', includes: 'Total Cholesterol, HDL, LDL, Triglycerides', price: 399, originalPrice: 600 },
        { name: 'Cardiac Risk Markers', includes: 'CRP, Homocysteine, Lipoprotein', price: 1999, originalPrice: 3000 },
        { name: 'ECG', includes: 'Heart rhythm analysis', price: 250, originalPrice: 400 },
        { name: 'Complete Cardiac Panel', includes: 'All heart health tests', price: 2999, originalPrice: 4500 }
    ],
    'Thyroid': [
        { name: 'TSH Test', includes: 'Thyroid Stimulating Hormone', price: 199, originalPrice: 300 },
        { name: 'T3 Test', includes: 'Triiodothyronine level', price: 249, originalPrice: 350 },
        { name: 'T4 Test', includes: 'Thyroxine level', price: 249, originalPrice: 350 },
        { name: 'Complete Thyroid Profile', includes: 'T3, T4, TSH', price: 499, originalPrice: 800 }
    ],
    'Kidney': [
        { name: 'Creatinine Test', includes: 'Kidney function marker', price: 150, originalPrice: 200 },
        { name: 'BUN Test', includes: 'Blood Urea Nitrogen', price: 150, originalPrice: 200 },
        { name: 'eGFR Test', includes: 'Kidney filtration rate', price: 200, originalPrice: 300 },
        { name: 'Kidney Function Test (KFT)', includes: 'Complete kidney panel', price: 599, originalPrice: 900 }
    ],
    'Liver': [
        { name: 'SGPT/ALT Test', includes: 'Liver enzyme level', price: 150, originalPrice: 200 },
        { name: 'SGOT/AST Test', includes: 'Liver enzyme level', price: 150, originalPrice: 200 },
        { name: 'Bilirubin Test', includes: 'Total & Direct bilirubin', price: 180, originalPrice: 250 },
        { name: 'Liver Function Test (LFT)', includes: 'Complete liver panel', price: 599, originalPrice: 900 }
    ],
    'Vitamin': [
        { name: 'Vitamin D Test', includes: '25-Hydroxy Vitamin D', price: 799, originalPrice: 1200 },
        { name: 'Vitamin B12 Test', includes: 'Cobalamin level', price: 599, originalPrice: 900 },
        { name: 'Iron Studies', includes: 'Serum Iron, TIBC, Ferritin', price: 699, originalPrice: 1000 },
        { name: 'Complete Vitamin Panel', includes: 'All essential vitamins', price: 1999, originalPrice: 3000 }
    ],
    'Allergy': [
        { name: 'IgE Total', includes: 'Total allergy antibodies', price: 499, originalPrice: 700 },
        { name: 'Food Allergy Panel', includes: 'Common food allergens', price: 2999, originalPrice: 4500 },
        { name: 'Respiratory Allergy Panel', includes: 'Dust, pollen, mold', price: 2499, originalPrice: 3500 },
        { name: 'Complete Allergy Profile', includes: 'All allergen testing', price: 4999, originalPrice: 7500 }
    ],
    'FullBody': [
        { name: 'Basic Health Checkup', includes: '40+ tests - CBC, Sugar, Lipid, Kidney, Liver', price: 999, originalPrice: 2000 },
        { name: 'Comprehensive Health Checkup', includes: '70+ tests - All basic + Thyroid, Vitamins', price: 1999, originalPrice: 4000 },
        { name: 'Master Health Checkup', includes: '90+ tests - Complete body screening', price: 2999, originalPrice: 6000 },
        { name: 'Executive Health Checkup', includes: '100+ tests - Premium full body', price: 4999, originalPrice: 10000 }
    ]
};

function showLabTests(category) {
    document.querySelector('.lab-categories').style.display = 'none';
    document.getElementById('labTestsList').style.display = 'block';
    document.getElementById('labCategoryTitle').textContent = category + ' Tests';
    
    const tests = labTestsData[category] || [];
    const testsGrid = document.getElementById('testsGrid');
    testsGrid.innerHTML = '';
    
    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `
            <h4>${test.name}</h4>
            <p class="includes">Includes: ${test.includes}</p>
            <div class="price-row">
                <div>
                    <span class="price">₹${test.price}</span>
                    <span class="original-price">₹${test.originalPrice}</span>
                </div>
                <button class="add-test-btn" onclick="addLabTest('${test.name}', ${test.price})">Add</button>
            </div>
        `;
        testsGrid.appendChild(card);
    });
}

function backToLabCategories() {
    document.querySelector('.lab-categories').style.display = 'block';
    document.getElementById('labTestsList').style.display = 'none';
}

function resetLabTestView() {
    document.querySelector('.lab-categories').style.display = 'block';
    document.getElementById('labTestsList').style.display = 'none';
}

function addLabTest(testName, price) {
    // Save to cart or direct booking
    let labTests = JSON.parse(localStorage.getItem('ayushLabTests') || '[]');
    labTests.push({ name: testName, price: price, date: new Date().toISOString() });
    localStorage.setItem('ayushLabTests', JSON.stringify(labTests));
    
    showToast(`${testName} added to your tests`, 'success');
}

// ===== Medicines Functions =====
const medicinesData = {
    'Pain Relief': [
        { name: 'Dolo 650', desc: 'Paracetamol 650mg - Strip of 15 tablets', price: 32, image: 'pills' },
        { name: 'Combiflam', desc: 'Ibuprofen + Paracetamol - Strip of 20 tablets', price: 45, image: 'pills' },
        { name: 'Crocin Advance', desc: 'Paracetamol 500mg - Strip of 15 tablets', price: 25, image: 'pills' },
        { name: 'Volini Gel', desc: 'Pain relief gel - 30g tube', price: 120, image: 'capsules' },
        { name: 'Moov Spray', desc: 'Fast pain relief spray - 80g', price: 180, image: 'capsules' }
    ],
    'Cold & Flu': [
        { name: 'Vicks Action 500', desc: 'Cold & headache relief - Strip of 10', price: 35, image: 'pills' },
        { name: 'Cetrizine', desc: 'Antihistamine 10mg - Strip of 10', price: 20, image: 'pills' },
        { name: 'Sinarest', desc: 'Cold tablets - Strip of 10', price: 28, image: 'pills' },
        { name: 'Otrivin Nasal Spray', desc: 'Nasal decongestant - 10ml', price: 85, image: 'capsules' },
        { name: 'Strepsils', desc: 'Throat lozenges - Pack of 8', price: 30, image: 'capsules' }
    ],
    'Diabetes Care': [
        { name: 'Metformin 500mg', desc: 'Diabetes medication - Strip of 20', price: 45, image: 'pills' },
        { name: 'Glimepiride 1mg', desc: 'Blood sugar control - Strip of 10', price: 38, image: 'pills' },
        { name: 'Accu-Chek Test Strips', desc: 'Glucose test strips - Box of 50', price: 850, image: 'capsules' },
        { name: 'Insulin Syringes', desc: 'U-100 syringes - Pack of 10', price: 120, image: 'capsules' },
        { name: 'Sugar Free Natura', desc: 'Sugar substitute - 100 pellets', price: 95, image: 'capsules' }
    ],
    'Cardiac Care': [
        { name: 'Aspirin 75mg', desc: 'Blood thinner - Strip of 14', price: 25, image: 'pills' },
        { name: 'Atorvastatin 10mg', desc: 'Cholesterol control - Strip of 10', price: 65, image: 'pills' },
        { name: 'Amlodipine 5mg', desc: 'BP medication - Strip of 15', price: 30, image: 'pills' },
        { name: 'Ecosprin Gold', desc: 'Heart care - Strip of 10', price: 95, image: 'pills' },
        { name: 'BP Monitor', desc: 'Digital blood pressure monitor', price: 1200, image: 'capsules' }
    ],
    'Vitamins': [
        { name: 'Becosules', desc: 'B-Complex capsules - Strip of 20', price: 42, image: 'capsules' },
        { name: 'Vitamin D3 60K', desc: 'Cholecalciferol - Strip of 4', price: 140, image: 'capsules' },
        { name: 'Supradyn', desc: 'Multivitamin - Strip of 15', price: 75, image: 'pills' },
        { name: 'Calcium + D3', desc: 'Bone health - Strip of 15', price: 85, image: 'pills' },
        { name: 'Omega 3 Fish Oil', desc: 'Heart & brain health - 30 capsules', price: 350, image: 'capsules' }
    ],
    'Skin Care': [
        { name: 'Cetaphil Moisturizer', desc: 'Daily moisturizing lotion - 100ml', price: 350, image: 'capsules' },
        { name: 'Lacto Calamine', desc: 'Skin balance lotion - 60ml', price: 120, image: 'capsules' },
        { name: 'Betadine Ointment', desc: 'Antiseptic cream - 20g', price: 85, image: 'capsules' },
        { name: 'Soframycin', desc: 'Antibiotic skin cream - 30g', price: 65, image: 'capsules' },
        { name: 'Candid Powder', desc: 'Antifungal powder - 100g', price: 110, image: 'capsules' }
    ],
    'Digestive': [
        { name: 'Gelusil MPS', desc: 'Antacid - Strip of 15', price: 42, image: 'pills' },
        { name: 'Digene', desc: 'Digestive tablets - Strip of 15', price: 35, image: 'pills' },
        { name: 'Eno', desc: 'Fruit salt sachet - Pack of 30', price: 90, image: 'capsules' },
        { name: 'Isabgol', desc: 'Fiber supplement - 100g', price: 85, image: 'capsules' },
        { name: 'Electral Powder', desc: 'ORS sachets - Pack of 21', price: 125, image: 'capsules' }
    ],
    'Baby Care': [
        { name: 'Calpol Syrup', desc: 'Paracetamol for kids - 60ml', price: 55, image: 'capsules' },
        { name: 'Gripe Water', desc: 'Digestive comfort - 130ml', price: 85, image: 'capsules' },
        { name: 'Cerelac', desc: 'Baby cereal - 300g', price: 250, image: 'capsules' },
        { name: 'Johnson Baby Oil', desc: 'Moisturizing oil - 200ml', price: 185, image: 'capsules' },
        { name: 'Diaper Rash Cream', desc: 'Skin protection - 50g', price: 150, image: 'capsules' }
    ]
};

function showMedicines(category) {
    document.querySelector('.medicine-categories').style.display = 'none';
    document.getElementById('medicinesList').style.display = 'block';
    document.getElementById('medicineCategoryTitle').textContent = category;
    
    const medicines = medicinesData[category] || [];
    const medicinesGrid = document.getElementById('medicinesGrid');
    medicinesGrid.innerHTML = '';
    
    medicines.forEach(medicine => {
        const card = document.createElement('div');
        card.className = 'medicine-card';
        card.innerHTML = `
            <div class="medicine-image">
                <i class="fas fa-${medicine.image}"></i>
            </div>
            <div class="medicine-info">
                <h4>${medicine.name}</h4>
                <p class="medicine-desc">${medicine.desc}</p>
                <div class="price-row">
                    <span class="price">₹${medicine.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${medicine.name}', ${medicine.price})">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
        medicinesGrid.appendChild(card);
    });
    
    updateCartDisplay();
}

function backToMedicineCategories() {
    document.querySelector('.medicine-categories').style.display = 'block';
    document.getElementById('medicinesList').style.display = 'none';
}

function resetMedicineView() {
    document.querySelector('.medicine-categories').style.display = 'block';
    document.getElementById('medicinesList').style.display = 'none';
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    updateCartDisplay();
    showToast(`${name} added to cart`, 'success');
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartDisplay();
}

function updateQuantity(name, delta) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartSection = document.getElementById('cartSection');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartSection.style.display = 'none';
        return;
    }
    
    cartSection.style.display = 'block';
    cartItems.innerHTML = '';
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price} x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
                <span class="cart-item-price">₹${itemTotal}</span>
                <button class="remove-btn" onclick="removeFromCart('${item.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });
    
    cartTotal.textContent = '₹' + total;
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Save order
    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        status: 'Processing'
    };
    
    let orders = JSON.parse(localStorage.getItem('ayushOrders') || '[]');
    orders.push(order);
    localStorage.setItem('ayushOrders', JSON.stringify(orders));
    
    cart = [];
    updateCartDisplay();
    showToast('Order placed successfully! Your medicines will be delivered soon.', 'success');
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = colors[type] || colors.success;
    toast.innerHTML = `
        <i class="fas fa-${icons[type] || icons.success}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
});
