import pool from '../config/db.js';

export const homePageController = (req, res) => {
  try {
     res.render("index.ejs");
  } catch (error) {
      console.error('Error fetching data from database', error);
  }
}

export const adminLoginController = (req, res) => {
   try {
    res.render("auth.ejs");
   } catch(error) {
    console.error('Error rendering admin login page', error);
   }
   }

   export const adminDashboardController = (req, res) => {
    try {
     res.render("dashboard.ejs");
    } catch(error) {
     console.error('Error rendering admin dashboard page', error);
    }
  }

  export const bookingController = async (req, res) => {
    try {
      const {name, email, phone, service, date, time, message} = req.body;

      await pool.query('INSERT INTO appointments (name, email, phone, service, date, time, message) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, email, phone, service, date, time, message]);

      res.json({success: true, message: "Appointment booked successfully!"});

    } catch(error) {
      console.error('Error rendering booking page', error);
    }
  }

// GET /api/bookings/unread-count
export const getUnreadCount = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT COUNT(*) FROM appointments WHERE viewed = FALSE'
        );
        res.json({ unreadCount: parseInt(result.rows[0].count) });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

// GET /api/bookings
export const getBookings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM appointments ORDER BY viewed ASC, id DESC'
        );
        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/bookings/read-all
export const markAllNotificationsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE appointments SET viewed = TRUE, viewed_at = NOW() WHERE viewed = FALSE'
        );

        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        await pool.query('UPDATE appointments SET viewed = TRUE, viewed_at = NOW() WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

// POST /api/bookings/:id/approve
export const approveBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE appointments SET viewed = TRUE, viewed_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        );
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ success: true, message: 'Booking approved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ success: true, message: 'Booking deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}