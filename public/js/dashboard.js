const maintenanceToggle = document.getElementById('maintenance-toggle');
const maintenanceStatus = document.querySelector('.status-chip');
const maintenanceRoute = document.getElementById('maintenance-route');
const maintenanceNote = document.getElementById('maintenance-note');

if (maintenanceToggle && maintenanceStatus) {
    maintenanceToggle.addEventListener('click', () => {
        const isOn = maintenanceStatus.classList.contains('maintenance-on');

        if (isOn) {
            maintenanceStatus.classList.remove('maintenance-on');
            maintenanceStatus.classList.add('maintenance-off');
            maintenanceStatus.textContent = 'Offline';
            maintenanceToggle.textContent = 'Enable maintenance';
            maintenanceNote.textContent = 'Leave blank to simply pause new bookings.';
        } else {
            maintenanceStatus.classList.remove('maintenance-off');
            maintenanceStatus.classList.add('maintenance-on');
            maintenanceStatus.textContent = 'Online';
            maintenanceToggle.textContent = 'Disable maintenance';
            if (maintenanceRoute && maintenanceRoute.value.trim()) {
                maintenanceNote.textContent = `Redirecting new bookings to ${maintenanceRoute.value.trim()}`;
            } else {
                maintenanceNote.textContent = 'Bookings are paused without redirect.';
            }
        }
    });
}

const notificationButton = document.querySelector('.notification-btn');
const notificationBadge = document.getElementById('notification-badge');
const bookingListBody = document.getElementById('booking-list');
const bookingModal = document.getElementById('booking-modal');
const closeBookingModal = document.getElementById('close-booking-modal');
const modalName = document.getElementById('modal-name');
const modalEmail = document.getElementById('modal-email');
const modalPhone = document.getElementById('modal-phone');
const modalService = document.getElementById('modal-service');
const modalDate = document.getElementById('modal-date');
const modalTime = document.getElementById('modal-time');
const modalMessage = document.getElementById('modal-message');
const menuToggle = document.querySelector('.menu-toggle');
const mobileOverlay = document.querySelector('.mobile-nav-overlay');
const sidebar = document.querySelector('.sidebar');

const updateNotificationBadge = (count) => {
    if (!notificationBadge) return;
    if (count > 0) {
        notificationBadge.textContent = count;
        notificationBadge.style.display = 'block';
    } else {
        notificationBadge.textContent = '';
        notificationBadge.style.display = 'none';
    }
};

