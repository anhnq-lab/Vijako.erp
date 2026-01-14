import React, { useState, useEffect } from 'react';
import { documentService } from '../src/services/documentService';
import { ProjectDocument, DocumentActivity } from '../types';

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

const FileRow = ({ name, type, rev, status, size, date, author, approver, onApprove }: any) => (
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
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' :
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
            <div className="flex items-center justify-end gap-2">
                {status !== 'PUBLISHED' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onApprove(); }}
                        className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-2 py-1 rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                        Duyệt
                    </button>
                )}
                <button className="text-slate-400 hover:text-primary p-2 hover:bg-white rounded-full transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
            </div>
        </td>
    </tr>
)

const FolderItem = ({ name, type, count, active, onClick }: any) => (
    <li
        onClick={onClick}
        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${active ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
    >
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
    const [docs, setDocs] = useState<ProjectDocument[]>([]);
    const [activities, setActivities] = useState<DocumentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const docsData = await documentService.getAllDocuments();
            const activitiesData = await documentService.getDocumentActivities();
            setDocs(docsData);
            setActivities(activitiesData);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await documentService.approveDocument(id, 'Nguyễn Văn An');
            loadData(); // Refresh list and activity log
        } catch (error) {
            console.error('Error approving document:', error);
        }
    };

    const filteredDocs = activeTab === 'ALL' ? docs : docs.filter(d => d.status === activeTab);

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
                                <FolderItem name="Tất cả tài liệu" type="cloud" active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')} />
                                <FolderItem name="Được chia sẻ" type="shared" />
                                <FolderItem name="Đánh dấu sao" type="star" />
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-3">Trạng thái (ISO 19650)</h3>
                            <ul className="space-y-0.5">
                                <FolderItem name="00. WIP (Đang làm)" type="folder" active={activeTab === 'WIP'} onClick={() => setActiveTab('WIP')} />
                                <FolderItem name="01. SHARED (Chia sẻ)" type="folder" active={activeTab === 'SHARED'} onClick={() => setActiveTab('SHARED')} />
                                <FolderItem name="02. PUBLISHED" type="folder" active={activeTab === 'PUBLISHED'} onClick={() => setActiveTab('PUBLISHED')} />
                                <FolderItem name="03. ARCHIVED" type="folder" active={activeTab === 'ARCHIVED'} onClick={() => setActiveTab('ARCHIVED')} />
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Toolbar */}
                    <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-bold text-slate-900 cursor-pointer hover:underline">Hệ thống CDE</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-slate-600 font-medium">{activeTab}</span>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
                                <input className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 w-64 focus:bg-white focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Tìm tên file, mã bản vẽ..." />
                            </div>
                            <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500"><span className="material-symbols-outlined">filter_list</span></button>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center text-slate-400 space-y-4">
                                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                <p>Đang nạp tài liệu CDE...</p>
                            </div>
                        ) : (
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
                                    {filteredDocs.map((doc) => (
                                        <FileRow
                                            key={doc.id}
                                            name={doc.name}
                                            type={doc.type}
                                            rev={doc.revision || '-'}
                                            status={doc.status || 'WIP'}
                                            size={`${(doc.size / (1024 * 1024)).toFixed(1)} MB`}
                                            date={new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                            author={doc.uploaded_by || 'Unknown'}
                                            approver={doc.approver}
                                            onApprove={() => handleApprove(doc.id)}
                                        />
                                    ))}
                                    {filteredDocs.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Không có tài liệu nào trong thư mục này</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>

                {/* Right Panel: Activity Log */}
                <aside className="w-80 bg-slate-50 border-l border-slate-200 flex-shrink-0 flex flex-col h-full">
                    <div className="p-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-900">Hoạt động gần đây</h3>
                        <p className="text-xs text-slate-500">Nhật ký truy cập hệ thống (Audit Log)</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {activities.map(act => (
                            <ActivityItem
                                key={act.id}
                                user={act.user_name}
                                action={act.action.replace(/_/g, ' ')}
                                target="Tài liệu"
                                time={new Date(act.created_at).toLocaleTimeString('vi-VN')}
                                icon={act.action.includes('approve') ? 'check_circle' : act.action.includes('upload') ? 'cloud_upload' : 'edit'}
                                color={act.action.includes('approve') ? 'bg-green-500' : act.action.includes('upload') ? 'bg-blue-500' : 'bg-orange-500'}
                            />
                        ))}
                        {activities.length === 0 && (
                            <div className="text-center py-10 text-slate-300 text-[10px] italic">
                                Chưa có hoạt động nào được ghi nhận
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}