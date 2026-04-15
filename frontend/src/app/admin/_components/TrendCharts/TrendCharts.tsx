'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import styles from './TrendCharts.module.css';

const dummyData = [
  { name: 'Mon', users: 400, hosts: 24, events: 10 },
  { name: 'Tue', users: 520, hosts: 13, events: 15 },
  { name: 'Wed', users: 480, hosts: 35, events: 12 },
  { name: 'Thu', users: 700, hosts: 20, events: 25 },
  { name: 'Fri', users: 650, hosts: 40, events: 18 },
  { name: 'Sat', users: 900, hosts: 55, events: 32 },
  { name: 'Sun', users: 1100, hosts: 60, events: 45 },
];

export default function TrendCharts() {
  return (
    <div className={styles.container}>
      {/* 1. 신규 사용자 추이 (주요 지표) */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>
          <h3>전체 성장 추이</h3>
          <p>사용자 및 호스트 신규 가입 현황</p>
        </div>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dummyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                name="신규 사용자"
              />
              <Area 
                type="monotone" 
                dataKey="hosts" 
                stroke="#10B981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHosts)" 
                name="신규 호스트"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 소형 차트 그리드 */}
      <div className={styles.smallGrid}>
        <div className={styles.smallCard}>
           <h4>신설 이벤트</h4>
           <div className={styles.smallChartWrapper}>
             <ResponsiveContainer width="100%" height={80}>
               <LineChart data={dummyData}>
                 <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#F59E0B" 
                    strokeWidth={2} 
                    dot={false} 
                 />
                 <Tooltip />
               </LineChart>
             </ResponsiveContainer>
           </div>
           <div className={styles.trendInfo}>
             <span className={styles.trendUp}>↑ 12%</span>
             <span className={styles.trendPeriod}>vs last week</span>
           </div>
        </div>
      </div>
    </div>
  );
}
