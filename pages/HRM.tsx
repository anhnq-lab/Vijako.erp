import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { hrmService } from '../src/services/hrmService';
import { Employee, Attendance } from '../types';
import AttendanceMap from '../components/AttendanceMap';

// Data for Attendance
const attendanceData = [
    { day: 'T2', present: 142, absent: 5, late: 3 },
    { day: 'T3', present: 145, absent: 2, late: 1 },
    { day: 'T4', present: 140, absent: 8, late: 5 },
    { day: 'T5', present: 148, absent: 1, late: 0 },
    { day: 'T6', present: 144, absent: 4, late: 2 },
    { day: 'T7', present: 130, absent: 15, late: 0 },
];

const COLORS = ['#1f3f89', '#07883d', '#FACC15', '#64748b'];

const EmployeeRow = ({ employee }: { employee: Employee }) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 flex items-center gap-3">
            <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                {employee.full_name.split(' ').pop()?.[0]}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900">{employee.full_name}</p>
                <p className="text-xs text-slate-500">{employee.employee_code}</p>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-700">{employee.role}</td>
        <td className="px-6 py-4 text-xs text-slate-500">{employee.department}</td>
        <td className="px-6 py-4">
            <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                {employee.site}
            </span>
        </td>
        <td className="px-6 py-4">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${employee.status === 'active' ? 'bg-green-50 text-green-700' :
                employee.status === 'leave' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                {employee.status === 'active' ? 'Đang làm việc' : employee.status === 'leave' ? 'Nghỉ phép' : 'Vắng mặt'}
            </span>
        </td>
        <td className="px-6 py-4 text-xs font-mono text-slate-600">
            {employee.last_checkin || '--:--'}
        </td>
        <td className="px-6 py-4 text-right">
            <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
        </td>
    </tr>
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

export default function HRM() {
    const [activeTab, setActiveTab] = useState('employees');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [todayAttendance, setTodayAttendance] = useState<(Attendance & { employee?: Employee })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
        fetchTodayAttendance();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await hrmService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            const data = await hrmService.getTodayAttendance();
            setTodayAttendance(data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const handleCheckIn = async () => {
        if (!navigator.geolocation) {
            alert('Trình duyệt không hỗ trợ định vị GPS.');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Mocking current employee as the first one for demo purposes
                // In real app, this would come from an auth context
                const currentEmp = employees[0];
                if (!currentEmp) return;

                await hrmService.checkIn({
                    employee_id: currentEmp.id,
                    check_in: new Date().toISOString(),
                    location_lat: latitude,
                    location_lng: longitude,
                    site_id: 'Vijako Tower'
                });
                alert('Điểm danh thành công!');
                fetchEmployees(); // Refresh employee list
                fetchTodayAttendance(); // Refresh attendance map data
            } catch (error) {
                alert('Có lỗi xảy ra khi điểm danh.');
            }
        });
    };

    const workforceStats = React.useMemo(() => {
        const counts = {
            'Kỹ sư/Giám sát': 0,
            'Công nhân lành nghề': 0,
            'Lao động phổ thông': 0,
            'Văn phòng': 0,
        };

        employees.forEach(emp => {
            const role = emp.role.toLowerCase();
            if (role.includes('kỹ sư') || role.includes('giám sát') || role.includes('chỉ huy') || role.includes('trắc đạc')) {
                counts['Kỹ sư/Giám sát']++;
            } else if (role.includes('công nhân')) {
                counts['Công nhân lành nghề']++;
            } else if (role.includes('lao động')) {
                counts['Lao động phổ thông']++;
            } else {
                counts['Văn phòng']++;
            }
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [employees]);

    const activeCount = employees.filter(e => e.status === 'active').length;
    const leaveCount = employees.filter(e => e.status === 'leave').length;

    return (
        <div className="flex flex-col h-full bg-background-light">
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Nhân sự & Đào tạo</h2>
                    <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ, Chấm công GPS và Phát triển năng lực.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                        <span className="material-symbols-outlined text-[20px]">download</span> Xuất Báo cáo
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[20px]">person_add</span> Thêm Nhân sự
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Tổng nhân sự" value={employees.length} sub={`Đang làm việc: ${activeCount} | Nghỉ phép: ${leaveCount}`} icon="groups" color="bg-blue-50 text-blue-600" />
                        <StatCard title="Tỷ lệ chuyên cần" value="96.5%" sub="Thấp nhất vào Thứ 7" icon="event_available" color="bg-green-50 text-green-600" />
                        <StatCard title="Đào tạo & Cấp chứng chỉ" value="85%" sub="Nhân sự đạt chuẩn An toàn" icon="workspace_premium" color="bg-yellow-50 text-yellow-600" />
                        <StatCard title="Chi phí nhân sự (T10)" value="4.2 Tỷ" sub="Bao gồm lương & phúc lợi" icon="payments" color="bg-red-50 text-red-600" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* GPS Map & Attendance Chart */}
                        <div className="xl:col-span-2 flex flex-col gap-6">
                            {/* GPS Map Panel */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">location_on</span> Bản đồ chấm công (Live GPS)
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleCheckIn}
                                            className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-primary/90 shadow-sm flex items-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">how_to_reg</span> Điểm danh ngay
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-xs font-bold text-slate-600">Real-time</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative bg-slate-100">
                                    <AttendanceMap onCheckIn={handleCheckIn} attendanceData={todayAttendance} />
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h3 className="font-bold text-slate-900 mb-4">Xu hướng Đi làm & Vắng mặt (Tuần này)</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Legend />
                                            <Bar dataKey="present" name="Có mặt" fill="#07883d" radius={[4, 4, 0, 0]} stackId="a" barSize={40} />
                                            <Bar dataKey="late" name="Đi muộn" fill="#FACC15" radius={[0, 0, 0, 0]} stackId="a" barSize={40} />
                                            <Bar dataKey="absent" name="Vắng" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Structure & Certs */}
                        <div className="flex flex-col gap-6">
                            {/* Workforce Structure */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h3 className="font-bold text-slate-900 mb-2">Cơ cấu Nhân sự</h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={workforceStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {workforceStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {workforceStats.map((entry, index) => (
                                        <div key={index} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                <span className="text-slate-600">{entry.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expiring Certs */}
                            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-white p-2 rounded-lg border border-red-100 text-red-600 shadow-sm">
                                        <span className="material-symbols-outlined">warning</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Cảnh báo Chứng chỉ</h3>
                                        <p className="text-xs text-red-600 font-bold">5 nhân sự sắp hết hạn</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-900">Lê Văn Ba</span>
                                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">CCHN GS</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Hết hạn: 15/11/2023 (Còn 5 ngày)</p>
                                        <button className="w-full mt-2 py-1.5 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 rounded text-slate-600">Gửi thông báo gia hạn</button>
                                    </div>
                                </div>
                            </div>

                            {/* Training Promo */}
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-1">E-Learning 2024</h3>
                                    <p className="text-xs text-indigo-100 mb-3 opacity-90">Khóa học "An toàn lao động trên cao" bắt buộc cho nhóm thi công tầng 15.</p>
                                    <div className="w-full bg-white/20 h-1.5 rounded-full mb-3"><div className="bg-yellow-400 w-[65%] h-full rounded-full"></div></div>
                                    <button className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-indigo-50 transition-colors">Tiếp tục học</button>
                                </div>
                                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[100px] text-white/10 pointer-events-none">school</span>
                            </div>
                        </div>
                    </div>

                    {/* Employee List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('employees')}
                                    className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'employees' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    Danh sách Nhân sự
                                </button>
                                <button
                                    onClick={() => setActiveTab('leave')}
                                    className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'leave' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    Quản lý Nghỉ phép
                                </button>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
                                <input className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary w-64" placeholder="Tìm kiếm nhân viên..." />
                            </div>
                        </div>

                        {activeTab === 'employees' && (
                            <div className="w-full overflow-x-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-500">Đang tải dữ liệu nhân sự...</div>
                                ) : employees.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">Chưa có dữ liệu nhân sự.</div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-3">Nhân viên</th>
                                                <th className="px-6 py-3">Chức vụ</th>
                                                <th className="px-6 py-3">Phòng ban</th>
                                                <th className="px-6 py-3">Địa điểm làm việc</th>
                                                <th className="px-6 py-3">Trạng thái</th>
                                                <th className="px-6 py-3">Check-in</th>
                                                <th className="px-6 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map(emp => (
                                                <EmployeeRow key={emp.id} employee={emp} />
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}