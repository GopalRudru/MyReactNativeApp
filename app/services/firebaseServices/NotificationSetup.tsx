import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { notificationListener } from '../firebaseServices/NotificationServices'

const NotificationSetup = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    notificationListener(dispatch);
  }, [dispatch]);
  return null;
};

export default NotificationSetup;