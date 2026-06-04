// NOTE: Reservation, ContractAcceptance, and Notification models are not yet
// implemented at this point. Each section below is marked with TODO comments so this
// file can be expanded once Courtney adds those models.
// The dashboard route is functional now and will return richer data
// as each model is added.

// GET /dashboard
// Returns the current user's full activity summary:
// - Their reservations (TODO: expand when Reservation model is ready)
// - Their accepted contracts (TODO: expand when ContractAcceptance model is ready)
// - Their unread notifications (TODO: expand when Notification model is ready)
const getDashboard = async (request, response, next) => {
  try {
    const userId = request.user.id;

    // TODO: Replace with real query once Reservation model exists
    // const reservations = await Reservation.find({ user: userId })
    //   .populate('item', 'name imageUrl price')
    //   .sort({ createdAt: -1 });
    const reservations = [];

    // TODO: Replace with real query once ContractAcceptance model exists
    // const acceptances = await ContractAcceptance.find({ user: userId })
    //   .populate('contract', 'title rewardDescription startAt endAt')
    //   .sort({ createdAt: -1 });
    const acceptances = [];

    // TODO: Replace with real query once Notification model exists
    // const notifications = await Notification.find({ user: userId, isRead: false })
    //   .sort({ createdAt: -1 });
    const notifications = [];

    return response.status(200).json({
      userId,
      reservations,
      acceptances,
      notifications,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getDashboard };
