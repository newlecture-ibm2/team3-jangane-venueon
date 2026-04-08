import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  columns: string; // e.g. "1fr 120px 120px 88px 88px"
  children: React.ReactNode;
}

export const Table = ({ columns, children }: TableProps) => {
  return (
    <div
      className={styles.tableContainer}
      style={{ '--table-columns': columns } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export const TableHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.tableHeader}>{children}</div>;
};

export const TableRow = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.tableRow}>{children}</div>;
};

export const TableCell = ({
  children,
  header = false,
}: {
  children?: React.ReactNode;
  header?: boolean;
}) => {
  return (
    <div className={header ? styles.headerItem : styles.rowItem}>
      {children}
    </div>
  );
};
