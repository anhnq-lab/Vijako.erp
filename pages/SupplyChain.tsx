import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supplyChainService } from '../src/services/supplyChainService';
import { Vendor, PurchaseOrder, InventoryItem } from '../types';

const priceData = [
    { month: 'T1', steel: 14200, cement: 1450 },
    { month: 'T2', steel: 14500, cement: 1450 },
    { month: 'T3', steel: 15100, cement: 1480 },
    { month: 'T4', steel: 14900, cement: 1500 },
    { month: 'T5', steel: 14600, cement: 1520 },
    { month: 'T6', steel: 14300, cement: 1520 },
];

const VendorRow = ({ vendor }: { vendor: Vendor }) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4">
            <p className="text-sm font-bold text-slate-900">{vendor.name}</p>
            <p className="text-xs text-slate-500">{vendor.category}</p>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-[16px] ${i < Math.floor(vendor.rating) ? 'filled text-warning' : 'text-slate-300'}`}>star</span>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">{vendor.rating}/5.0</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{vendor.total_projects} dự án</td>
        <td className="px-6 py-4 text-xs text-slate-500">{vendor.last_evaluation}</td>
        <td className="px-6 py-4">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${vendor.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {vendor.status === 'approved' ? 'Đã phê duyệt' : 'Hạn chế mời thầu'}
            </span>
        </td>
        <td className="px-6 py-4 text-right">
            <button className="text-primary text-xs font-bold hover:underline">Chi tiết</button>
        </td>
    </tr>
)

const OrderRow = ({ order }: { order: PurchaseOrder }) => {
    let statusClass = "bg-slate-100 text-slate-600";
    if (order.status === 'Delivering') statusClass = "bg-blue-50 text-blue-700";
    if (order.status === 'Completed') statusClass = "bg-green-50 text-green-700";
    if (order.status === 'Pending') statusClass = "bg-yellow-50 text-yellow-700";

    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{order.po_number}</td>
            <td className="px-6 py-4">
                <p className="text-sm font-bold text-slate-900">{order.vendor_name || 'Unknown'}</p>
                <p className="text-xs text-slate-500">{order.items_summary}</p>
            </td>
            <td className="px-6 py-4 text-xs text-slate-600">{order.location}</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-900">{order.total_amount?.toLocaleString() || 0}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{order.delivery_date}</td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${statusClass}`}>
                    {order.status === 'Delivering' && <span className="material-symbols-outlined text-[12px] animate-pulse">local_shipping</span>}
                    {order.status === 'Completed' && <span className="material-symbols-outlined text-[12px]">check</span>}
                    {order.status === 'Pending' && <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>}
                    {order.status === 'Delivering' ? 'Đang giao hàng' : (order.status === 'Completed' ? 'Đã nhập kho' : 'Chờ duyệt')}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
            </td>
        </tr>
    )
}

