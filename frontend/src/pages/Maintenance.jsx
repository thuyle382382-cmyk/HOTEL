import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockMaintenanceTickets } from "@/mock/mockData";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roomApi, maintenanceApi } from "@/api";

export default function Maintenance() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roomId: "",
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
  });
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsData, ticketsData] = await Promise.all([
          roomApi.getRooms(),
          maintenanceApi.getMaintenanceRecords(),
        ]);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setRooms([]);
        setTickets([]);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTicket = async () => {
    if (!formData.roomId || !formData.title || !formData.description) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a maintenance record code
      const MaPBT = `PBT-${Date.now()}`;

      const newTicket = await maintenanceApi.createMaintenanceRecord({
        MaPBT: MaPBT,
        Phong: formData.roomId,
        NVKyThuat: formData.assignedTo || "Chưa phân công",
        NoiDung: formData.description,
      });

      setTickets([...tickets, newTicket]);
      setFormData({
        roomId: "",
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
      });
      setIsCreateOpen(false);

      toast({
        title: "Thành công",
        description: "Phiếu bảo trì đã được tạo",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo phiếu bảo trì",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = (ticket) => {
    setSelectedTicket(ticket);
    setIsUpdateStatusOpen(true);
  };

  const handleConfirmUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn trạng thái",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTicket = await maintenanceApi.updateMaintenanceRecord(
        selectedTicket._id,
        { TrangThai: newStatus }
      );

      setTickets(
        tickets.map((t) => (t._id === selectedTicket._id ? updatedTicket : t))
      );
      setSelectedTicket(null);
      setNewStatus("");
      setIsUpdateStatusOpen(false);

      toast({
        title: "Thành công",
        description: "Trạng thái phiếu bảo trì đã được cập nhật",
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: "Mới", variant: "destructive" },
      in_progress: { label: "Đang xử lý", variant: "default" },
      completed: { label: "Hoàn thành", variant: "secondary" },
    };
    const config = statusConfig[status] || {
      label: status,
      variant: "outline",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: "Thấp", className: "bg-muted" },
      medium: {
        label: "Trung bình",
        className: "bg-warning text-warning-foreground",
      },
      high: {
        label: "Cao",
        className: "bg-destructive text-destructive-foreground",
      },
    };
    return (
      <Badge className={priorityConfig[priority]?.className || "bg-muted"}>
        {priorityConfig[priority]?.label || priority}
      </Badge>
    );
  };

  const ticketsWithDetails = tickets.map((ticket) => {
    // Handle case where Phong is already populated as an object
    let roomNumber = "N/A";
    if (typeof ticket.Phong === "object" && ticket.Phong) {
      roomNumber =
        ticket.Phong.roomNumber || ticket.Phong.MaPhong || ticket.Phong._id;
    } else {
      // If Phong is just an ID, find the room
      const room = rooms.find(
        (r) => r.id === ticket.Phong || r.MaPhong === ticket.Phong
      );
      roomNumber = room?.roomNumber || room?.MaPhong || ticket.Phong || "N/A";
    }

    // Handle case where NVKyThuat is already populated as an object
    let assignedName = "Chưa phân công";
    if (typeof ticket.NVKyThuat === "object" && ticket.NVKyThuat) {
      assignedName = ticket.NVKyThuat.HoTen || "Chưa phân công";
    } else if (ticket.NVKyThuat) {
      assignedName = ticket.NVKyThuat;
    }

    return {
      ...ticket,
      roomNumber: roomNumber,
      assignedName: assignedName,
      title: ticket.NoiDung?.substring(0, 50) || "N/A",
      description: ticket.NoiDung || "N/A",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý bảo trì
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và xử lý các yêu cầu bảo trì
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tạo phiếu bảo trì
        </Button>
      </div>

      {/* Các thẻ */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "new").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng phiếu bảo trì */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu bảo trì</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Độ ưu tiên</TableHead>
                <TableHead>Người phụ trách</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketsWithDetails.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell className="font-medium">{ticket.MaPBT}</TableCell>
                  <TableCell>Phòng {ticket.roomNumber}</TableCell>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {ticket.description}
                  </TableCell>
                  <TableCell>{getPriorityBadge("medium")}</TableCell>
                  <TableCell>{ticket.assignedName}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleUpdateStatus(ticket)}
                      className="cursor-pointer"
                    >
                      {getStatusBadge(ticket.TrangThai || "new")}
                    </button>
                  </TableCell>
                  <TableCell>
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PopUp tạo phiếu */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tạo phiếu bảo trì</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomId">Mã phòng</Label>
              <Input
                id="roomId"
                placeholder="Ví dụ: R101"
                value={formData.roomId}
                onChange={(e) =>
                  setFormData({ ...formData, roomId: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Thay bóng đèn"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticketDescription">Mô tả chi tiết</Label>
              <Textarea
                id="ticketDescription"
                placeholder="Mô tả vấn đề cần bảo trì..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Mức độ ưu tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Giao cho kỹ thuật viên</Label>
              <Input
                id="assignedTo"
                placeholder="Chọn kỹ thuật viên"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateTicket}>Tạo phiếu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PopUp Cập nhật phiếu */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Phiếu bảo trì</Label>
                <p className="text-lg font-semibold">{selectedTicket.MaPBT}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng</Label>
                <p className="text-lg font-semibold">
                  {selectedTicket.roomNumber}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newStatus">Trạng thái mới</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="newStatus">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="in_progress">Đang xử lý</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateStatusOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmUpdateStatus}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
