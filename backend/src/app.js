const express =require('express');
const cookieParser=require('cookie-parser');
const helmet=require('helmet');
const authRoutes=require('./routes/auth.route');
const announcementRoutes=require('./routes/announcement.route');
const galleryRoutes=require('./routes/gallery.route');
const inquiryRoutes=require('./routes/inquiry.route');

const app=express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && origin !== frontendOrigin && !['GET', 'HEAD'].includes(req.method)) {
        return res.sendStatus(403);
    }
    if (origin === frontendOrigin) {
        res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(origin === frontendOrigin ? 204 : 403);
    next();
});

app.use('/api/auth',authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    const status = error.status === 413 || error.code === 'LIMIT_FILE_SIZE'
        ? 413
        : (error.status === 400 || error.code?.startsWith('LIMIT_') ? 400 : 500);
    const message = status === 413
        ? 'Request or image is too large (maximum image size is 5 MB).'
        : (status === 400 ? 'Invalid request' : 'Internal server error');
    if (status === 500) console.error('Request failed:', error);
    res.status(status).json({ message });
});

module.exports=app;
