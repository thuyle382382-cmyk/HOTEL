import { useState, useEffect } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import roomExtensionApi from "@/api/roomExtensionApi";
import { datPhongApi, customerApi } from "@/api";
import { toast } from "react-toastify";

// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};


const RoomExtensionRequest = () => {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    DatPhong: "",
    NgayDiMoi: "",
    LyDo: ""
  });


  useEffect(() => {
    fetchRequests();
    fetchActiveBookings();
  }, []);


  const fetchRequests = async () => {
    try {
      const data = await roomExtensionApi.getExtensionRequestsForGuest();
      setRequests(data);
    } catch (error) {
      toast.error("Không thể tải yêu cầu gia hạn");
    } finally {
      setLoading(false);
    }
  };


  const fetchActiveBookings = async () => {
    try {
      // Get current customer from token
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = parseJwt(token);
      if (!decoded?.id) return;

      // Find customer by account ID
      const customers = await customerApi.getCustomers();
      const customer = customers.find(c => {
        if (!c.TaiKhoan) return false;
        const taiKhoanId = typeof c.TaiKhoan === 'object' ? c.TaiKhoan._id : c.TaiKhoan;
        return taiKhoanId === decoded.id;
      });

      if (!customer) {
        console.warn("No customer profile found");
        return;
      }

      // Fetch bookings for this customer
      const bookingsData = await datPhongApi.getBookingsByCustomerId(customer._id);
      const allBookings = bookingsData.data || bookingsData || [];
      // Filter only checked-in bookings
      const checkedInBookings = allBookings.filter(booking => booking.TrangThai === 'CheckedIn');
      setBookings(checkedInBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đặt phòng");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roomExtensionApi.createExtensionRequest(formData);
      toast.success("Yêu cầu gia hạn đã được gửi");
      setDialogOpen(false);
      setFormData({ DatPhong: "", NgayDiMoi: "", LyDo: "" });
      fetchRequests();
    } catch (error) {
      toast.error(error.message || "Không thể gửi yêu cầu gia hạn");
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'Đang chờ';
      case 'Approved': return 'Đã chấp nhận';
      case 'Rejected': return 'Đã từ chối';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };


  if (loading) return <div>Đang tải...</div>;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Yêu cầu gia hạn phòng
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={bookings.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo yêu cầu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo yêu cầu gia hạn phòng</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="datPhong">Đặt phòng</Label>
                  <Select
                    value={formData.DatPhong}
                    onValueChange={(value) => setFormData({ ...formData, DatPhong: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đặt phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((booking) => (
                        <SelectItem key={booking._id} value={booking._id}>
                          {booking.MaDatPhong} - Checkout: {new Date(booking.NgayDi).toLocaleDateString('vi-VN')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bookings.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bạn cần có đặt phòng đã check-in để gia hạn
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ngayDiMoi">Ngày checkout mới</Label>
                  <Input
                    id="ngayDiMoi"
                    type="date"
                    value={formData.NgayDiMoi}
                    onChange={(e) => setFormData({ ...formData, NgayDiMoi: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lyDo">Lý do gia hạn</Label>
                  <Textarea
                    id="lyDo"
                    value={formData.LyDo}
                    onChange={(e) => setFormData({ ...formData, LyDo: e.target.value })}
                    placeholder="Vui lòng giải thích lý do gia hạn phòng..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={bookings.length === 0}>
                  Gửi yêu cầu
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground">Chưa có yêu cầu gia hạn nào.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request._id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{request.MaPGH}</span>
                      <Badge className={getStatusColor(request.TrangThai)}>
                        {getStatusText(request.TrangThai)}
                      </Badge>
                    </div>
                    {request.DatPhong && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Đặt phòng: {request.DatPhong.MaDatPhong}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-1">
                      Ngày checkout hiện tại: {new Date(request.NgayDiCu).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Ngày checkout mới: {new Date(request.NgayDiMoi).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Lý do: {request.LyDo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.NgayTao).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default RoomExtensionRequest;

