const DatPhong = require('../models/DatPhong');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await DatPhong.find()
      .populate('KhachHang', 'HoTen SoDT Email')
      .populate('ChiTietDatPhong.Phong');
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đặt phòng thành công',
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đặt phòng',
      error: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await DatPhong.findById(req.params.id)
      .populate('KhachHang', 'HoTen SoDT Email')
      .populate('ChiTietDatPhong.Phong');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Đặt phòng không tồn tại'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin đặt phòng thành công',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin đặt phòng',
      error: error.message
    });
  }
};

// Get bookings by customer ID
exports.getBookingsByCustomerId = async (req, res) => {
  try {
    const bookings = await DatPhong.find({ KhachHang: req.params.customerId })
      .populate('KhachHang', 'HoTen SoDT Email')
      .populate('ChiTietDatPhong.Phong')
      .sort({ NgayDat: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đặt phòng của khách hàng thành công',
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đặt phòng',
      error: error.message
    });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { MaDatPhong, KhachHang, HangPhong, NgayDen, NgayDi, SoKhach, TienCoc, ChiTietDatPhong } = req.body;

    // Validate input
    if (!MaDatPhong || !KhachHang || !HangPhong || !NgayDen || !NgayDi || !SoKhach) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đủ thông tin đặt phòng'
      });
    }

    // Check if booking code already exists
    const existingBooking = await DatPhong.findOne({ MaDatPhong });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Mã đặt phòng đã tồn tại'
      });
    }

    const booking = new DatPhong({
      MaDatPhong,
      KhachHang,
      HangPhong,
      NgayDen,
      NgayDi,
      SoKhach,
      TienCoc: TienCoc || 0,
      ChiTietDatPhong: ChiTietDatPhong || [],
      TrangThai: 'Pending'
    });

    await booking.save();
    await booking.populate('KhachHang', 'HoTen SoDT Email');
    await booking.populate('ChiTietDatPhong.Phong');

    res.status(201).json({
      success: true,
      message: 'Tạo đặt phòng thành công',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đặt phòng',
      error: error.message
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { NgayDen, NgayDi, SoKhach, TienCoc, TrangThai, ChiTietDatPhong } = req.body;

    const updateData = {};
    if (NgayDen) updateData.NgayDen = NgayDen;
    if (NgayDi) updateData.NgayDi = NgayDi;
    if (SoKhach) updateData.SoKhach = SoKhach;
    if (TienCoc !== undefined) updateData.TienCoc = TienCoc;
    if (TrangThai) updateData.TrangThai = TrangThai;
    if (ChiTietDatPhong) updateData.ChiTietDatPhong = ChiTietDatPhong;

    const booking = await DatPhong.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('KhachHang', 'HoTen SoDT Email')
     .populate('ChiTietDatPhong.Phong');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Đặt phòng không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật đặt phòng thành công',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật đặt phòng',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await DatPhong.findByIdAndUpdate(
      req.params.id,
      { TrangThai: 'Cancelled' },
      { new: true }
    ).populate('KhachHang', 'HoTen SoDT Email')
     .populate('ChiTietDatPhong.Phong');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Đặt phòng không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hủy đặt phòng thành công',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đặt phòng',
      error: error.message
    });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await DatPhong.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Đặt phòng không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa đặt phòng thành công',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đặt phòng',
      error: error.message
    });
  }
};
