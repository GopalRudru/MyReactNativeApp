import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as NavigationService from '..//../navigation/NavigationService'
import { setSessionExpired } from '../../services/redux/slices/authSlice'
import navigationStrings from '../../constant/navigationStrings'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SessionTimeoutHandler() {
  const sessionExpired = useSelector((state) => state.auth.sessionExpired);
  const dispatch = useDispatch();

  useEffect(() => {
    if (sessionExpired) {
      // Navigate once on session expiry
      NavigationService.resetTo(navigationStrings.SESSION_TIMEOUT);
    }
  }, [sessionExpired]);

  return null;
}