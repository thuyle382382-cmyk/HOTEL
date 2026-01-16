import React from "react";
import { Card } from "@/components/ui/card";

const neighborhoods = [
  {
    type: "Địa điểm tham quan",
    items: [
      {
        name: "Công viên Trung tâm",
        description: "Công viên đẹp với đường đi bộ, vườn hoa, thường xuyên tổ chức sự kiện địa phương.",
        address: "1 Đường Công viên",
        distance: "700m"
      },
      {
        name: "Bảo tàng Thành phố",
        description: "Các triển lãm khoa học và nghệ thuật tương tác cho mọi lứa tuổi.",
        address: "42 Đường Bảo tàng",
        distance: "1.4km"
      },
      {
        name: "Chợ ven sông",
        description: "Chợ ngoài trời với nhiều món ăn địa phương và quà lưu niệm.",
        address: "Quảng trường Riverside",
        distance: "1.2km"
      }
    ]
  },
  {
    type: "Nhà hàng, ăn uống",
    items: [
      {
        name: "Phở 88",
        description: "Phở truyền thống và gỏi cuốn tươi ngon.",
        address: "15 Phố Ẩm thực",
        distance: "600m"
      },
      {
        name: "Nhà hàng Hoàng hôn",
        description: "Không gian bình dân, nổi tiếng với sườn nướng BBQ, view đẹp buổi chiều.",
        address: "31 Đại lộ Chính",
        distance: "950m"
      },
      {
        name: "Tiệm bánh Pierre",
        description: "Bánh mì Pháp, bánh ngọt và cà phê tươi mỗi ngày.",
        address: "2 Ngõ Chợ",
        distance: "400m"
      }
    ]
  },
  {
    type: "Điểm tiện ích & nổi bật",
    items: [
      {
        name: "Thư viện thành phố",
        description: "Thư viện hiện đại, phòng đọc lớn, khu vực cho trẻ em.",
        address: "88 Đường Sách",
        distance: "1km"
      },
      {
        name: "Chùa Sen",
        description: "Chùa cổ, vườn yên tĩnh, mở cửa miễn phí cho khách tham quan.",
        address: "77 Đường Sen",
        distance: "950m"
      },
      {
        name: "Chợ đêm",
        description: "Mua sắm, ăn vặt, quà lưu niệm. Mở cửa mỗi tối từ 18:00.",
        address: "Quảng trường Chợ Đêm",
        distance: "1.3km"
      }
    ]
  }
];

export default function NeighborhoodGuide() {
  return (
    <Card style={{ padding: 24, margin: 32, maxWidth: 720, width: "100%", background: "#fffefb" }}>
      <h2 style={{ fontWeight: 600, fontSize: 26, textAlign: "center" }}>Hướng dẫn khu vực quanh khách sạn</h2>
      <p style={{ textAlign: "center", color: '#888', marginBottom: 24 }}>
        Gợi ý các điểm tham quan, ăn uống, và tiện ích gần khách sạn Hortensia.
      </p>
      {neighborhoods.map((section) => (
        <div key={section.type} style={{ margin: "36px 0 16px" }}>
          <h3 style={{ fontSize: 18, color: '#444', marginBottom: 12 }}>{section.type}</h3>
          <ul style={{ marginLeft: 0, paddingLeft: 0 }}>
            {section.items.map((item) => (
              <li key={item.name} style={{ listStyle: 'none', margin: '0 0 14px 0', padding: 12, borderRadius: 8, background: '#f8f8f8' }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{item.name}</strong> <span style={{ color: '#7065da', fontSize: 12, marginLeft: 8 }}>{item.distance}</span>
                  <div style={{ color: '#666', fontSize: 14 }}>{item.description}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>{item.address}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p style={{ color: '#aaa', fontSize: 12, marginTop: 32, textAlign: "center" }}>
        * Để biết lộ trình chi tiết hơn, vui lòng liên hệ quầy Lễ tân hoặc Bộ phận Chăm sóc khách hàng!
      </p>
    </Card>
  );
}

