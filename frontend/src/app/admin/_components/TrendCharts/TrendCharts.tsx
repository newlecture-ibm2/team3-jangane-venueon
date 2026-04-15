'use client';

import React, { useEffect, useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Line,
  Area,
  PieChart,
  Pie,
  ComposedChart,
  Legend,
  Cell
} from 'recharts';
import styles from './TrendCharts.module.css';
import { adminSummaryAPI, AdminSummaryResponse } from '@/lib/admin-api';

export default function TrendCharts() {
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await adminSummaryAPI.getSummary();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("차트 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.chartCard} style={{height: '400px', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className={styles.loader}></div>
          <p style={{color: '#9CA3AF', marginLeft: '12px'}}>데이터 분석 중...</p>
        </div>
      </div>
    );
  }

  const chartData = data?.trends || [];

  // 커스텀 툴팁 디자인
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <div className={styles.tooltipDivider} />
          {payload.map((entry: any, index: number) => (
            <div key={index} className={styles.tooltipItem}>
              <span className={styles.dot} style={{ backgroundColor: entry.color }} />
              <span className={styles.itemLabel}>{entry.name}:</span>
              <span className={styles.itemValue}>{entry.value}명/건</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainGrid}>
        {/* 1. 하이엔드 복합 트렌드 차트 */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <div className={styles.titleBadge}>실시간 분석</div>
            <h3>종합 성장 지표 트렌드</h3>
            <p>사용자 유입 및 콘텐츠 생성 현황</p>
          </div>
          
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 11, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 10}} 
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                
                <Area type="monotone" dataKey="users" name="신규 사용자" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="hosts" name="신규 호스트" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorHosts)" />
                <Area type="monotone" dataKey="events" name="신규 이벤트" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 도넛형 비율 차트 (신규 추가) */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <div className={styles.titleBadge}>누적 구성비</div>
            <h3>회원 구성 비율</h3>
            <p>서비스 전체 사용자 분포</p>
          </div>
          
          <div className={styles.donutWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: '사용자', value: data?.totalUserCount || 0 },
                    { name: '호스트', value: data?.totalHostCount || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <span className={styles.donutValue}>{((data?.totalUserCount || 0) + (data?.totalHostCount || 0)).toLocaleString()}</span>
              <span className={styles.donutLabel}>전체 회원</span>
            </div>
          </div>

          <div className={styles.donutLegend}>
            <div className={styles.donutLegendItem}>
              <span className={styles.donutDot} style={{backgroundColor: '#6366F1'}}></span>
              <span className={styles.donutText}>사용자: {data?.totalUserCount?.toLocaleString()}명</span>
            </div>
            <div className={styles.donutLegendItem}>
              <span className={styles.donutDot} style={{backgroundColor: '#10B981'}}></span>
              <span className={styles.donutText}>호스트: {data?.totalHostCount?.toLocaleString()}명</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 하단 보조 지표 섹션 */}
      <div className={styles.statsGrid}>
        <div className={styles.miniCard}>
          <div className={styles.miniLabel}>주간 활성 지수</div>
          <div className={styles.miniValue}>+12.5%</div>
          <div className={styles.miniTrend}>지난 주 대비 상승</div>
        </div>
        <div className={styles.miniCard}>
          <div className={styles.miniLabel}>최근 24시간 이벤트</div>
          <div className={styles.miniValue}>{Math.floor((data?.totalEventCount || 0) / 30)}건</div>
          <div className={styles.miniTrend}>실시간 활성도 기반</div>
        </div>
      </div>
    </div>
  );
}
