import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getReligiousServices = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM religious_services ORDER BY service_time ASC');
    const services = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      venue: r.venue,
      date: r.service_time,
      time: new Date(r.service_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      capacity: r.capacity || 0,
      registered: 0,
      description: r.description,
      denomination: r.denomination,
      organizer: r.organizer || 'Unknown',
    }));
    // Get registration counts
    for (const service of services) {
      const regResult = await query(
        'SELECT COUNT(*) as count FROM service_registrations WHERE service_id = $1',
        [service.id]
      );
      service.registered = parseInt(regResult.rows[0]?.count || '0');
    }
    res.json(services);
  } catch (error) {
    console.error('Get religious services error:', error);
    res.status(500).json({ error: 'Internal server error while fetching services.' });
  }
};

export const getReligiousServiceById = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM religious_services WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    const r = result.rows[0];
    const regResult = await query('SELECT COUNT(*) as count FROM service_registrations WHERE service_id = $1', [r.id]);
    res.json({
      id: r.id,
      name: r.name,
      type: r.type,
      venue: r.venue,
      date: r.service_time,
      time: new Date(r.service_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      capacity: r.capacity || 0,
      registered: parseInt(regResult.rows[0]?.count || '0'),
      description: r.description,
      denomination: r.denomination,
      organizer: r.organizer || 'Unknown',
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createReligiousService = async (req: Request, res: Response) => {
  const { name, type, venue, service_time, denomination, capacity, description, organizer } = req.body;
  if (!name || !service_time) {
    return res.status(400).json({ error: 'Name and service time are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO religious_services (name, type, venue, service_time, denomination, capacity, description, organizer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, type || 'other', venue, service_time, denomination, capacity || 0, description, organizer || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateReligiousService = async (req: Request, res: Response) => {
  const { name, type, venue, service_time, denomination, capacity, description, organizer } = req.body;
  try {
    const result = await query(
      `UPDATE religious_services SET name = COALESCE($1, name), type = COALESCE($2, type),
       venue = COALESCE($3, venue), service_time = COALESCE($4, service_time),
       denomination = COALESCE($5, denomination), capacity = COALESCE($6, capacity),
       description = COALESCE($7, description), organizer = COALESCE($8, organizer)
       WHERE id = $9 RETURNING *`,
      [name, type, venue, service_time, denomination, capacity, description, organizer, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteReligiousService = async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM religious_services WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const registerForService = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { service_id } = req.body;

  if (!service_id) {
    return res.status(400).json({ error: 'Service ID is required.' });
  }

  try {
    const serviceResult = await query('SELECT * FROM religious_services WHERE id = $1', [service_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const existing = await query(
      'SELECT * FROM service_registrations WHERE user_id = $1 AND service_id = $2',
      [userId, service_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this service.' });
    }

    await query(
      'INSERT INTO service_registrations (user_id, service_id) VALUES ($1, $2)',
      [userId, service_id]
    );
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Register for service error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getMyServiceRegistrations = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const result = await query(`
      SELECT rs.*, sr.registration_time
      FROM service_registrations sr
      JOIN religious_services rs ON sr.service_id = rs.id
      WHERE sr.user_id = $1
      ORDER BY rs.service_time ASC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
