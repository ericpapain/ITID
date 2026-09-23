import { Request, Response } from 'express';
import { executeQuery } from '../config/db';

export async function handleTrack(req: Request, res: Response) {
  try {
    const {
      type = 'pageview',
      visitor_token,
      session_token,
      page_url = '/',
      page_path = '/',
      page_title,
      referrer,
      duration_seconds = 0,
      screen_width,
      screen_height,
      language = 'fr',
      event_name,
      event_data,
    } = req.body || {};

    if (!visitor_token || !session_token) {
      return res.status(400).json({ success: false, error: 'Identifiants visiteur/session requis' });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || '';

    // Détection sommaire appareil / navigateur
    let device = 'desktop';
    if (/tablet|ipad/i.test(ua)) device = 'tablet';
    else if (/mobile|iphone|android/i.test(ua)) device = 'mobile';

    let browser = 'Inconnu';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';

    let os = 'Inconnu';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad/i.test(ua)) os = 'iOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    // 1. Visiteur
    let visitorId = 1;
    try {
      const vRows: any = await executeQuery('SELECT id FROM visitors WHERE visitor_token = ?', [visitor_token]);
      if (vRows && vRows.length > 0) {
        visitorId = vRows[0].id;
        await executeQuery(
          'UPDATE visitors SET last_seen_at = NOW(), last_ip_address = ?, total_duration_seconds = total_duration_seconds + ? WHERE id = ?',
          [ip, duration_seconds, visitorId]
        );
      } else {
        const insV: any = await executeQuery(
          `INSERT INTO visitors (visitor_token, first_seen_at, last_seen_at, total_sessions, total_page_views, first_ip_address, last_ip_address, country, country_code, city, device_type, browser, operating_system, language)
           VALUES (?, NOW(), NOW(), 1, 1, ?, ?, 'France', 'FR', 'Troyes', ?, ?, ?, ?)`,
          [visitor_token, ip, ip, device, browser, os, language]
        );
        visitorId = insV?.insertId || 1;
      }
    } catch {}

    // 2. Session
    let sessionId = 1;
    try {
      const sRows: any = await executeQuery('SELECT id FROM visitor_sessions WHERE session_token = ?', [session_token]);
      if (sRows && sRows.length > 0) {
        sessionId = sRows[0].id;
        await executeQuery(
          'UPDATE visitor_sessions SET last_activity_at = NOW(), exit_page = ?, duration_seconds = duration_seconds + ? WHERE id = ?',
          [page_path, duration_seconds, sessionId]
        );
      } else {
        const insS: any = await executeQuery(
          `INSERT INTO visitor_sessions (visitor_id, session_token, started_at, last_activity_at, duration_seconds, page_views, entry_page, exit_page, ip_address, country, country_code, city, region, timezone, device_type, browser, operating_system, screen_width, screen_height, language, referrer, landing_url)
           VALUES (?, ?, NOW(), NOW(), 0, 1, ?, ?, ?, 'France', 'FR', 'Troyes', 'Grand Est', 'Europe/Paris', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [visitorId, session_token, page_path, page_path, ip, device, browser, os, screen_width || null, screen_height || null, language, referrer || null, page_url]
        );
        sessionId = insS?.insertId || 1;
      }
    } catch {}

    // 3. Action
    if (type === 'pageview') {
      try {
        await executeQuery(
          'INSERT INTO page_views (session_id, visitor_id, page_url, page_path, page_title, referrer, entered_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [sessionId, visitorId, page_url, page_path, page_title || null, referrer || null]
        );
        await executeQuery('UPDATE visitor_sessions SET page_views = page_views + 1 WHERE id = ?', [sessionId]);
        await executeQuery('UPDATE visitors SET total_page_views = total_page_views + 1 WHERE id = ?', [visitorId]);
      } catch {}
    } else if (type === 'leave') {
      try {
        await executeQuery(
          'UPDATE page_views SET left_at = NOW(), duration_seconds = ? WHERE session_id = ? ORDER BY entered_at DESC LIMIT 1',
          [duration_seconds, sessionId]
        );
        await executeQuery('UPDATE visitor_sessions SET last_activity_at = NOW(), exit_page = ? WHERE id = ?', [page_path, sessionId]);
      } catch {}
    } else if (type === 'event') {
      try {
        await executeQuery(
          'INSERT INTO visitor_events (visitor_id, session_id, event_name, event_data, page_url) VALUES (?, ?, ?, ?, ?)',
          [visitorId, sessionId, event_name || 'click', event_data ? JSON.stringify(event_data) : null, page_url]
        );
      } catch {}
    }

    return res.json({ success: true, visitor_id: visitorId, session_id: sessionId });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAnalyticsOverview(req: Request, res: Response) {
  try {
    let todayVisitors = 0;
    let weekVisitors = 0;
    let monthVisitors = 0;
    let uniqueVisitors = 0;
    let totalSessions = 0;
    let totalPages = 0;
    let avgDuration = 0;
    let activeNow = 0;
    let activeSessions: any[] = [];

    try {
      const vToday: any = await executeQuery('SELECT COUNT(DISTINCT visitor_id) as total FROM visitor_sessions WHERE DATE(started_at) = CURDATE()');
      todayVisitors = vToday[0]?.total || 0;

      const vWeek: any = await executeQuery('SELECT COUNT(DISTINCT visitor_id) as total FROM visitor_sessions WHERE started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
      weekVisitors = vWeek[0]?.total || 0;

      const vMonth: any = await executeQuery('SELECT COUNT(DISTINCT visitor_id) as total FROM visitor_sessions WHERE started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
      monthVisitors = vMonth[0]?.total || 0;

      const vUnique: any = await executeQuery('SELECT COUNT(*) as total FROM visitors');
      uniqueVisitors = vUnique[0]?.total || 0;

      const sTotal: any = await executeQuery('SELECT COUNT(*) as total FROM visitor_sessions');
      totalSessions = sTotal[0]?.total || 0;

      const pTotal: any = await executeQuery('SELECT COUNT(*) as total FROM page_views');
      totalPages = pTotal[0]?.total || 0;

      const aDur: any = await executeQuery('SELECT AVG(duration_seconds) as avg_dur FROM visitor_sessions WHERE duration_seconds > 0');
      avgDuration = Math.round(Number(aDur[0]?.avg_dur || 0));

      const aNow: any = await executeQuery('SELECT COUNT(DISTINCT visitor_id) as total FROM visitor_sessions WHERE last_activity_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)');
      activeNow = aNow[0]?.total || 0;

      activeSessions = await executeQuery(`
        SELECT s.id, s.ip_address, s.country, s.country_code, s.city, s.device_type, s.browser, s.exit_page as current_page, s.last_activity_at, v.visitor_token
        FROM visitor_sessions s
        LEFT JOIN visitors v ON s.visitor_id = v.id
        WHERE s.last_activity_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ORDER BY s.last_activity_at DESC
        LIMIT 10
      `);
    } catch {}

    return res.json({
      success: true,
      kpis: {
        visitors_today: todayVisitors,
        visitors_week: weekVisitors,
        visitors_month: monthVisitors,
        unique_visitors: uniqueVisitors,
        total_sessions: totalSessions,
        page_views: totalPages,
        avg_duration_seconds: avgDuration,
        pages_per_session: totalSessions > 0 ? Number((totalPages / totalSessions).toFixed(1)) : 0,
        active_now: activeNow,
      },
      active_sessions: activeSessions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAnalyticsTimeseries(req: Request, res: Response) {
  const range = (req.query.range as string) || '7d';
  let days = 7;
  if (range === 'today') days = 1;
  else if (range === 'yesterday') days = 2;
  else if (range === '30d') days = 30;
  else if (range === '90d') days = 90;

  try {
    const points = await executeQuery(`
      SELECT DATE_FORMAT(started_at, '%Y-%m-%d') as label,
             COUNT(DISTINCT visitor_id) as visitors,
             COUNT(id) as sessions,
             COALESCE(SUM(page_views), 0) as page_views
      FROM visitor_sessions
      WHERE started_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY label
      ORDER BY label ASC
    `, [days]);

    return res.json({ success: true, range, data: points });
  } catch (e: any) {
    return res.json({ success: true, range, data: [] });
  }
}

export async function getAnalyticsTopPages(req: Request, res: Response) {
  try {
    const pages = await executeQuery(`
      SELECT page_path,
             MAX(page_title) as page_title,
             COUNT(id) as views,
             COUNT(DISTINCT visitor_id) as unique_visitors,
             ROUND(AVG(duration_seconds)) as avg_duration
      FROM page_views
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 15
    `);
    return res.json({ success: true, data: pages });
  } catch {
    return res.json({ success: true, data: [] });
  }
}

export async function getAnalyticsGeo(req: Request, res: Response) {
  try {
    const countries = await executeQuery(`
      SELECT country, country_code, COUNT(DISTINCT visitor_id) as visitors
      FROM visitor_sessions
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country, country_code
      ORDER BY visitors DESC
      LIMIT 10
    `);
    const cities = await executeQuery(`
      SELECT city, country, COUNT(DISTINCT visitor_id) as visitors
      FROM visitor_sessions
      WHERE city IS NOT NULL AND city != '' AND city != 'Inconnue'
      GROUP BY city, country
      ORDER BY visitors DESC
      LIMIT 10
    `);
    return res.json({ success: true, countries, cities });
  } catch {
    return res.json({ success: true, countries: [], cities: [] });
  }
}

export async function getAnalyticsDevices(req: Request, res: Response) {
  try {
    const devices = await executeQuery(`
      SELECT device_type, COUNT(*) as count
      FROM visitor_sessions
      WHERE device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY count DESC
    `);
    const browsers = await executeQuery(`
      SELECT browser, COUNT(*) as count
      FROM visitor_sessions
      WHERE browser IS NOT NULL AND browser != 'Inconnu'
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 6
    `);
    const os = await executeQuery(`
      SELECT operating_system, COUNT(*) as count
      FROM visitor_sessions
      WHERE operating_system IS NOT NULL AND operating_system != 'Inconnu'
      GROUP BY operating_system
      ORDER BY count DESC
      LIMIT 6
    `);
    return res.json({ success: true, devices, browsers, operating_systems: os });
  } catch {
    return res.json({ success: true, devices: [], browsers: [], operating_systems: [] });
  }
}

export async function getAnalyticsVisitors(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    const rows = await executeQuery(`
      SELECT id, visitor_token, first_seen_at, last_seen_at, total_sessions, total_page_views, total_duration_seconds,
             last_ip_address, country, country_code, city, device_type, browser, operating_system, language
      FROM visitors
      ORDER BY last_seen_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const countRes: any = await executeQuery('SELECT COUNT(*) as total FROM visitors');
    const total = countRes[0]?.total || 0;

    return res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch {
    return res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  }
}

export async function getVisitorDetail(req: Request, res: Response) {
  try {
    const vId = parseInt(req.params.id, 10);
    const vRows: any = await executeQuery('SELECT * FROM visitors WHERE id = ?', [vId]);
    if (!vRows || vRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Visiteur non trouvé' });
    }

    const visitor = vRows[0];
    const sessions: any = await executeQuery('SELECT * FROM visitor_sessions WHERE visitor_id = ? ORDER BY started_at DESC LIMIT 20', [vId]);

    for (const sess of sessions) {
      sess.pages_journey = await executeQuery(
        'SELECT id, page_path, page_title, page_url, referrer, entered_at, left_at, duration_seconds FROM page_views WHERE session_id = ? ORDER BY entered_at ASC',
        [sess.id]
      );
    }

    return res.json({ success: true, visitor, sessions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
