"use client"

import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, SortingState, ColumnFiltersState } from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTableProps } from "@/types/document"

export function DataTable<TData, TValue>({ columns, data }: Readonly<DataTableProps<TData, TValue>>) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,

        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),

        state: {
            sorting,
            columnFilters,
        },
    })

    return (
        <div className="space-y-6">

            {/* TABLE */}
            <div className="rounded-xl border">

                <Table>

                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="cursor-pointer hover:bg-muted/40 transition-colors">

                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}

                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>

                        {table.getRowModel().rows?.length ? (

                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>

                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}

                                </TableRow>
                            ))

                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">No documents found.</TableCell>
                            </TableRow>
                        )}

                    </TableBody>

                </Table>

            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-4 py-4">

                <span className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} documents
                </span>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                </div>
            </div>

        </div>
    )
}