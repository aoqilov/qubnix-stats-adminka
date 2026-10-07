import React from "react";
import { Breadcrumb } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export interface BreadCrumbItem {
  label: string;
  to?: string;
}

interface CusBreadCrumbProps {
  items: BreadCrumbItem[];
  size?: "sm" | "md" | "lg";
  separator?: React.ReactNode;
}

export function CusBreadCrumb({
  items,
  size = "sm",
  separator,
}: CusBreadCrumbProps) {
  return (
    <Breadcrumb.Root size={size}>
      <Breadcrumb.List>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${i}`}>
              <Breadcrumb.Item>
                {isLast ? (
                  <Breadcrumb.CurrentLink style={{ color: "var(--color-blue)", fontWeight: 500 }}>
                    {item.label}
                  </Breadcrumb.CurrentLink>
                ) : (
                  <Breadcrumb.Link asChild>
                    <Link to={item.to ?? "#"}>{item.label}</Link>
                  </Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
              {!isLast && (
                <Breadcrumb.Separator>{separator}</Breadcrumb.Separator>
              )}
            </React.Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
