import { Request, Response, NextFunction } from 'express';
import { MarketService } from './market.service';

export async function getMarketRates(req: Request, res: Response, next: NextFunction) {
  try {
    const rates = await MarketService.getRates();
    res.json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
}

export async function getMarketSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = MarketService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateMarketSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = MarketService.updateSettings(req.body);
    res.json({
      success: true,
      message: 'Pengaturan market widget berhasil disimpan',
      data: settings
    });
  } catch (error) {
    next(error);
  }
}
