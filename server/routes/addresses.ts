import type { FastifyInstance } from 'fastify';
import { sendError } from '../http.js';
import { prisma } from '../prisma.js';
import { getSessionUser } from '../services/session.js';
import { isIndianMobile, normalizePhone } from '../../shared/otp/otpEngine.js';

const PIN = /^\d{6}$/;

function validateAddress(body: Record<string, string>) {
  const fullName = String(body.fullName ?? '').trim();
  const phone = normalizePhone(String(body.phone ?? ''));
  const line1 = String(body.line1 ?? '').trim();
  const house = String(body.house ?? '').trim();
  const city = String(body.city ?? '').trim();
  const state = String(body.state ?? '').trim();
  const pincode = String(body.pincode ?? '').trim();
  if (fullName.length < 2) throw Object.assign(new Error('Enter your full name'), { statusCode: 400, code: 'INVALID_NAME' });
  if (!isIndianMobile(phone)) throw Object.assign(new Error('Enter a valid phone number'), { statusCode: 400, code: 'INVALID_PHONE' });
  if (line1.length < 4) throw Object.assign(new Error('Enter a valid address line'), { statusCode: 400, code: 'INVALID_ADDRESS' });
  if (house.length < 1) throw Object.assign(new Error('Enter house / apartment'), { statusCode: 400, code: 'INVALID_HOUSE' });
  if (city.length < 2) throw Object.assign(new Error('Enter city'), { statusCode: 400, code: 'INVALID_CITY' });
  if (state.length < 2) throw Object.assign(new Error('Enter state'), { statusCode: 400, code: 'INVALID_STATE' });
  if (!PIN.test(pincode)) throw Object.assign(new Error('Enter a 6-digit pincode'), { statusCode: 400, code: 'INVALID_PINCODE' });
  return { fullName, phone, line1, house, city, state, pincode };
}

export async function addressRoutes(app: FastifyInstance) {
  app.get('/api/addresses', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in to manage addresses');
    const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    return { addresses };
  });

  app.post('/api/addresses', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in to save an address');
    try {
      const data = validateAddress(request.body as Record<string, string>);
      const address = await prisma.address.create({ data: { ...data, userId: user.id } });
      return { address };
    } catch (error) {
      const err = error as { statusCode?: number; code?: string; message: string };
      return sendError(reply, err.statusCode ?? 500, err.code ?? 'ADDRESS_ERROR', err.message);
    }
  });

  app.patch('/api/addresses/:id', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in required');
    const id = (request.params as { id: string }).id;
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) return sendError(reply, 404, 'NOT_FOUND', 'Address not found');
    try {
      const data = validateAddress(request.body as Record<string, string>);
      const address = await prisma.address.update({ where: { id }, data });
      return { address };
    } catch (error) {
      const err = error as { statusCode?: number; code?: string; message: string };
      return sendError(reply, err.statusCode ?? 500, err.code ?? 'ADDRESS_ERROR', err.message);
    }
  });

  app.delete('/api/addresses/:id', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in required');
    const id = (request.params as { id: string }).id;
    await prisma.address.deleteMany({ where: { id, userId: user.id } });
    return { ok: true };
  });
}
