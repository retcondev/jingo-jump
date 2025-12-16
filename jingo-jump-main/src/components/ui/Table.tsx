import { forwardRef } from "react";

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table ref={ref} className={`w-full ${className}`} {...props}>
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = "Table";

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500 ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = "TableHeader";

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={`divide-y divide-gray-100 ${className}`} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = "", interactive = true, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`${interactive ? "transition-colors hover:bg-gray-50" : ""} ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = "TableRow";

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <th ref={ref} className={`px-6 py-4 ${className}`} {...props}>
        {children}
      </th>
    );
  }
);

TableHead.displayName = "TableHead";

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <td ref={ref} className={`px-6 py-4 text-sm text-gray-600 ${className}`} {...props}>
        {children}
      </td>
    );
  }
);

TableCell.displayName = "TableCell";
