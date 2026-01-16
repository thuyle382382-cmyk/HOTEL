const mongoose = require('mongoose');

const PhieuGiaHanSchema = new mongoose.Schema({
    MaPGH: { type: String, required: true, unique: true },
    DatPhong: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'DatPhong', 
        required: true 
    },
    KhachHang: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'KhachHang', 
        required: true 
    },
    NgayDenCu: { type: Date, required: true },
    NgayDiCu: { type: Date, required: true },
    NgayDiMoi: { type: Date, required: true },
    LyDo: { type: String, required: true },
    TrangThai: { 
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
        default: 'Pending' 
    },
    NgayTao: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PhieuGiaHan', PhieuGiaHanSchema);

