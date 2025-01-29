import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Badge,
  IconButton,
  Drawer,
  Box
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  EventAvailable,
  Star,
  Schedule
} from '@mui/icons-material';
import axios from 'axios';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Notifications fetch failed:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axios.put(`/api/notifications/${notification._id}/read`);
        setUnreadCount(prev => prev - 1);
        
        // Redirect based on notification type
        switch (notification.type) {
          case 'APPOINTMENT_REMINDER':
            // Appointment detail page
            break;
          case 'REVIEW_REQUEST':
            // Review form page
            break;
          case 'INCOMPLETE_APPOINTMENT':
            // Appointment creation page
            break;
        }
      } catch (error) {
        console.error('Notification marking error:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return <Schedule color="primary" />;
      case 'REVIEW_REQUEST':
        return <Star color="secondary" />;
      case 'INCOMPLETE_APPOINTMENT':
        return <EventAvailable color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <>
      <IconButton onClick={() => setIsDrawerOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Bildirimler
          </Typography>
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover'
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationList; 