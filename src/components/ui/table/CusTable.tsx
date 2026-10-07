import { useTranslation } from "react-i18next";
import { Table } from "@chakra-ui/react";
import { useId, useState, type ReactNode } from "react";
import { LuArrowUp, LuArrowDown, LuArrowUpDown } from "react-icons/lu";
import { CusCheckbox } from "../inputs/CusCheckbox";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  children?: ColumnDef<T>[];
}

interface CusTableProps<T extends { id: number }> {
  data: T[];
  columns: ColumnDef<T>[];

  variant?: "line" | "outline";
  size?: "sm" | "md" | "lg";

  striped?: boolean;
  interactive?: boolean;
  stickyHeader?: boolean;
  showColumnBorder?: boolean;

  label?: string;
  isLoading?: boolean;
  emptyText?: string;
  caption?: string;
  maxH?: string;

  onRowClick?: (row: T, index: number) => void;

  selectable?: boolean;
  selectedRows?: number[];
  onSelectionChange?: (ids: number[]) => void;
  onSelectionRowsChange?: (rows: T[]) => void;

  colorHeader?: string;
  colorTextHeader?: string;
  colorTextHeaderHover?: string;
  colorHeaderHover?: string;

  colorBody?: string;
  colorBodyHover?: string;
}

type SortDir = "asc" | "desc" | null;

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function getLeafCount<T>(col: ColumnDef<T>): number {
  if (!col.children?.length) return 1;
  return col.children.reduce((s, c) => s + getLeafCount(c), 0);
}

function getTreeDepth<T>(col: ColumnDef<T>): number {
  if (!col.children?.length) return 1;
  return 1 + Math.max(...col.children.map(getTreeDepth));
}

function getColumnsAtLevel<T>(cols: ColumnDef<T>[], level: number): ColumnDef<T>[] {
  if (level === 0) return cols;
  return cols.flatMap((c) =>
    c.children?.length ? getColumnsAtLevel(c.children, level - 1) : [],
  );
}