const InventoryItemRow = ({ item }: { item: InventoryItem }) => (
    <div className="bg-white border border-slate-100 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <div className={`size-10 rounded-lg flex items-center justify-center ${item.status === 'Low' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                <span className="material-symbols-outlined">{item.category === 'Steel' ? 'construction' : (item.category === 'Cement' ? 'foundation' : 'category')}</span>
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{item.code}</span>
                </div>
                <p className="text-xs text-slate-500">{item.warehouse}</p>
            </div>
        </div>

        <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-xs text-slate-500">Tồn kho</p>
                <p className={`text-lg font-bold ${item.status === 'Low' ? 'text-red-600' : 'text-slate-900'}`}>{item.quantity.toLocaleString()} <span className="text-xs font-normal text-slate-500">{item.unit}</span></p>
            </div>
            <div className="hidden md:block w-32">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Min: {item.min_quantity}</span>
                    <span>{Math.round((item.quantity / item.min_quantity) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.status === 'Low' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min((item.quantity / item.min_quantity) * 50, 100)}%` }}></div>
                </div>
            </div>
            <button className={`px-3 py-1.5 rounded text-xs font-bold ${item.status === 'Low' ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                {item.status === 'Low' ? 'Đặt hàng ngay' : 'Điều chuyển'}
            </button>
        </div>
    </div>
)

const StatCard = ({ title, value, sub, icon, color }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
        <div className={`size-12 rounded-xl flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 my-1">{value}</h3>
            <p className="text-xs text-slate-500">{sub}</p>
        </div>
    </div>
)

export default function SupplyChain() {
    const [activeTab, setActiveTab] = useState('procurement');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [v, o, i] = await Promise.all([
                supplyChainService.getAllVendors(),
                supplyChainService.getAllOrders(),
                supplyChainService.getAllInventory()
            ]);
            setVendors(v);
            setOrders(o);
            setInventory(i);
        } catch (error) {
            console.error("Failed to fetch supply chain data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light">
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Chuỗi Cung ứng & Đối tác</h2>
                    <p className="text-sm text-slate-500 mt-1">Đánh giá nhà cung cấp, Cổng thông tin thầu phụ và Quản lý kho.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                        <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span> Quét Nhập/Xuất
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span> Tạo Đơn hàng (PO)
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Đơn hàng đang chạy" value={`${orders.filter(o => o.status === 'Delivering').length} PO`} sub={`Tổng giá trị: ${(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / 1000000000).toFixed(1)} Tỷ`} icon="local_shipping" color="bg-blue-50 text-blue-600" />
                        <StatCard title="Cảnh báo Tồn kho" value={`${inventory.filter(i => i.status === 'Low').length} Item`} sub="Dưới mức tối thiểu" icon="inventory_2" color="bg-red-50 text-red-600" />
                        <StatCard title="Giao hàng đúng hạn (OTIF)" value="94.5%" sub="Thấp hơn tháng trước 2%" icon="verified" color="bg-green-50 text-green-600" />
                        <StatCard title="Biến động giá Vật tư" value="+5.2%" sub="So với cùng kỳ năm ngoái" icon="trending_up" color="bg-orange-50 text-orange-600" />
                    </div>

                    {/* Tabs */}
                    <div>
                        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
                            <button
                                onClick={() => setActiveTab('procurement')}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'procurement' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Tổng quan & Đặt hàng
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Quản lý Kho (Inventory)
                            </button>
                            <button
                                onClick={() => setActiveTab('vendors')}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'vendors' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Nhà cung cấp (Vendors)
                            </button>
                        </div>

                        {/* Content */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'procurement' && (
                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                            <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                                    <h3 className="font-bold text-slate-900">Đơn mua hàng gần đây (Purchase Orders)</h3>
                                                    <button className="text-xs text-primary font-bold hover:underline">Xem tất cả</button>
                                                </div>
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                                        <tr>
                                                            <th className="px-6 py-3">PO #</th>
                                                            <th className="px-6 py-3">Nhà cung cấp</th>
                                                            <th className="px-6 py-3">Nơi giao</th>
                                                            <th className="px-6 py-3">Tổng tiền</th>
                                                            <th className="px-6 py-3">Ngày giao</th>
                                                            <th className="px-6 py-3">Trạng thái</th>
                                                            <th className="px-6 py-3"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.length > 0 ? orders.map(order => (
                                                            <OrderRow key={order.id} order={order} />
                                                        )) : (
                                                            <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Chưa có đơn hàng nào.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="xl:col-span-4 flex flex-col gap-6">
                                                {/* Price Trend Chart */}
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-1">
                                                    <h3 className="font-bold text-slate-900 mb-2">Xu hướng giá thị trường</h3>
                                                    <p className="text-xs text-slate-500 mb-4">Giá thép vs Xi măng (6 tháng gần nhất)</p>
                                                    <div className="h-64 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={priceData}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                <XAxis dataKey="month" fontSize={12} axisLine={false} tickLine={false} />
                                                                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Line type="monotone" dataKey="steel" name="Thép (kg)" stroke="#1f3f89" strokeWidth={2} dot={false} />
                                                                <Line type="monotone" dataKey="cement" name="Xi măng (kg)" stroke="#FACC15" strokeWidth={2} dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Portal Promo */}
                                                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                                    <div className="relative z-10">
                                                        <h3 className="font-bold text-lg mb-2">Cổng thông tin Thầu phụ</h3>
                                                        <p className="text-indigo-200 text-xs mb-4">
                                                            Giảm 80% thời gian gọi điện. Cho phép đối tác nộp hồ sơ thanh toán và xem trạng thái đơn hàng online.
                                                        </p>
                                                        <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                                                            Gửi Link truy cập
                                                        </button>
                                                    </div>
                                                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/5 pointer-events-none">captive_portal</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'inventory' && (
                                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-slate-900 text-lg">Tồn kho Dự án & Kho tổng</h3>
                                                <div className="flex gap-2">
                                                    <select className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none">
                                                        <option>Tất cả kho</option>
                                                        <option>Kho Vijako Tower</option>
                                                        <option>Kho The Nine</option>
                                                    </select>
                                                    <button className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">filter_list</span> Lọc
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {inventory.length > 0 ? inventory.map(item => (
                                                    <InventoryItemRow key={item.id} item={item} />
                                                )) : (
                                                    <p className="text-center text-slate-500 col-span-2">Không có dữ liệu tồn kho.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'vendors' && (
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                                <h3 className="font-bold text-slate-900 text-lg">Xếp hạng Nhà cung cấp (Vendor Rating)</h3>
                                                <div className="relative">
                                                    <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
                                                    <input className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary" placeholder="Tìm kiếm NCC..." />
                                                </div>
                                            </div>
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                                    <tr>
                                                        <th className="px-6 py-3">Tên Nhà cung cấp</th>
                                                        <th className="px-6 py-3">Đánh giá (Stars)</th>
                                                        <th className="px-6 py-3">Đã tham gia</th>
                                                        <th className="px-6 py-3">Lần đánh giá cuối</th>
                                                        <th className="px-6 py-3">Trạng thái</th>
                                                        <th className="px-6 py-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vendors.length > 0 ? vendors.map(vendor => (
                                                        <VendorRow key={vendor.id} vendor={vendor} />
                                                    )) : (
                                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Chưa có nhà cung cấp nào.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}