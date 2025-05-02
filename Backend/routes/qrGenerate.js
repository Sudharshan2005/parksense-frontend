import { Router } from 'express';
import QRCode from 'qrcode';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const qrDataURL = await QRCode.toDataURL(url);
    res.json({ qr: qrDataURL });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;