function getLeafColumns<T>(cols: ColumnDef<T>[]): ColumnDef<T>[] {
  return cols.flatMap((c) =>
    c.children?.length ? getLeafColumns(c.children) : [c],
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CusTable<T extends { id: number }>({
  data,
  columns,
  variant = "line",
  size = "md",
  striped = false,
  interactive = false,
  stickyHeader = false,
  showColumnBorder = false,
  label,
  isLoading = false,
  emptyText,
  caption,
  maxH,
  onRowClick,
  selectable = false,
  selectedRows,
  onSelectionChange,
  onSelectionRowsChange,
  colorHeader = "var(--bg-hover)",
  colorTextHeader,
  colorTextHeaderHover,
  colorHeaderHover,
  colorBody,
  colorBodyHover = "var(--bg-hover)",
}: CusTableProps<T>) {
  const { t } = useTranslation();
  const resolvedEmptyText = emptyText ?? t("ui.table.empty");
  const uid = useId().replace(/:/g, "");
  const scope = `cus-table-${uid}`;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const selected = selectedRows ?? internalSelected;

  const setSelected = (nextIds: number[]) => {
    setInternalSelected(nextIds);
    onSelectionChange?.(nextIds);
    if (onSelectionRowsChange) {
      onSelectionRowsChange(data.filter((r) => nextIds.includes(r.id)));
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const maxDepth   = columns.length ? Math.max(...columns.map(getTreeDepth)) : 1;
  const leafCols   = getLeafColumns(columns);
  const colSpanTotal = leafCols.length + (selectable ? 1 : 0);

  // ── Sort ───────────────────────────────────────────────────────────────────

  function handleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const isEmpty = !isLoading && sorted.length === 0;

  // ── Selection ──────────────────────────────────────────────────────────────

  const allSelected  = sorted.length > 0 && sorted.every((r) => selected.includes(r.id));
  const someSelected = selected.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : sorted.map((r) => r.id));
  }
  function toggleRow(id: number) {
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {label && (
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-default)", marginBottom: 8 }}>
          {label}
        </p>
      )}

      <style>{`
        .${scope} th { ${colorHeader ? `background:${colorHeader} !important;` : ""} ${colorTextHeader ? `color:${colorTextHeader};` : ""} }
        .${scope} th:hover { ${colorHeaderHover ? `background:${colorHeaderHover};` : ""} ${colorTextHeaderHover ? `color:${colorTextHeaderHover};` : ""} }
        .${scope} tbody tr { ${colorBody ? `background:${colorBody};` : ""} }
        .${scope} tbody tr:hover { ${colorBodyHover ? `background:${colorBodyHover} !important;` : ""} }
      `}</style>

      <Table.ScrollArea maxH={maxH} borderRadius="md" style={{ width: "100%" }} className={scope}>
        <Table.Root
          variant={variant}
          size={size}
          striped={striped}
          interactive={interactive || !!onRowClick}
          stickyHeader={stickyHeader}
          showColumnBorder={showColumnBorder}
        >
          {caption && (
            <Table.Caption style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {caption}
            </Table.Caption>
          )}

          {/* ── Header ── */}
          <Table.Header>
            {Array.from({ length: maxDepth }, (_, level) => (
              <Table.Row key={level}>
                {/* Checkbox — only first header row, spans all rows */}
                {level === 0 && selectable && (
                  <Table.ColumnHeader
                    width={14}
                    rowSpan={maxDepth}
                  >
                    <CusCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={() => toggleAll()}
                      size="lg"
                    />
                  </Table.ColumnHeader>
                )}

                {getColumnsAtLevel(columns, level).map((col) => {
                  const isLeaf   = !col.children?.length;
                  const colSpan  = getLeafCount(col);
                  const rowSpan  = isLeaf ? maxDepth - level : 1;
                  const isSortable = isLeaf && !!col.sortable;

                  return (
                    <Table.ColumnHeader
                      key={`${col.key}-${level}`}
                      width={isLeaf ? col.width : undefined}
                      textAlign={col.align ?? (isLeaf ? "left" : "center")}
                      colSpan={colSpan > 1 ? colSpan : undefined}
                      rowSpan={rowSpan > 1 ? rowSpan : undefined}
                      style={{
                        cursor:      isSortable ? "pointer" : undefined,
                        userSelect:  isSortable ? "none"    : undefined,
                        color:       "var(--text-muted)",
                        fontSize:    11,
                        fontWeight:  600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        verticalAlign: "middle",
                      }}
                      onClick={isSortable ? () => handleSort(col.key) : undefined}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {col.header}
                        {isSortable && (
                          <span style={{ opacity: 0.5, display: "flex" }}>
                            {sortKey === col.key ? (
                              sortDir === "asc"
                                ? <LuArrowUp size={11} />
                                : <LuArrowDown size={11} />
                            ) : (
                              <LuArrowUpDown size={11} />
                            )}
                          </span>
                        )}
                      </span>
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>

          {/* ── Body ── */}
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={colSpanTotal} textAlign="center"
                  style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  {t("common.states.loading")}
                </Table.Cell>
              </Table.Row>
            ) : isEmpty ? (
              <Table.Row>
                <Table.Cell colSpan={colSpanTotal} textAlign="center"
                  style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  {resolvedEmptyText}
                </Table.Cell>
              </Table.Row>
            ) : (
              sorted.map((row, rowIdx) => {
                const isSelected = selected.includes(row.id);
                return (
                  <Table.Row
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row, rowIdx) : undefined}
                    style={{
                      cursor:     onRowClick ? "pointer" : undefined,
                      color:      "var(--text-default)",
                      background: isSelected ? "var(--bg-hover)" : undefined,
                    }}
                  >
                    {selectable && (
                      <Table.Cell onClick={(e) => e.stopPropagation()}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <CusCheckbox
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            size="lg"
                          />
                        </div>
                      </Table.Cell>
                    )}
                    {/* Use only leaf columns for body cells */}
                    {leafCols.map((col) => (
                      <Table.Cell key={col.key} textAlign={col.align ?? "left"} style={{ fontSize: 13 }}>
                        {col.render
                          ? col.render(row, rowIdx)
                          : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  );
}
