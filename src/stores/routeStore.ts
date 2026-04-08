import { create } from 'zustand';
import { SavedRoute } from '../types';
import { getAllRoutes, insertRoute, deleteRoute as dbDelete } from '../utils/database';

interface RouteState {
  routes: SavedRoute[];
  loading: boolean;

  loadRoutes: () => Promise<void>;
  addRoute: (route: SavedRoute) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  getRoute: (id: string) => SavedRoute | undefined;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  loading: false,

  loadRoutes: async () => {
    set({ loading: true });
    const routes = await getAllRoutes();
    set({ routes, loading: false });
  },

  addRoute: async (route: SavedRoute) => {
    await insertRoute(route);
    set((s) => ({ routes: [route, ...s.routes] }));
  },

  deleteRoute: async (id: string) => {
    await dbDelete(id);
    set((s) => ({ routes: s.routes.filter((r) => r.id !== id) }));
  },

  getRoute: (id: string) => {
    return get().routes.find((r) => r.id === id);
  },
}));
