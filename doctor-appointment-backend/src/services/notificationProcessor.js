
async function processIncompleteAppointmentReminder(notification) {
  const { userId, doctorId, lastStep } = notification;
  
  const user = await User.findById(userId);
  const doctor = await Doctor.findById(doctorId);

  if (!user || !doctor) {
    logger.error('User or doctor not found for incomplete appointment reminder');
    return;
  }

  let message = '';
  let actionUrl = '';

  switch (lastStep) {
    case 'doctor_selected':
      message = `Continue booking your appointment with Dr. ${doctor.fullName}`;
      actionUrl = `/book-appointment/${doctorId}`;
      break;
    case 'slot_selected':
      message = `Complete your appointment booking with Dr. ${doctor.fullName}`;
      actionUrl = `/book-appointment/${doctorId}`;
      break;
    default:
      message = `You have an incomplete appointment booking with Dr. ${doctor.fullName}`;
      actionUrl = `/book-appointment/${doctorId}`;
  }

  // Send email
  await sendEmail({
    to: user.email,
    subject: 'Complete Your Appointment Booking',
    template: 'incomplete-appointment',
    context: {
      userName: user.name,
      doctorName: doctor.fullName,
      message,
      actionUrl: `${process.env.FRONTEND_URL}${actionUrl}`
    }
  });

  // Send push notification
  if (user.pushSubscription) {
    await sendPushNotification(user.pushSubscription, {
      title: 'Complete Your Appointment Booking',
      body: message,
      url: actionUrl
    });
  }
} 