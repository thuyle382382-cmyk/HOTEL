const PhieuGiaHan = require("../models/PhieuGiaHan");
const DatPhong = require("../models/DatPhong");
const KhachHang = require("../models/KhachHang");

// Get extension requests for a guest
exports.getExtensionRequestsForGuest = async (req, res) => {
  try {
    const guestId = req.user.id;
    const khachHang = await KhachHang.findOne({ TaiKhoan: guestId });
    
    if (!khachHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    const requests = await PhieuGiaHan.find({ KhachHang: khachHang._id })
      .populate('DatPhong', 'MaDatPhong NgayDen NgayDi TrangThai')
      .sort({ NgayTao: -1 });
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy yêu cầu gia hạn',
      error: error.message
    });
  }
};

// Create extension request by guest
exports.createExtensionRequest = async (req, res) => {
  try {
    const { DatPhong: datPhongId, NgayDiMoi, LyDo } = req.body;
    const guestId = req.user.id;

    if (!datPhongId || !NgayDiMoi || !LyDo) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin yêu cầu gia hạn'
      });
    }

    // Get customer info
    const khachHang = await KhachHang.findOne({ TaiKhoan: guestId });
    if (!khachHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    // Check if booking exists and belongs to this customer
    const booking = await DatPhong.findById(datPhongId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }

    if (booking.KhachHang.toString() !== khachHang._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền gia hạn đặt phòng này'
      });
    }

    // Check if booking is checked in
    if (booking.TrangThai !== 'CheckedIn') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể gia hạn khi đã check-in'
      });
    }

    // Validate new checkout date must be after current checkout date
    const newCheckoutDate = new Date(NgayDiMoi);
    const currentCheckoutDate = new Date(booking.NgayDi);
    
    if (newCheckoutDate <= currentCheckoutDate) {
      return res.status(400).json({
        success: false,
        message: 'Ngày checkout mới phải sau ngày checkout hiện tại'
      });
    }

    // Get next MaPGH
    const lastRecord = await PhieuGiaHan.findOne().sort({ MaPGH: -1 });
    let nextId = 1;
    if (lastRecord && lastRecord.MaPGH) {
      const match = lastRecord.MaPGH.match(/PGH(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    const MaPGH = `PGH${String(nextId).padStart(3, '0')}`;

    const request = new PhieuGiaHan({
      MaPGH,
      DatPhong: datPhongId,
      KhachHang: khachHang._id,
      NgayDenCu: booking.NgayDen,
      NgayDiCu: booking.NgayDi,
      NgayDiMoi: newCheckoutDate,
      LyDo,
      TrangThai: 'Pending'
    });

    await request.save();
    await request.populate('DatPhong', 'MaDatPhong NgayDen NgayDi');

    // Create notification for guest
    const notificationController = require('./notificationController');
    await notificationController.createNotification(
      guestId,
      'Yêu cầu gia hạn phòng đã gửi',
      `Yêu cầu gia hạn ${MaPGH} đã được gửi. Chúng tôi sẽ xem xét và phản hồi sớm nhất.`,
      'Extension'
    );

    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu gia hạn thành công',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi yêu cầu gia hạn',
      error: error.message
    });
  }
};

// Get all extension requests (for staff/admin)
exports.getAllExtensionRequests = async (req, res) => {
  try {
    const requests = await PhieuGiaHan.find()
      .populate('DatPhong', 'MaDatPhong NgayDen NgayDi TrangThai')
      .populate('KhachHang', 'HoTen SoDT Email')
      .sort({ NgayTao: -1 });
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách yêu cầu gia hạn',
      error: error.message
    });
  }
};

// Approve/Reject extension request (for staff/admin)
exports.updateExtensionRequest = async (req, res) => {
  try {
    const { TrangThai } = req.body;
    const requestId = req.params.id;

    if (!TrangThai || !['Approved', 'Rejected'].includes(TrangThai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const request = await PhieuGiaHan.findById(requestId)
      .populate('DatPhong')
      .populate('KhachHang');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu gia hạn'
      });
    }

    if (request.TrangThai !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu này đã được xử lý'
      });
    }

    request.TrangThai = TrangThai;
    await request.save();

    // If approved, update booking checkout date
    if (TrangThai === 'Approved') {
      const booking = await DatPhong.findById(request.DatPhong._id);
      if (booking) {
        booking.NgayDi = request.NgayDiMoi;
        await booking.save();
      }
    }

    // Create notification for guest
    const notificationController = require('./notificationController');
    const taiKhoan = request.KhachHang.TaiKhoan;
    const message = TrangThai === 'Approved' 
      ? `Yêu cầu gia hạn ${request.MaPGH} đã được chấp nhận. Ngày checkout mới: ${request.NgayDiMoi.toLocaleDateString('vi-VN')}`
      : `Yêu cầu gia hạn ${request.MaPGH} đã bị từ chối. Vui lòng liên hệ lễ tân để biết thêm chi tiết.`;
    
    await notificationController.createNotification(
      taiKhoan,
      TrangThai === 'Approved' ? 'Yêu cầu gia hạn đã được chấp nhận' : 'Yêu cầu gia hạn đã bị từ chối',
      message,
      'Extension'
    );

    res.status(200).json({
      success: true,
      message: `Yêu cầu gia hạn đã ${TrangThai === 'Approved' ? 'được chấp nhận' : 'bị từ chối'}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật yêu cầu gia hạn',
      error: error.message
    });
  }
};