const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const formatDate = (rawDate) => {
    if (!rawDate) return '';
    const date = new Date(rawDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const renderBookings = (bookings) => {
    if (!bookingListBody) return;

    if (!bookings || bookings.length === 0) {
        bookingListBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">No bookings found.</td>
            </tr>
        `;
        return;
    }

    bookingListBody.innerHTML = bookings.map((booking) => {
        const bookedDate = booking.date ? formatDate(booking.date) : '';
        const bookedTime = booking.time || '';
        const statusLabel = booking.viewed ? 'Read' : 'Unread';
        const statusClass = booking.viewed ? 'confirmed' : 'pending';

        return `
            <tr data-booking-id="${booking.id}">
                <td>${booking.name || ''}</td>
                <td>${booking.email || ''}</td>
                <td>${booking.phone || ''}</td>
                <td>${booking.service || ''}</td>
                <td>${bookedDate}</td>
                <td>${bookedTime}</td>
                <td class="message-cell">${truncateText(booking.message, 40)}</td>
                <td><span class="status ${statusClass}">${statusLabel}</span></td>
                <td class="table-actions">
                    <button class="table-action approve" type="button" title="Approve booking"><i class="fas fa-check"></i></button>
                    <button class="table-action reject" type="button" title="Delete booking"><i class="fas fa-times"></i></button>
                    <a href="#" class="table-action view">View Booking</a>
                </td>
            </tr>
        `;
    }).join('');
};

const fetchUnreadCount = async () => {
    try {
        const response = await fetch('/admin/api/bookings/unread-count');
        if (!response.ok) throw new Error('Unable to fetch unread count');
        const data = await response.json();
        updateNotificationBadge(data.unreadCount || 0);
    } catch (error) {
        console.error('Notification badge error:', error);
    }
};

const fetchBookings = async () => {
    try {
        const response = await fetch('/admin/api/bookings');
        if (!response.ok) throw new Error('Unable to fetch bookings');
        const data = await response.json();
        renderBookings(data);
    } catch (error) {
        console.error('Booking load error:', error);
        if (bookingListBody) {
            bookingListBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-row">Unable to load bookings.</td>
                </tr>
            `;
        }
    }
};

const fetchBookingDetails = async (id) => {
    try {
        const response = await fetch(`/admin/api/bookings/${id}`);
        if (!response.ok) throw new Error('Unable to fetch booking details');
        return await response.json();
    } catch (error) {
        console.error('Booking detail error:', error);
        return null;
    }
};

const approveBooking = async (id) => {
    try {
        const response = await fetch(`/admin/api/bookings/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Unable to approve booking');
        await fetchUnreadCount();
        await fetchBookings();
    } catch (error) {
        console.error('Approve booking error:', error);
    }
};

const deleteBooking = async (id) => {
    try {
        const response = await fetch(`/admin/api/bookings/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Unable to delete booking');
        await fetchUnreadCount();
        await fetchBookings();
    } catch (error) {
        console.error('Delete booking error:', error);
    }
};

const openModal = () => {
    if (!bookingModal) return;
    bookingModal.classList.remove('hidden');
};

const closeModal = () => {
    if (!bookingModal) return;
    bookingModal.classList.add('hidden');
};

const showBookingModal = async (id) => {
    const booking = await fetchBookingDetails(id);
    if (!booking) return;
    modalName.textContent = booking.name || 'N/A';
    modalEmail.textContent = booking.email || 'N/A';
    modalPhone.textContent = booking.phone || 'N/A';
    modalService.textContent = booking.service || 'N/A';
    modalDate.textContent = formatDate(booking.date);
    modalTime.textContent = booking.time || 'N/A';
    modalMessage.textContent = booking.message || 'No message provided.';
    openModal();
    await fetchUnreadCount();
    await fetchBookings();
};

const markNotificationsRead = async () => {
    try {
        const response = await fetch('/admin/api/bookings/read-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Unable to update notifications');
        await fetchUnreadCount();
        await fetchBookings();
    } catch (error) {
        console.error('Mark read error:', error);
    }
};

if (notificationButton) {
    notificationButton.addEventListener('click', async () => {
        await markNotificationsRead();
    });
}

if (bookingListBody) {
    bookingListBody.addEventListener('click', async (event) => {
        event.preventDefault();
        const target = event.target.closest('button, a');
        if (!target) return;
        const row = target.closest('tr');
        const id = row?.dataset.bookingId;
        if (!id) return;

        if (target.classList.contains('approve')) {
            await approveBooking(id);
        }

        if (target.classList.contains('reject')) {
            const confirmed = window.confirm('Delete this booking? This cannot be undone.');
            if (confirmed) {
                await deleteBooking(id);
            }
        }

        if (target.classList.contains('view')) {
            await showBookingModal(id);
        }
    });
}

if (closeBookingModal) {
    closeBookingModal.addEventListener('click', closeModal);
}

if (bookingModal) {
    bookingModal.addEventListener('click', (event) => {
        if (event.target === bookingModal || event.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });
}

if (menuToggle && sidebar && mobileOverlay) {
    const closeMobileNav = () => {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('visible');
        menuToggle.querySelector('i').classList.remove('fa-times');
        menuToggle.querySelector('i').classList.add('fa-bars');
    };

    const openMobileNav = () => {
        sidebar.classList.add('mobile-open');
        mobileOverlay.classList.add('visible');
        menuToggle.querySelector('i').classList.remove('fa-bars');
        menuToggle.querySelector('i').classList.add('fa-times');
    };

    menuToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('mobile-open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    mobileOverlay.addEventListener('click', closeMobileNav);
}

fetchUnreadCount();
fetchBookings();

const POLL_INTERVAL = 15000;
setInterval(() => {
    fetchUnreadCount();
    fetchBookings();
}, POLL_INTERVAL);


