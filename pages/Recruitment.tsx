import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../src/services/recruitmentService';
import { JobPosting } from '../types';

const JobItem = ({ job }: { job: JobPosting }) => (
    <div className="flex justify-between items-center py-6 border-b border-slate-100 hover:bg-slate-50/50 px-4 rounded-xl transition-colors group">
        <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {job.start_date ? new Date(job.start_date).toLocaleDateString('vi-VN') : 'N/A'} - {job.end_date ? new Date(job.end_date).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
            </div>
        </div>
        <button className="bg-white border border-primary text-primary px-6 py-2 rounded-lg text-xs font-black uppercase hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md">
            Ứng tuyển
        </button>
    </div>
);

export default function Recruitment() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await recruitmentService.getAllJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const departments = Array.from(new Set(jobs.map(j => j.department)));

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = !selectedDept || job.department === selectedDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="bg-white border-b border-slate-100 px-8 py-4 flex justify-center items-center shrink-0">
                <nav className="flex gap-8 text-sm font-bold text-primary border-b-2 border-primary pb-2">
                    <a href="#" className="uppercase tracking-widest">Ứng tuyển</a>
                </nav>
            </header>

            <div className="flex-1 overflow-hidden flex">
                {/* Sidebar Filter */}
                <aside className="w-80 border-r border-slate-100 p-8 flex flex-col gap-8">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/20"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute right-3 top-2 text-slate-400 text-[18px]">search</span>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest px-2">Vị trí tuyển dụng</h4>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedDept(null)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors ${!selectedDept ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Tất cả bộ phận
                            </button>
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors ${selectedDept === dept ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Job List */}
                <main className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-primary pl-4">Vị trí tuyển dụng</h2>

                        {loading ? (
                            <div className="text-center py-20 text-slate-400 font-bold">Đang tải danh sách...</div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-bold">Không tìm thấy vị trí phù hợp.</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredJobs.map(job => (
                                    <JobItem key={job.id} job={job} />
                                ))}
                            </div>
                        )}

                        <div className="text-center pt-8">
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Xem thêm</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
