const PhieuBaoTri = require('../models/PhieuBaoTri');

// Get all maintenance records
exports.getAllMaintenanceRecords = async (req, res) => {
  try {
    const records = await PhieuBaoTri.find()
      .populate('Phong')
      .populate('NVKyThuat', 'HoTen');
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách phiếu bảo trì thành công',
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phiếu bảo trì',
      error: error.message
    });
  }
};

// Get maintenance record by ID
exports.getMaintenanceRecordById = async (req, res) => {
  try {
    const record = await PhieuBaoTri.findById(req.params.id)
      .populate('Phong')
      .populate('NVKyThuat', 'HoTen');
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu bảo trì không tồn tại'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin phiếu bảo trì thành công',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phiếu bảo trì',
      error: error.message
    });
  }
};

// Create new maintenance record
exports.createMaintenanceRecord = async (req, res) => {
  try {
    const { MaPBT, Phong, NVKyThuat, NoiDung } = req.body;

    // Validate input
    if (!MaPBT || !Phong || !NVKyThuat || !NoiDung) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đủ thông tin phiếu bảo trì'
      });
    }

    // Check if record code already exists
    const existingRecord = await PhieuBaoTri.findOne({ MaPBT });
    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: 'Mã phiếu bảo trì đã tồn tại'
      });
    }

    const record = new PhieuBaoTri({
      MaPBT,
      Phong,
      NVKyThuat,
      NoiDung
    });

    await record.save();
    await record.populate('Phong');
    await record.populate('NVKyThuat', 'HoTen');

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu bảo trì thành công',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu bảo trì',
      error: error.message
    });
  }
};

// Update maintenance record
exports.updateMaintenanceRecord = async (req, res) => {
  try {
    const { NoiDung, NVKyThuat, NgayThucHien } = req.body;

    const updateData = {};
    if (NoiDung) updateData.NoiDung = NoiDung;
    if (NVKyThuat) updateData.NVKyThuat = NVKyThuat;
    if (NgayThucHien) updateData.NgayThucHien = NgayThucHien;

    const record = await PhieuBaoTri.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('Phong')
     .populate('NVKyThuat', 'HoTen');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu bảo trì không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật phiếu bảo trì thành công',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phiếu bảo trì',
      error: error.message
    });
  }
};

// Delete maintenance record
exports.deleteMaintenanceRecord = async (req, res) => {
  try {
    const record = await PhieuBaoTri.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu bảo trì không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa phiếu bảo trì thành công',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phiếu bảo trì',
      error: error.message
    });
  }
};
