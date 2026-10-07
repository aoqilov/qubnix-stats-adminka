import { useTranslation } from "react-i18next";
import { Pagination, IconButton, Text, Select, useListCollection } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CusPaginationProps {
  count: number;
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  siblingCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageText?: boolean;
  showSizeSelect?: boolean;
  pageSizeOptions?: number[];
  size?: "xs" | "sm" | "md";
}

// ─── Button base style ────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  borderColor: "var(--border-default)",
  color: "var(--text-2)",
  background: "var(--bg-input)",
  borderWidth: 1,
  borderStyle: "solid",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CusPagination({
  count,
  pageSize = 10,
  page,
  defaultPage = 1,
  siblingCount = 1,
  onPageChange,
  onPageSizeChange,
  showPageText = false,
  showSizeSelect = false,
  pageSizeOptions = [5, 10, 20, 50],
  size = "sm",
}: CusPaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const sizeItems = pageSizeOptions.map((n) => ({
    label: String(n),
    value: String(n),
  }));
  const { collection } = useListCollection({ initialItems: sizeItems });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Слева: количество записей на странице */}
      {showSizeSelect && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {t("ui.pagination.perPage")}
          </Text>
          <Select.Root
            collection={collection}
            size="xs"
            defaultValue={[String(pageSize)]}
            width="88px"
            onValueChange={(d) => onPageSizeChange?.(Number(d.value[0]))}
          >
            <Select.Control>
              <Select.Trigger
                bg="var(--bg-input)"
                borderColor="var(--border-default)"
                color="var(--text-default)"
              >
                <Select.ValueText />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content
                bg="var(--bg-second)"
                borderColor="var(--border-default)"
              >
                {sizeItems.map((item) => (
                  <Select.Item
                    key={item.value}
                    item={item}
                    color="var(--text-default)"
                    _highlighted={{ bg: "var(--bg-hover)" }}
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </div>
      )}

      {/* Справа: пагинация + текст */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        {showPageText && (
          <Text style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {t("ui.pagination.totalPages", { count: totalPages })}
          </Text>
        )}

        <Pagination.Root
          count={count}
          pageSize={pageSize}
          page={page}
          defaultPage={defaultPage}
          siblingCount={siblingCount}
          onPageChange={(e) => onPageChange?.(e.page)}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          {/* Prev */}
          <Pagination.PrevTrigger asChild>
            <IconButton
              aria-label={t("ui.pagination.prev")}
              size={size}
              style={btnStyle}
              variant="outline"
            >
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          {/* Page numbers */}
          <Pagination.Items
            render={(pg) => {
              const isActive = pg.value === page;
              return (
                <Pagination.Item key={pg.value} value={pg.value} type="page" asChild>
                  <IconButton
                    aria-label={t("ui.pagination.page", { page: pg.value })}
                    size={size}
                    variant="outline"
                    style={
                      isActive
                        ? { background: "var(--color-blue)", borderColor: "var(--color-blue)", color: "var(--text-on-accent)", fontWeight: 700, borderWidth: 1, borderStyle: "solid" }
                        : btnStyle
                    }
                  >
                    {pg.value}
                  </IconButton>
                </Pagination.Item>
              );
            }}
            ellipsis={
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  padding: "0 4px",
                  userSelect: "none",
                }}
              >
                ···
              </span>
            }
          />

          {/* Next */}
          <Pagination.NextTrigger asChild>
            <IconButton
              aria-label={t("ui.pagination.next")}
              size={size}
              style={btnStyle}
              variant="outline"
            >
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </Pagination.Root>
      </div>
    </div>
  );
}
