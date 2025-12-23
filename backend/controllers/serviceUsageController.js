const SuDungDichVu = require('../models/SuDungDichVu');

// Get all service usages
exports.getAllServiceUsages = async (req, res) => {
  try {
    const usages = await SuDungDichVu.find()
      .populate('PhieuThuePhong')
      .populate('DichVu')
      .populate('TaiKhoan', 'TenDangNhap');
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sử dụng dịch vụ thành công',
      data: usages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sử dụng dịch vụ',
      error: error.message
    });
  }
};

// Get service usage by ID
exports.getServiceUsageById = async (req, res) => {
  try {
    const usage = await SuDungDichVu.findById(req.params.id)
      .populate('PhieuThuePhong')
      .populate('DichVu')
      .populate('TaiKhoan', 'TenDangNhap');
    if (!usage) {
      return res.status(404).json({
        success: false,
        message: 'Sử dụng dịch vụ không tồn tại'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin sử dụng dịch vụ thành công',
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sử dụng dịch vụ',
      error: error.message
    });
  }
};

// Create new service usage
exports.createServiceUsage = async (req, res) => {
  try {
    const { MaSDV, PhieuThuePhong, DichVu, SoLuong, NgaySDV } = req.body;

    // Validate input
    if (!MaSDV || !PhieuThuePhong || !DichVu || !SoLuong) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đủ thông tin sử dụng dịch vụ'
      });
    }

    // Check if code already exists
    const existingUsage = await SuDungDichVu.findOne({ MaSDV });
    if (existingUsage) {
      return res.status(409).json({
        success: false,
        message: 'Mã sử dụng dịch vụ đã tồn tại'
      });
    }

    const usage = new SuDungDichVu({
      MaSDV,
      PhieuThuePhong,
      DichVu,
      SoLuong,
      NgaySDV: NgaySDV || Date.now(),
      TrangThai: 'Pending'
    });

    await usage.save();
    await usage.populate('PhieuThuePhong');
    await usage.populate('DichVu');
    await usage.populate('TaiKhoan', 'TenDangNhap');

    res.status(201).json({
      success: true,
      message: 'Tạo sử dụng dịch vụ thành công',
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sử dụng dịch vụ',
      error: error.message
    });
  }
};

// Update service usage
exports.updateServiceUsage = async (req, res) => {
  try {
    const { SoLuong, TrangThai } = req.body;

    const updateData = {};
    if (SoLuong) updateData.SoLuong = SoLuong;
    if (TrangThai) updateData.TrangThai = TrangThai;

    const usage = await SuDungDichVu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('PhieuThuePhong')
     .populate('DichVu')
     .populate('TaiKhoan', 'TenDangNhap');

    if (!usage) {
      return res.status(404).json({
        success: false,
        message: 'Sử dụng dịch vụ không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật sử dụng dịch vụ thành công',
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sử dụng dịch vụ',
      error: error.message
    });
  }
};

// Delete service usage
exports.deleteServiceUsage = async (req, res) => {
  try {
    const usage = await SuDungDichVu.findByIdAndDelete(req.params.id);

    if (!usage) {
      return res.status(404).json({
        success: false,
        message: 'Sử dụng dịch vụ không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa sử dụng dịch vụ thành công',
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sử dụng dịch vụ',
      error: error.message
    });
  }
};
