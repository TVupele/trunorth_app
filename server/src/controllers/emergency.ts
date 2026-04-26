import { Request, Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../types/express';

export const getEmergencyReports = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  try {
    const result = await query(
      'SELECT * FROM emergency_reports WHERE reporter_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const reports = result.rows.map(r => ({
      id: r.id,
      type: r.type,
      priority: r.priority,
      location: r.location_description,
      coordinates: r.latitude && r.longitude ? { lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) } : undefined,
      description: r.description,
      status: r.status,
      timestamp: r.created_at,
      reporterId: r.reporter_id,
      photos: r.photos || [], // Assuming photos is a JSONB/array column
    }));
    res.json(reports);
  } catch (error) {
    console.error('Get emergency reports error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createEmergencyReport = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const { type, priority, location, latitude, longitude, description } = req.body;
  if (!type || !description) {
    return res.status(400).json({ error: 'Type and description are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO emergency_reports (reporter_id, type, priority, location_description, latitude, longitude, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, type, priority || 'medium', location, latitude || null, longitude || null, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create emergency report error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateEmergencyReportStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const result = await query(
      'UPDATE emergency_reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update emergency report error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
