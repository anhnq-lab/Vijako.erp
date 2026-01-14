import React, { useState } from 'react';

const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'pdf': return <div className="size-9 rounded bg-red-100 text-red-600 flex items-center justify-center"><span className="material-symbols-outlined">picture_as_pdf</span></div>;
        case 'dwg': return <div className="size-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">DWG</div>;
        case 'rvt': return <div className="size-9 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">RVT</div>;
        case 'xlsx': return <div className="size-9 rounded bg-green-100 text-green-700 flex items-center justify-center"><span className="material-symbols-outlined">table_view</span></div>;
        case 'docx': return <div className="size-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined">description</span></div>;
        case 'img': return <div className="size-9 rounded bg-purple-100 text-purple-600 flex items-center justify-center"><span className="material-symbols-outlined">image</span></div>;
        default: return <div className="size-9 rounded bg-slate-100 text-slate-500 flex items-center justify-center"><span className="material-symbols-outlined">draft</span></div>;
    }
};

const FileRow = ({ name, type, rev, status, size, date, author, approver }: any) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer">
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <FileIcon type={type} />
                <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{type.toUpperCase()} File • {size}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{rev}</span>
        </td>
        <td className="px-4 py-3">
             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : 
                status === 'SHARED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                status === 'WIP' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-slate-100 text-slate-500 border-slate-200 line-through'
            }`}>
                {status}
            </span>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{date}</td>
        <td className="px-4 py-3">
            <div className="flex items-center gap-2">
                 <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {author.split(' ').pop()[0]}
                 </div>
                 <div className="text-xs">
                    <p className="text-slate-900 font-medium">{author}</p>
                    {approver && <p className="text-[10px] text-slate-400">Duyệt: {approver}</p>}
                 </div>
            </div>
        </td>
        <td className="px-4 py-3 text-right">
             <button className="text-slate-400 hover:text-primary p-2 hover:bg-white rounded-full transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
        </td>
    </tr>
)

const FolderItem = ({ name, type, count, active }: any) => (
    <li className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${active ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
        <div className="flex items-center gap-2.5">
            <span className={`material-symbols-outlined text-[20px] ${active ? 'filled' : ''}`}>
                {type === 'cloud' ? 'cloud' : (type === 'shared' ? 'folder_shared' : 'folder')}
            </span>
            <span>{name}</span>
        </div>
        {count && <span className="text-[10px] bg-white border border-slate-200 px-1.5 rounded-full text-slate-400">{count}</span>}
    </li>
)

const ActivityItem = ({ user, action, target, time, icon, color }: any) => (
    <div className="flex gap-3 relative pb-6 last:pb-0">
        <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-100 last:hidden"></div>
        <div className={`size-7 rounded-full shrink-0 flex items-center justify-center text-white text-[14px] ${color}`}>
            <span className="material-symbols-outlined text-[14px]">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-slate-900"><span className="font-bold">{user}</span> {action} <span className="font-bold text-slate-700">{target}</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
        </div>
    </div>
)

export default function Documents() {
  return (
    <div className="flex flex-col h-full bg-background-light">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Hồ sơ Tài liệu (CDE)</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-green-600">verified_user</span>
                    <span>Tuân thủ tiêu chuẩn ISO 19650</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Lưu trữ</p>
                        <p className="text-sm font-bold text-slate-900">450 GB <span className="text-slate-400 font-normal">/ 1 TB</span></p>
                    </div>
                    <div className="size-8 relative">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-primary" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                    </div>
                </div>
                <button className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span> Upload
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
            {/* Sidebar Tree */}
            <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col overflow-y-auto">
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-3">Truy cập nhanh</h3>
                        <ul className="space-y-0.5">
                            <FolderItem name="Gần đây" type="cloud" active />
                            <FolderItem name="Được chia sẻ" type="shared" />
                            <FolderItem name="Đánh dấu sao" type="star" />
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-3">Thư mục dự án</h3>
                        <ul className="space-y-0.5">
                            <FolderItem name="00. WIP (Đang làm)" type="folder" count="12" />
                            <FolderItem name="01. SHARED (Chia sẻ)" type="folder" count="85" />
                            <FolderItem name="02. PUBLISHED" type="folder" count="340" />
                            <FolderItem name="03. ARCHIVED" type="folder" count="1.2k" />
                        </ul>
                    </div>

                     <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-3">Phân loại</h3>
                        <ul className="space-y-0.5">
                            <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded">
                                <span className="size-2 rounded-full bg-blue-500"></span> Bản vẽ Thiết kế
                            </li>
                             <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded">
                                <span className="size-2 rounded-full bg-red-500"></span> Pháp lý & Hợp đồng
                            </li>
                             <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded">
                                <span className="size-2 rounded-full bg-green-500"></span> Hồ sơ Chất lượng
                            </li>
                        </ul>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-900 cursor-pointer hover:underline">Dự án Vijako Tower</span> 
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="font-bold text-slate-900 cursor-pointer hover:underline">02. PUBLISHED</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-600">Kiến trúc (ARCH)</span>
                    </div>
                    
                    <div className="flex gap-3">
                         <div className="relative">
                            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
                            <input className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 w-64 focus:bg-white focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Tìm tên file, mã bản vẽ..." />
                        </div>
                        <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500"><span className="material-symbols-outlined">filter_list</span></button>
                        <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500"><span className="material-symbols-outlined">grid_view</span></button>
                    </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 text-xs text-slate-500 uppercase font-semibold shadow-sm">
                            <tr>
                                <th className="px-4 py-3">Tên tài liệu</th>
                                <th className="px-4 py-3 w-20">Rev</th>
                                <th className="px-4 py-3 w-32">Trạng thái</th>
                                <th className="px-4 py-3 w-32">Ngày cập nhật</th>
                                <th className="px-4 py-3">Người đăng / Duyệt</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <FileRow name="VJK-ARCH-L05-101.rvt" type="rvt" rev="P03" status="PUBLISHED" size="245 MB" date="20/05/2024" author="BIM Team" approver="Trần KTS" />
                            <FileRow name="VJK-ARCH-L05-101.dwg" type="dwg" rev="C01" status="SHARED" size="12 MB" date="22/05/2024" author="Nguyễn Vẽ" approver="Lê Quản Lý" />
                            <FileRow name="GPXD-TheManor-Phase2.pdf" type="pdf" rev="A" status="PUBLISHED" size="4.5 MB" date="15/01/2024" author="Pháp chế" approver="Ban GĐ" />
                            <FileRow name="Bang_tinh_khoi_luong_T5.xlsx" type="xlsx" rev="P01" status="WIP" size="2 MB" date="Hôm nay" author="QS Team" />
                            <FileRow name="Hinh_anh_thi_cong_T5.docx" type="docx" rev="-" status="WIP" size="15 MB" date="Hôm qua" author="Giám sát hiện trường" />
                            <FileRow name="VJK-ARCH-L05-100_OLD.pdf" type="pdf" rev="P01" status="OBSOLETE" size="5 MB" date="01/04/2024" author="BIM Team" />
                             <FileRow name="Chi_tiet_cau_thang_bo.dwg" type="dwg" rev="C02" status="SHARED" size="8 MB" date="21/05/2024" author="Nguyễn Vẽ" />
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Right Panel: Activity Log */}
            <aside className="w-80 bg-slate-50 border-l border-slate-200 flex-shrink-0 flex flex-col h-full">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">Hoạt động gần đây</h3>
                    <p className="text-xs text-slate-500">Nhật ký truy cập hệ thống (Audit Log)</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <ActivityItem user="Nguyễn Văn An" action="đã duyệt" target="VJK-ARCH-L05-101.rvt" time="10 phút trước" icon="check_circle" color="bg-green-500" />
                    <ActivityItem user="BIM Team" action="đã tải lên" target="VJK-ARCH-L05-101.rvt (Rev P03)" time="30 phút trước" icon="cloud_upload" color="bg-blue-500" />
                    <ActivityItem user="QS Team" action="đang chỉnh sửa" target="Bang_tinh_khoi_luong_T5.xlsx" time="1 giờ trước" icon="edit" color="bg-orange-500" />
                    <ActivityItem user="Trần KTS" action="đã tải xuống" target="GPXD-TheManor-Phase2.pdf" time="2 giờ trước" icon="download" color="bg-slate-500" />
                    <ActivityItem user="Hệ thống" action="đã lưu trữ" target="VJK-ARCH-L05-100.rvt" time="1 ngày trước" icon="inventory_2" color="bg-slate-400" />
                </div>
                <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                        <div className="flex items-start gap-2">
                             <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                             <div>
                                 <h4 className="text-xs font-bold text-slate-900">Quy tắc đặt tên file</h4>
                                 <p className="text-[10px] text-slate-600 mt-1">Vui lòng tuân thủ quy tắc: <br/> [Dự án]-[Bộ môn]-[Tầng]-[Mã].[Đuôi]</p>
                             </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
  )
}