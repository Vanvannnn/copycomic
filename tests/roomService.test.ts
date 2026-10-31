import { describe, expect, it } from 'vitest';
import { readFirebaseConfig } from '../src/services/firebaseConfig';
import { createRoomService } from '../src/services/roomService';

const FAKE_ENV = {
  VITE_FIREBASE_API_KEY: 'fake-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'fake.example.test',
  VITE_FIREBASE_PROJECT_ID: 'fake-project',
  VITE_FIREBASE_APP_ID: 'fake-app',
};

describe('readFirebaseConfig', () => {
  it('détecte une configuration absente ou vide', () => {
    const status = readFirebaseConfig({ VITE_FIREBASE_API_KEY: '  ' });
    expect(status.configured).toBe(false);
    if (!status.configured) expect(status.missing).toContain('VITE_FIREBASE_API_KEY');
  });

  it('détecte une configuration complète', () => {
    expect(readFirebaseConfig(FAKE_ENV).configured).toBe(true);
  });
});

describe('RoomService', () => {
  it('renvoie FIREBASE_NOT_CONFIGURED sans configuration', async () => {
    const service = createRoomService(readFirebaseConfig({}));
    const created = await service.createRoom('Hôte');
    const joined = await service.joinRoom('ABCD', 'Moi');
    expect(created).toMatchObject({ ok: false, error: { code: 'FIREBASE_NOT_CONFIGURED' } });
    expect(joined).toMatchObject({ ok: false, error: { code: 'FIREBASE_NOT_CONFIGURED' } });
    expect(service.checkAvailability()).toMatchObject({ ok: false, error: { code: 'FIREBASE_NOT_CONFIGURED' } });
  });

  it('ne simule jamais de succès quand Firebase paraît configurée', async () => {
    const service = createRoomService(readFirebaseConfig(FAKE_ENV));
    expect(await service.createRoom('Hôte')).toMatchObject({ ok: false, error: { code: 'MULTIPLAYER_NOT_IMPLEMENTED' } });
    expect(await service.joinRoom('ABCD', 'Moi')).toMatchObject({ ok: false, error: { code: 'MULTIPLAYER_NOT_IMPLEMENTED' } });
    expect(await service.joinRoom('!', 'Moi')).toMatchObject({ ok: false, error: { code: 'INVALID_ROOM_CODE' } });
  });
});
