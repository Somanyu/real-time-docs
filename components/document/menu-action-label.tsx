"use client"

import { MenuActionLabelProps } from "@/types/document"

export function MenuActionLabel({
    className,
    icon: Icon,
    iconClassName,
    label,
}: Readonly<MenuActionLabelProps>) {
    return (
        <div className={className}>
            <Icon className={iconClassName} />
            <span>{label}</span>
        </div>
    )
}
