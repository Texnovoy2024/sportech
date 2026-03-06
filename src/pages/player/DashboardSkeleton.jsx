// src/pages/player/DashboardSkeleton.jsx
import React from 'react'
import styles from './Dashboard.module.css'

function Line({ width = '100%', height = 14, style = {} }) {
  return (
    <div
      className={styles.skelLine}
      style={{ width, height, ...style }}
    />
  )
}

function Circle({ size = 40, style = {} }) {
  return (
    <div
      className={styles.skelCircle}
      style={{ width: size, height: size, ...style }}
    />
  )
}

export default function DashboardSkeleton() {
  return (
    <div className={styles.container}>
      {/* Yuqori 4 ta stat card */}
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.statCard} ${styles.skelCard}`}>
            <Line width='40%' height={12} />
            <Line width='35%' height={26} style={{ marginTop: 10 }} />
            <Line width='60%' height={10} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>

      {/* Asosiy qism: graf + kalendar */}
      <div className={styles.dashboard}>
        <div>
          <div className={styles.mainGrid}>
            {/* Bo'y/massa grafigi card skeleton */}
            <div className={`${styles.chartCard} ${styles.skelCard}`}>
              <Line width='55%' height={16} />
              <Line width='40%' height={12} style={{ marginTop: 8 }} />

              {/* graf chizig'i joyi */}
              <div className={styles.skelGraphArea}>
                <Line width='100%' height='60%' />
              </div>
            </div>

            {/* Kalendar card skeleton */}
            <aside className={`${styles.calendarCard} ${styles.skelCard}`}>
              <div className={styles.skelCalendarHeader}>
                <Line width='50%' height={14} />
                <Line width='45%' height={12} />
              </div>

              <div className={styles.skelCalendarGrid}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className={styles.skelCalendarDay} />
                ))}
              </div>
            </aside>
          </div>

          {/* Pastki qism: Shaxsiy statistika + So'nggi faoliyat */}
          <div className={styles.bottomGrid} style={{ marginTop: 18 }}>
            {/* Shaxsiy statistika card */}
            <div className={`${styles.teamStats} ${styles.skelCard}`}>
              <Line width='45%' height={16} />
              <Line width='55%' height={12} style={{ marginTop: 8 }} />

              <div className={styles.skelBarRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={styles.skelStatBar}
                    style={{ height: 50 + i * 15 }}
                  />
                ))}
              </div>
            </div>

            {/* So'nggi faoliyat card */}
            <div className={`${styles.activityCard} ${styles.skelCard}`}>
              <Line width='40%' height={16} />
              <Line width='60%' height={12} style={{ marginTop: 6 }} />

              <div className={styles.skelActivityList}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.skelActivityItem}>
                    <Circle size={32} />
                    <div style={{ flex: 1 }}>
                      <Line width='80%' height={12} />
                      <Line
                        width='40%'
                        height={10}
                        style={{ marginTop: 6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
