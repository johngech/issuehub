import { Box, Button, Flex, Skeleton, Table, Text } from "@radix-ui/themes";
import { useNavigate } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { User } from "#/hooks/use-users";
import { useUsers } from "#/hooks/use-users";
import { RoleBadge } from "./ui/role-badge";
import { StatusBadge } from "./ui/status-badge";

interface UsersTableProps {
  search?: string;
}

const SORT_ICONS = {
  asc: ChevronUp,
  desc: ChevronDown,
  none: ChevronsUpDown,
} as const;

type SortDirection = { direction: "asc" | "desc" | false };

function SortIcon({ direction }: Readonly<SortDirection>) {
  const Icon = SORT_ICONS[direction === false ? "none" : direction];
  return <Icon size={14} />;
}

function getCellClass(hideOnMobile: boolean) {
  return hideOnMobile
    ? "hidden md:!table-cell"
    : "whitespace-normal";
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => {
      return (
        <Flex align="center" gap="1" className="cursor-pointer select-none">
          User Details
          <SortIcon direction={column.getIsSorted()} />
        </Flex>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Flex direction="column" gap="2">
          <Text weight="bold">{user.name}</Text>
          <Text size="2" color="gray" className="break-all">
            {user.email}
          </Text>
          <Flex gap="2" align="center" className="md:hidden">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </Flex>
        </Flex>
      );
    },
    enableSorting: true,
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => {
      return (
        <Flex align="center" gap="1" className="cursor-pointer select-none">
          Role & Status
          <SortIcon direction={column.getIsSorted()} />
        </Flex>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Flex gap="2" align="center">
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </Flex>
      );
    },
    enableSorting: true,
    meta: { hideOnMobile: true },
  }),
];

const UsersTable = ({ search }: UsersTableProps) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isPending } = useUsers({ search: search || undefined });

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isPending) return <UsersTableSkeleton />;

  const isEmpty = table.getRowModel().rows.length === 0;
  const totalUsers = data?.pagination.total ?? 0;
  const hasMultiplePages = table.getPageCount() > 1;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <Box className="mt-6 rounded-lg">
      <Box className="overflow-x-auto rounded-lg">
        <Table.Root variant="surface" className="min-w-[320px]">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const hideOnMobile = (
                    header.column.columnDef.meta as { hideOnMobile?: boolean }
                  )?.hideOnMobile;
                  return (
                    <Table.ColumnHeaderCell
                      key={header.id}
                      className={getCellClass(hideOnMobile ?? false)}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {isEmpty && (
              <Table.Row>
                <Table.Cell>
                  <Text color="gray">No users found.</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {!isEmpty &&
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    navigate({
                      to: "/admin/users/$id",
                      params: { id: row.original.id },
                    })
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const hideOnMobile = (
                      cell.column.columnDef.meta as { hideOnMobile?: boolean }
                    )?.hideOnMobile;
                    return (
                      <Table.Cell
                        key={cell.id}
                        className={getCellClass(hideOnMobile ?? false)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex
        direction={{ initial: "column", sm: "row" }}
        justify="between"
        align={{ initial: "start", sm: "center" }}
        gap="2"
        mt="4"
        mb="2"
      >
        <Text size="2" color="gray">
          {totalUsers} {pluralize(totalUsers, "user", "users")} total
        </Text>
        {hasMultiplePages && (
          <Flex
            direction={{ initial: "column", sm: "row" }}
            gap="2"
            align="center"
            width={{ initial: "100%", sm: "auto" }}
          >
            <Text size="2" color="gray" className="text-center sm:text-left">
              Page {currentPage} of {totalPages}
            </Text>
            <Flex gap="2" justify="center">
              <Button
                size="1"
                variant="soft"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </Button>
              <Button
                size="1"
                variant="soft"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                size="1"
                variant="soft"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
              <Button
                size="1"
                variant="soft"
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

function UsersTableSkeleton() {
  return (
    <Box>
      {[1, 2, 3, 4, 5].map((id) => (
        <Skeleton key={`skeleton-row-${id}`} height="64px" mb="2" />
      ))}
    </Box>
  );
}
export default UsersTable;
