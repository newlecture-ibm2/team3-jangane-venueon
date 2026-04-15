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
      {/* 1. 하이엔드 복합 트렌드 차트 */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>
          <div className={styles.titleBadge}>실시간 분석</div>
          <h3>종합 성장 지표 트렌드</h3>
          <p>사용자 유입 및 콘텐츠 생성 현황을 입체적으로 분석합니다</p>
        </div>
        
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6B7280', fontSize: 12, fontWeight: 500}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 11}} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#F9FAFB'}} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                content={({ payload }) => (
                  <div className={styles.legendWrapper}>
                    {payload?.map((entry: any, index: number) => (
                      <div key={index} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ backgroundColor: entry.color }} />
                        <span className={styles.legendText}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              
              {/* 사용자 유입 (바 차트) */}
              <Bar 
                dataKey="users" 
                name="신규 사용자" 
                fill="#6366F1" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              >
                {chartData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fillOpacity={0.85} />
                ))}
              </Bar>

              {/* 호스트 유입 (바 차트) */}
              <Bar 
                dataKey="hosts" 
                name="신규 호스트" 
                fill="#10B981" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              />

              {/* 이벤트 생성 (라인 차트 - 강조 효과) */}
              <Line 
                type="monotone" 
                dataKey="events" 
                name="신규 이벤트" 
                stroke="#F59E0B" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 하단 보조 지표 섹션 */}
      <div className={styles.statsGrid}>
        <div className={styles.miniCard}>
          <div className={styles.miniLabel}>주간 활성 지수</div>
          <div className={styles.miniValue}>+12.5%</div>
          <div className={styles.miniTrend}>지난 주 대비 상승</div>
        </div>
        <div className={styles.miniCard}>
          <div className={styles.miniLabel}>전체 누적 사용자</div>
          <div className={styles.miniValue}>{data ? (data.totalUserCount + data.totalHostCount).toLocaleString() : '-'}명</div>
          <div className={styles.miniTrend}>실시간 베이스라인</div>
        </div>
      </div>
    </div>
  );
}
