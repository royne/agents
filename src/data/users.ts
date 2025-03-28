interface User {
  username: string;
  password: string;
  role: string;
}

export const USERS: Record<string, User> = {
  royne: {
    username: 'royne',
    password: 'royne123',
    role: 'admin'
  },
  karen: {
    username: 'karen',
    password: 'karen123',
    role: 'user'
  },
  juan: {
    username: 'juan',
    password: 'juan123',
    role: 'user'
  }
};
