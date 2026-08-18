import { Msg91Credentials } from './types';

// Mocked storage for now, similar to previous implementation
export const getSavedMsg91Credentials = (): Msg91Credentials => {
  const saved = localStorage.getItem('msg91_creds');
  return saved ? JSON.parse(saved) : {
    authKey: '',
    templateId: '',
    senderId: '',
    connectionStatus: 'untested'
  };
};

export const saveMsg91Credentials = (creds: Msg91Credentials) => {
  localStorage.setItem('msg91_creds', JSON.stringify(creds));
};
