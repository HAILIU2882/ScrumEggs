
import {
  atom,
} from 'recoil';

// Global constants that persist in the application and being reset in different components

export const taskRows = atom({
  key: 'taskRows',
  default: [],
});

export const openState = atom({
  key: 'openState',
  default: false,
});

export const currentRows = atom({
  key: 'currentRows',
  default: [],
});

export const buttonSelect = atom({
  key: 'buttonSelect',
  default: 0,
});

export const prevButtonSelect = atom({
  key: 'prevButtonSelect',
  default: 0,
});

export const invisible = atom({
  key: 'invisible',
  default: true,
});

export const invitations = atom({
  key: 'invitations',
  default: 0,
});

export const sideBarOpen = atom({
  key: 'sideBarOpen',
  default: false,
});

export const defaultPageSize = atom({
  key: 'defaultPageSize',
  default: 10,
});
